from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.api.deps import get_db, get_current_user, require_manager_or_higher
from app.models.entities import User, Task, TaskAssignment, AvailabilityRecord, AuditLog
from app.services.ai_orchestrator import AIOrchestrator

router = APIRouter()

@router.post("/simulate-leave")
def simulate_employee_leave(
    user_id: int,
    reason: str = "Emergency Medical Leave (Hackathon Demo)",
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    HACKATHON DEMO CONTROL:
    Simulates employee suddenly becoming unavailable/on emergency leave.
    AI Conflict Detection Agent will detect impacted tasks, search candidate replacements,
    execute or propose rescheduling, notify stakeholders, and record to audit log.
    """
    user = db.query(User).filter(User.id == user_id, User.org_id == current_user.org_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    rec = (
        db.query(AvailabilityRecord)
        .filter(AvailabilityRecord.user_id == user.id, AvailabilityRecord.date_str == today)
        .first()
    )
    if rec:
        rec.status = "ON_LEAVE"
        rec.reason = reason
    else:
        rec = AvailabilityRecord(
            user_id=user.id,
            date_str=today,
            status="ON_LEAVE",
            reason=reason,
            created_at=datetime.now(timezone.utc)
        )
        db.add(rec)
    db.commit()

    orchestrator = AIOrchestrator(db, current_user.org_id)
    reschedule_results = orchestrator.handle_employee_unavailability(user_id=user.id, reason=reason)

    return {
        "status": "success",
        "message": f"Simulated leave for {user.full_name}. AI detected and handled affected task conflicts.",
        "affected_tasks": reschedule_results
    }

@router.post("/simulate-delay")
def simulate_task_delay(
    task_id: int,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    HACKATHON DEMO CONTROL:
    Simulates a task falling critically behind schedule (e.g. deadline is near but progress is low).
    Triggers AI Monitoring Agent to raise an automatic Level 1/2 Escalation.
    """
    task = db.query(Task).filter(Task.id == task_id, Task.org_id == current_user.org_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Shift deadline to right now and keep progress low
    task.deadline = datetime.now(timezone.utc) - timedelta(hours=2)
    task.status = "DELAYED"
    
    assignment = db.query(TaskAssignment).filter(TaskAssignment.task_id == task.id).order_by(TaskAssignment.id.desc()).first()
    if assignment:
        assignment.status = "DELAYED"
        assignment.progress_percent = 25 # Low progress past deadline

    db.commit()

    orchestrator = AIOrchestrator(db, current_user.org_id)
    esc = orchestrator.trigger_escalation(
        task_id=task.id,
        reason=f"Task completion is only 25% while 100% of allocated schedule has expired (Simulated Overdue).",
        level=2
    )

    return {
        "status": "success",
        "message": f"Task {task.task_code} marked overdue. Level 2 Escalation triggered by AI Monitoring Agent.",
        "escalation_id": esc.id
    }

@router.post("/simulate-overload")
def simulate_workload_overload(
    user_id: int,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    HACKATHON DEMO CONTROL:
    Adds heavy active assignments to user to simulate 90%+ capacity overload.
    Allows testing of AI Workload Balancing engine favoring unburdened colleagues.
    """
    user = db.query(User).filter(User.id == user_id, User.org_id == current_user.org_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc)
    dummy_task = Task(
        task_code=f"TSK-LOAD-{user.id}",
        org_id=user.org_id,
        department_id=user.department_id,
        title="High-Capacity System Overhaul (Simulated Load)",
        description="Simulated heavy workload assignment to test capacity constraints.",
        priority="HIGH",
        status="IN_PROGRESS",
        start_date=now,
        deadline=now + timedelta(days=5),
        estimated_duration_hours=36.0, # 90% of 40 hr week
        created_by_user_id=current_user.id
    )
    db.add(dummy_task)
    db.flush()

    assign = TaskAssignment(
        task_id=dummy_task.id,
        employee_id=user.id,
        assigned_by_user_id=current_user.id,
        assigned_at=now,
        status="IN_PROGRESS",
        progress_percent=20
    )
    db.add(assign)
    db.commit()

    return {
        "status": "success",
        "message": f"Assigned 36 hours of simulated work to {user.full_name}. Current workload is now ~90%."
    }
