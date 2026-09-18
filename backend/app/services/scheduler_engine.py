from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.entities import User, Task, TaskAssignment, AvailabilityRecord, EmployeeSkill, Skill, TaskRequirement
from app.core.config import settings

def calculate_employee_workload(db: Session, user_id: int) -> float:
    """
    Calculate an employee's current active workload percentage (0% to 100%+).
    Based on currently active, incomplete assigned tasks.
    """
    active_assignments = (
        db.query(TaskAssignment)
        .join(Task, TaskAssignment.task_id == Task.id)
        .filter(
            TaskAssignment.employee_id == user_id,
            TaskAssignment.status.in_(["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"])
        )
        .all()
    )
    
    total_hours = sum(a.task.estimated_duration_hours for a in active_assignments if a.task)
    user = db.query(User).filter(User.id == user_id).first()
    max_hours = user.max_weekly_hours if user and user.max_weekly_hours else 40.0
    
    # 40 hours per week nominal baseline
    workload_pct = min(100.0, (total_hours / max_hours) * 100.0)
    return round(workload_pct, 1)

def check_employee_availability(db: Session, user_id: int, target_date: datetime) -> Tuple[bool, str]:
    """
    Check if employee is available on target date.
    Returns (is_available, status_string)
    """
    date_str = target_date.strftime("%Y-%m-%d")
    record = (
        db.query(AvailabilityRecord)
        .filter(
            AvailabilityRecord.user_id == user_id,
            AvailabilityRecord.date_str == date_str
        )
        .first()
    )
    if record and record.status in ["ON_LEAVE", "UNAVAILABLE", "SICK", "EMERGENCY"]:
        return False, record.status
    return True, "AVAILABLE"

def score_candidate(
    db: Session,
    candidate: User,
    task: Task,
    task_requirements: List[TaskRequirement]
) -> Dict[str, Any]:
    """
    Evaluates candidate against task constraints and computes transparent explainable score.
    Candidate Score = 
      Skill Match (30%) + Department Match (20%) + Availability (20%) 
      + Experience (10%) + Workload Balance (10%) + Schedule Fit (10%)
    """
    # 1. Skill Matching (30%)
    req_skill_ids = [r.skill_id for r in task_requirements]
    candidate_skills = {es.skill_id: es for es in candidate.skills}
    
    matched_skill_names = []
    missing_skill_names = []
    
    if req_skill_ids:
        matched_count = 0
        proficiency_sum = 0.0
        
        for req in task_requirements:
            skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
            skill_name = skill.name if skill else f"Skill-{req.skill_id}"
            
            if req.skill_id in candidate_skills:
                emp_skill = candidate_skills[req.skill_id]
                matched_count += 1
                matched_skill_names.append(skill_name)
                # Compare proficiency
                prof_ratio = min(1.0, emp_skill.proficiency_level / max(1, req.min_proficiency))
                proficiency_sum += prof_ratio
            else:
                missing_skill_names.append(skill_name)
        
        overlap_ratio = matched_count / len(req_skill_ids)
        avg_proficiency = (proficiency_sum / matched_count) if matched_count > 0 else 0.0
        skill_score = (overlap_ratio * 0.7 + avg_proficiency * 0.3) * 100.0
    else:
        # No specific skill constraint
        skill_score = 90.0
        matched_skill_names.append("General Capability")

    # 2. Department Match (20%)
    if task.department_id is None or candidate.department_id == task.department_id:
        dept_score = 100.0
    else:
        # Cross-department capability
        dept_score = 35.0

    # 3. Availability (20%)
    is_avail, avail_status = check_employee_availability(db, candidate.id, task.deadline or datetime.now(timezone.utc))
    avail_score = 100.0 if is_avail else 0.0

    # 4. Experience Match (10%)
    min_exp_needed = max([r.min_experience for r in task_requirements], default=1.0)
    exp_ratio = candidate.experience_years / max(1.0, min_exp_needed)
    exp_score = min(100.0, exp_ratio * 75.0)

    # 5. Workload Balance (10%)
    current_workload = calculate_employee_workload(db, candidate.id)
    # Lower workload gets higher score (inverses load)
    if current_workload <= 20:
        workload_score = 100.0
    elif current_workload <= 50:
        workload_score = 80.0
    elif current_workload <= 75:
        workload_score = 55.0
    elif current_workload <= 90:
        workload_score = 30.0
    else:
        workload_score = 5.0 # Overloaded

    # 6. Schedule / Shift Fit (10%)
    if not task.shift or task.shift == candidate.current_shift:
        schedule_score = 100.0
    elif candidate.current_shift == "General":
        schedule_score = 70.0
    else:
        schedule_score = 40.0

    # Weighted aggregate score
    total_score = (
        skill_score * settings.WEIGHT_SKILL +
        dept_score * settings.WEIGHT_DEPARTMENT +
        avail_score * settings.WEIGHT_AVAILABILITY +
        exp_score * settings.WEIGHT_EXPERIENCE +
        workload_score * settings.WEIGHT_WORKLOAD +
        schedule_score * settings.WEIGHT_SCHEDULE_FIT
    )

    # Penalize if employee is unavailable
    if not is_avail:
        total_score = min(total_score, 25.0)

    # Human-readable justification explanation
    reasons = []
    if skill_score >= 80:
        reasons.append(f"High required skill match ({int(skill_score)}%)")
    elif skill_score >= 50:
        reasons.append(f"Partial skill coverage ({int(skill_score)}%)")
    else:
        reasons.append("Lacks primary required skill set")

    if dept_score == 100:
        reasons.append("Aligned with primary department")
    else:
        reasons.append("Cross-department candidate")

    if is_avail:
        reasons.append(f"Available during required schedule (Workload: {current_workload}%)")
    else:
        reasons.append(f"Unavailable ({avail_status})")

    if candidate.experience_years >= min_exp_needed:
        reasons.append(f"{candidate.experience_years} years relevant experience")

    reason_summary = " • ".join(reasons)

    return {
        "candidate": candidate,
        "match_score": round(total_score, 1),
        "breakdown": {
            "skill_match": round(skill_score, 1),
            "department_match": round(dept_score, 1),
            "availability_match": round(avail_score, 1),
            "experience_match": round(exp_score, 1),
            "workload_balance": round(workload_score, 1),
            "schedule_fit": round(schedule_score, 1)
        },
        "is_available": is_avail,
        "avail_status": avail_status,
        "current_workload": current_workload,
        "experience_years": candidate.experience_years,
        "matched_skills": matched_skill_names,
        "missing_skills": missing_skill_names,
        "reason": reason_summary
    }

def rank_candidates_for_task(db: Session, task: Task) -> List[Dict[str, Any]]:
    """
    Ranks all eligible active users within the organization for the given task.
    """
    requirements = db.query(TaskRequirement).filter(TaskRequirement.task_id == task.id).all()
    
    # Query candidate users in the organization with Employee or Supervisor role
    candidates = (
        db.query(User)
        .filter(
            User.org_id == task.org_id,
            User.is_active == True
        )
        .all()
    )

    scored = []
    for cand in candidates:
        # Don't assign to higher authority
        if cand.role and cand.role.role_level == "HIGHER_AUTHORITY":
            continue
        score_info = score_candidate(db, cand, task, requirements)
        scored.append(score_info)

    # Sort descending by match score
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored
