from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.api.deps import get_db, get_current_user, require_higher_authority, require_manager_or_higher
from app.models.entities import User, AvailabilityRecord, EmployeeSkill, Role, Department, Skill
from app.schemas.schemas import UserOut, UserBase, AvailabilityUpdate, EmployeeSkillOut
from app.services.scheduler_engine import calculate_employee_workload, check_employee_availability
from app.services.ai_orchestrator import AIOrchestrator
from app.core.security import get_password_hash

router = APIRouter()

def format_user_out(db: Session, u: User) -> dict:
    workload = calculate_employee_workload(db, u.id)
    is_avail, avail_status = check_employee_availability(db, u.id, datetime.now(timezone.utc))
    skills_out = []
    for es in u.skills:
        skill_name = es.skill.name if es.skill else "Unknown"
        skills_out.append({
            "skill_id": es.skill_id,
            "skill_name": skill_name,
            "proficiency_level": es.proficiency_level,
            "years_experience": es.years_experience
        })
    return {
        "id": u.id,
        "user_code": u.user_code,
        "org_id": u.org_id,
        "department_id": u.department_id,
        "department_name": u.department.name if u.department else None,
        "role_id": u.role_id,
        "role_name": u.role.name if u.role else None,
        "role_level": u.role.role_level if u.role else "EMPLOYEE",
        "username": u.username,
        "email": u.email,
        "full_name": u.full_name,
        "experience_years": u.experience_years,
        "current_shift": u.current_shift,
        "max_weekly_hours": u.max_weekly_hours,
        "is_active": u.is_active,
        "current_workload_percent": workload,
        "current_availability_status": avail_status,
        "skills": skills_out
    }

@router.get("/", response_model=List[UserOut])
def list_users(
    department_id: Optional[int] = None,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    List personnel. 
    Higher authority sees entire workforce.
    Manager sees department personnel.
    """
    query = db.query(User).filter(User.org_id == current_user.org_id, User.is_active == True)
    
    if current_user.role.role_level == "MANAGER":
        # Scoped to manager's department
        if current_user.department_id:
            query = query.filter(User.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(User.department_id == department_id)

    users = query.all()
    return [format_user_out(db, u) for u in users]

@router.get("/team", response_model=List[UserOut])
def get_my_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get teammates in the user's department"""
    if not current_user.department_id:
        return [format_user_out(db, current_user)]
    users = db.query(User).filter(
        User.org_id == current_user.org_id,
        User.department_id == current_user.department_id,
        User.is_active == True
    ).all()
    return [format_user_out(db, u) for u in users]

@router.get("/profile", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Employee self profile with skills and workload"""
    return format_user_out(db, current_user)

@router.post("/availability")
def update_availability(
    avail_in: AvailabilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update availability status or apply for leave.
    If employee becomes UNAVAILABLE or goes ON_LEAVE, triggers AI Conflict Detection Agent!
    """
    target_date = avail_in.date_str or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if record exists for this date
    rec = (
        db.query(AvailabilityRecord)
        .filter(AvailabilityRecord.user_id == current_user.id, AvailabilityRecord.date_str == target_date)
        .first()
    )
    if rec:
        rec.status = avail_in.status
        rec.reason = avail_in.reason
    else:
        rec = AvailabilityRecord(
            user_id=current_user.id,
            date_str=target_date,
            status=avail_in.status,
            reason=avail_in.reason,
            created_at=datetime.now(timezone.utc)
        )
        db.add(rec)
    
    db.commit()

    reschedule_results = []
    # If employee is going on leave or unavailable, orchestrator triggers automatic conflict detection!
    if avail_in.status in ["ON_LEAVE", "UNAVAILABLE", "SICK", "EMERGENCY"]:
        orchestrator = AIOrchestrator(db, current_user.org_id)
        reschedule_results = orchestrator.handle_employee_unavailability(
            user_id=current_user.id, 
            reason=f"{avail_in.status}: {avail_in.reason or 'Personal Leave'}"
        )

    return {
        "message": f"Availability updated to {avail_in.status}",
        "date": target_date,
        "reschedule_triggered": len(reschedule_results) > 0,
        "affected_tasks": reschedule_results
    }
