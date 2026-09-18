from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.entities import (
    Task, User, TaskAssignment, TaskRequirement, AIRecommendation, 
    Escalation, Notification, AuditLog, AIActivityLog, AvailabilityRecord, Department, Skill
)
from app.services.scheduler_engine import rank_candidates_for_task, calculate_employee_workload

class AIOrchestrator:
    """
    Central AI Multi-Agent Orchestrator coordinating:
    - Task Analysis Agent
    - Skill Matching Agent
    - Availability & Workload Agent
    - Scheduling Agent
    - Conflict & Rescheduling Agent
    - Monitoring & Escalation Agent
    """

    def __init__(self, db: Session, org_id: str):
        self.db = db
        self.org_id = org_id

    def log_activity(self, agent_name: str, action: str, details: str, task_id: Optional[int] = None):
        """Record an action into the transparent AI Activity Log"""
        log = AIActivityLog(
            org_id=self.org_id,
            task_id=task_id,
            agent_name=agent_name,
            action=action,
            details=details,
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(log)
        self.db.commit()

    def create_notification(self, user_id: int, title: str, message: str, notif_type: str = "INFO", link: Optional[str] = None):
        """Generate real in-app notification"""
        notif = Notification(
            org_id=self.org_id,
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            link=link,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(notif)
        self.db.commit()

    # --- Agent 1: Task Analysis & Decomposition Agent ---
    def analyze_and_decompose_task(self, title: str, description: str, department_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Understands requirements, infers priority, duration, and breaks complex tasks into subtasks.
        """
        self.log_activity("Task Analysis Agent", "Task Decomposition", f"Analyzing requirements for: '{title}'")

        # Intelligent decomposition heuristics based on keywords
        subtasks = []
        lower_title = title.lower()
        lower_desc = (description or "").lower()

        if "report" in lower_title or "audit" in lower_title:
            subtasks = [
                {"title": "Data Collection & Validation", "estimated_hours": 1.5, "status": "Pending"},
                {"title": "Analysis & Variance Checks", "estimated_hours": 2.0, "status": "Pending"},
                {"title": "Draft Review & Final Signoff", "estimated_hours": 1.0, "status": "Pending"}
            ]
        elif "patient" in lower_title or "emergency" in lower_title or "surgery" in lower_title or "ward" in lower_title:
            subtasks = [
                {"title": "Triage & Vitals Assessment", "estimated_hours": 1.0, "status": "Pending"},
                {"title": "Clinical Treatment & Medication", "estimated_hours": 3.0, "status": "Pending"},
                {"title": "Post-Care Documentation & Handoff", "estimated_hours": 1.0, "status": "Pending"}
            ]
        elif "deploy" in lower_title or "infrastructure" in lower_title or "migration" in lower_title:
            subtasks = [
                {"title": "Environment Pre-Flight & Backup", "estimated_hours": 1.5, "status": "Pending"},
                {"title": "Container Orchestration & Migration", "estimated_hours": 3.5, "status": "Pending"},
                {"title": "Health Checks & Traffic Cutover", "estimated_hours": 1.0, "status": "Pending"}
            ]
        elif "exam" in lower_title or "curriculum" in lower_title or "syllabus" in lower_title:
            subtasks = [
                {"title": "Question Paper Formulation", "estimated_hours": 2.0, "status": "Pending"},
                {"title": "Review by Academic Committee", "estimated_hours": 1.5, "status": "Pending"},
                {"title": "Invigilation & Logistics Setup", "estimated_hours": 1.5, "status": "Pending"}
            ]
        else:
            subtasks = [
                {"title": "Initial Preparation & Scope Review", "estimated_hours": 1.0, "status": "Pending"},
                {"title": "Core Execution Phase", "estimated_hours": 2.5, "status": "Pending"},
                {"title": "Verification & Reporting", "estimated_hours": 1.0, "status": "Pending"}
            ]

        inferred_priority = "HIGH" if any(k in lower_title or k in lower_desc for k in ["urgent", "critical", "emergency", "immediate", "deadline"]) else "MEDIUM"
        
        self.log_activity(
            "Task Analysis Agent", 
            "Decomposition Complete", 
            f"Generated {len(subtasks)} structured subtasks with inferred priority {inferred_priority}"
        )

        return {
            "inferred_priority": inferred_priority,
            "subtasks": subtasks,
            "complexity_level": "High" if len(subtasks) >= 3 else "Standard"
        }

    # --- Agent 2, 3, 4: Scheduling Agent Orchestration ---
    def generate_schedule_recommendation(self, task_id: int) -> Dict[str, Any]:
        """
        Runs the full AI Scheduling Lifecycle:
        1. Retrieves task requirements
        2. Evaluates employee skills, availability, and workloads
        3. Ranks candidates and produces explainable justification
        4. Saves recommendation in database
        """
        task = self.db.query(Task).filter(Task.id == task_id, Task.org_id == self.org_id).first()
        if not task:
            raise ValueError(f"Task with ID {task_id} not found in organization.")

        self.log_activity("Scheduling Agent", "Schedule Generation Started", f"Processing candidate pool for task '{task.title}'", task_id)

        # Retrieve requirements
        reqs = self.db.query(TaskRequirement).filter(TaskRequirement.task_id == task_id).all()
        req_count = len(reqs)
        self.log_activity("Skill Matching Agent", "Skill Taxonomy Check", f"Identified {req_count} constraint skills for evaluation", task_id)

        # Rank candidates
        ranked = rank_candidates_for_task(self.db, task)
        self.log_activity("Availability Agent", "Workload & Shift Scan", f"Evaluated {len(ranked)} active personnel for schedule conflicts", task_id)

        if not ranked:
            self.log_activity("Scheduling Agent", "No Candidates Found", "No active users found matching criteria", task_id)
            return {
                "task_id": task.id,
                "task_code": task.task_code,
                "recommended_employee": None,
                "alternative_employees": [],
                "reasoning_summary": "No eligible employees found in organization.",
                "conflicts": ["Zero active candidates in target organization."],
                "warnings": ["Please register or activate staff in this department."]
            }

        top_candidate_info = ranked[0]
        alternatives_info = ranked[1:3]

        # Check if top candidate is unavailable or has low score
        conflicts = []
        warnings = []
        if not top_candidate_info["is_available"]:
            conflicts.append(f"Top match {top_candidate_info['candidate'].full_name} is marked {top_candidate_info['avail_status']}.")
        if top_candidate_info["current_workload"] >= 80:
            warnings.append(f"Candidate {top_candidate_info['candidate'].full_name} is near capacity ({top_candidate_info['current_workload']}% workload).")

        # Format candidates for response
        def format_candidate(c_info):
            u = c_info["candidate"]
            dept_name = u.department.name if u.department else "General"
            role_name = u.role.name if u.role else "Staff"
            return {
                "user_id": u.id,
                "user_code": u.user_code,
                "full_name": u.full_name,
                "role_name": role_name,
                "department_name": dept_name,
                "match_score": c_info["match_score"],
                "breakdown": c_info["breakdown"],
                "reason": c_info["reason"],
                "is_available": c_info["is_available"],
                "current_workload": c_info["current_workload"],
                "experience_years": c_info["experience_years"],
                "matched_skills": c_info["matched_skills"],
                "missing_skills": c_info["missing_skills"]
            }

        rec_formatted = format_candidate(top_candidate_info)
        alts_formatted = [format_candidate(a) for a in alternatives_info]

        summary = (
            f"Recommended {rec_formatted['full_name']} ({rec_formatted['role_name']}) with {rec_formatted['match_score']}% overall match. "
            f"Criteria: {rec_formatted['reason']}."
        )

        # Save recommendation record in DB
        rec_record = AIRecommendation(
            task_id=task.id,
            recommended_user_id=rec_formatted["user_id"],
            match_score=rec_formatted["match_score"],
            breakdown_json=rec_formatted["breakdown"],
            reasoning_summary=summary,
            alternatives_json=alts_formatted,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(rec_record)
        
        # Update task status to SCHEDULED if PENDING
        if task.status == "PENDING":
            task.status = "SCHEDULED"

        self.db.commit()

        self.log_activity("Scheduling Agent", "Recommendation Generated", summary, task_id)

        return {
            "task_id": task.id,
            "task_code": task.task_code,
            "recommended_employee": rec_formatted,
            "alternative_employees": alts_formatted,
            "reasoning_summary": summary,
            "conflicts": conflicts,
            "warnings": warnings,
            "ai_autonomy_level": 1
        }

    # --- Agent 5: Conflict Detection & Automatic Rescheduling Agent ---
    def handle_employee_unavailability(self, user_id: int, reason: str = "Unspecified Leave") -> List[Dict[str, Any]]:
        """
        Triggered when an employee goes on leave or becomes unavailable.
        1. Identifies all affected active tasks
        2. Finds qualified replacement for each
        3. Generates rescheduling plan and notifications
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        self.log_activity(
            "Conflict Detection Agent", 
            "Employee Unavailability Detected", 
            f"Personnel {user.full_name} marked unavailable ({reason}). Scanning assigned tasks."
        )

        # Find active assignments
        active_assignments = (
            self.db.query(TaskAssignment)
            .filter(
                TaskAssignment.employee_id == user_id,
                TaskAssignment.status.in_(["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"])
            )
            .all()
        )

        reschedule_results = []

        for assignment in active_assignments:
            task = assignment.task
            self.log_activity(
                "Rescheduling Agent", 
                "Conflict Identified", 
                f"Task '{task.title}' (Code: {task.task_code}) requires replacement for {user.full_name}.",
                task.id
            )

            # Re-rank candidates (excluding the unavailable user)
            ranked = rank_candidates_for_task(self.db, task)
            eligible_replacements = [r for r in ranked if r["candidate"].id != user_id and r["is_available"]]

            if eligible_replacements:
                replacement_info = eligible_replacements[0]
                replacement_user = replacement_info["candidate"]

                # Mark assignment as REASSIGNED
                assignment.status = "REASSIGNED"
                assignment.notes = f"Reassigned: original assignee {user.full_name} became unavailable ({reason})."

                # Create new assignment for replacement
                new_assignment = TaskAssignment(
                    task_id=task.id,
                    employee_id=replacement_user.id,
                    assigned_by_user_id=None, # AI Agent assigned
                    assigned_at=datetime.now(timezone.utc),
                    status="ASSIGNED",
                    progress_percent=assignment.progress_percent, # Retain progress
                    notes=f"AI Auto-Rescheduled from {user.full_name} due to {reason}."
                )
                self.db.add(new_assignment)

                task.status = "ASSIGNED"

                # Notify replacement employee
                self.create_notification(
                    replacement_user.id,
                    f"Task Reassigned: {task.task_code}",
                    f"You have been assigned '{task.title}' as replacement for {user.full_name}. Priority: {task.priority}",
                    "REASSIGNMENT"
                )

                # Notify managers
                mgr_users = self.db.query(User).filter(User.org_id == self.org_id, User.department_id == task.department_id).all()
                for m in mgr_users:
                    if m.role and m.role.role_level in ["MANAGER", "HIGHER_AUTHORITY"]:
                        self.create_notification(
                            m.id,
                            f"AI Reschedule: {task.task_code}",
                            f"Task '{task.title}' automatically rescheduled from {user.full_name} to {replacement_user.full_name}.",
                            "REASSIGNMENT"
                        )

                # Log to audit log
                audit = AuditLog(
                    org_id=self.org_id,
                    user_id=user_id,
                    actor_name="AI Rescheduling Agent",
                    action="AUTO_RESCHEDULE_TASK",
                    target_type="Task",
                    target_id=task.task_code,
                    details=f"Reassigned from {user.full_name} to {replacement_user.full_name} (Match Score: {replacement_info['match_score']}%)"
                )
                self.db.add(audit)

                self.log_activity(
                    "Rescheduling Agent",
                    "Replacement Assigned",
                    f"Successfully rescheduled {task.task_code} to {replacement_user.full_name} ({replacement_info['match_score']}% match)",
                    task.id
                )

                reschedule_results.append({
                    "task_id": task.id,
                    "task_code": task.task_code,
                    "previous_assignee": user.full_name,
                    "new_assignee": replacement_user.full_name,
                    "match_score": replacement_info["match_score"],
                    "reason": replacement_info["reason"]
                })
            else:
                # No replacement found - trigger Level 2 escalation
                self.trigger_escalation(
                    task.id, 
                    reason=f"No qualified replacement available after {user.full_name} became unavailable.",
                    level=2
                )

        self.db.commit()
        return reschedule_results

    # --- Agent 6: Monitoring & Escalation Agent ---
    def monitor_tasks_and_detect_delays(self) -> List[Dict[str, Any]]:
        """
        Scans all active tasks:
        Checks elapsed time vs reported progress.
        If completion is 35% while 80% of allocated time has elapsed -> Warning & Escalation.
        """
        active_tasks = (
            self.db.query(Task)
            .filter(
                Task.org_id == self.org_id,
                Task.status.in_(["ASSIGNED", "IN_PROGRESS", "ACCEPTED"])
            )
            .all()
        )

        now = datetime.now(timezone.utc)
        flagged = []

        for task in active_tasks:
            # Check latest assignment
            assignment = (
                self.db.query(TaskAssignment)
                .filter(TaskAssignment.task_id == task.id)
                .order_by(TaskAssignment.id.desc())
                .first()
            )
            if not assignment:
                continue

            created = task.created_at.replace(tzinfo=timezone.utc) if task.created_at.tzinfo is None else task.created_at
            deadline = task.deadline.replace(tzinfo=timezone.utc) if task.deadline.tzinfo is None else task.deadline
            
            total_duration = (deadline - created).total_seconds()
            if total_duration <= 0:
                total_duration = 3600 # Fallback 1 hr

            elapsed = (now - created).total_seconds()
            time_elapsed_pct = min(100.0, max(0.0, (elapsed / total_duration) * 100.0))
            progress_pct = float(assignment.progress_percent)

            # Conflict condition: elapsed time > 70% and progress < 40%, or past deadline
            if now > deadline and progress_pct < 100.0:
                # Overdue
                task.status = "DELAYED"
                self.trigger_escalation(task.id, f"Task {task.task_code} is overdue by {round((now - deadline).total_seconds()/3600, 1)} hours.", level=2)
                flagged.append({"task_code": task.task_code, "reason": "OVERDUE", "elapsed_pct": 100, "progress_pct": progress_pct})
            elif time_elapsed_pct >= 70.0 and progress_pct <= 40.0:
                task.status = "DELAYED"
                warning_msg = f"Task completion is only {int(progress_pct)}% while {int(time_elapsed_pct)}% of allocated time has elapsed."
                self.trigger_escalation(task.id, warning_msg, level=1)
                flagged.append({"task_code": task.task_code, "reason": "SLOW_PROGRESS", "elapsed_pct": time_elapsed_pct, "progress_pct": progress_pct})

        self.db.commit()
        return flagged

    def trigger_escalation(self, task_id: int, reason: str, level: int = 1) -> Escalation:
        """
        Escalation hierarchy:
        Level 1: Employee -> Manager / Team Leader
        Level 2: Manager -> Department Head
        Level 3: Department Head -> Higher Authority (CEO/MD/Principal)
        """
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise ValueError("Task not found")

        task.status = "ESCALATED"

        # Determine target recipient based on level
        target_user = None
        if level == 1:
            # Find department manager
            target_user = (
                self.db.query(User)
                .join(User.role)
                .filter(User.org_id == self.org_id, User.department_id == task.department_id, User.role.has(role_level="MANAGER"))
                .first()
            )
        elif level == 2:
            # Find department head / senior manager
            target_user = (
                self.db.query(User)
                .join(User.role)
                .filter(User.org_id == self.org_id, User.role.has(role_level="MANAGER"))
                .first()
            )
        else: # Level 3
            # Find Higher Authority
            target_user = (
                self.db.query(User)
                .join(User.role)
                .filter(User.org_id == self.org_id, User.role.has(role_level="HIGHER_AUTHORITY"))
                .first()
            )

        target_user_id = target_user.id if target_user else None

        esc = Escalation(
            org_id=self.org_id,
            task_id=task_id,
            from_user_id=task.created_by_user_id,
            to_user_id=target_user_id,
            level=level,
            reason=reason,
            status="PENDING",
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(esc)

        # Send alert notification
        if target_user:
            self.create_notification(
                target_user.id,
                f"🚨 Level {level} Escalation: {task.task_code}",
                f"{reason} (Task: '{task.title}')",
                "ESCALATION"
            )

        self.log_activity(
            "Escalation Agent",
            f"Level {level} Escalation Triggered",
            f"Task {task.task_code} escalated to {target_user.full_name if target_user else 'Administration'}. Reason: {reason}",
            task.id
        )

        self.db.commit()
        return esc
