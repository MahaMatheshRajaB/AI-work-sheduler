from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.api.deps import get_db, get_current_user, require_manager_or_higher
from app.models.entities import Task, User, TaskAssignment, AIRecommendation, AuditLog
from app.schemas.schemas import AIScheduleResponse, ApproveAssignmentRequest, ReassignTaskRequest
from app.services.ai_orchestrator import AIOrchestrator
from app.services.scheduler_engine import rank_candidates_for_task

router = APIRouter()

@router.post("/generate", response_model=AIScheduleResponse)
def generate_ai_schedule(
    task_id: int,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    Triggers AI Scheduling Agent:
    Evaluates candidate pool against skills, availability, and workloads.
    Returns transparent match score breakdown and justification.
    """
    orchestrator = AIOrchestrator(db, current_user.org_id)
    try:
        rec_data = orchestrator.generate_schedule_recommendation(task_id)
        return rec_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/approve")
def approve_and_assign(
    req: ApproveAssignmentRequest,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    Manager or Higher Authority approves AI recommended schedule or assigns chosen candidate.
    Dispatches task, creates notification, and writes audit record.
    """
    task = db.query(Task).filter(Task.id == req.task_id, Task.org_id == current_user.org_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    employee = db.query(User).filter(User.id == req.employee_id, User.org_id == current_user.org_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Selected employee not found in organization")

    # Mark existing active assignments as REASSIGNED if any
    active_assignments = db.query(TaskAssignment).filter(
        TaskAssignment.task_id == task.id,
        TaskAssignment.status.in_(["ASSIGNED", "ACCEPTED", "IN_PROGRESS"])
    ).all()
    for a in active_assignments:
        a.status = "REASSIGNED"

    # Create new assignment
    assignment = TaskAssignment(
        task_id=task.id,
        employee_id=employee.id,
        assigned_by_user_id=current_user.id,
        assigned_at=datetime.now(timezone.utc),
        status="ASSIGNED",
        progress_percent=0,
        notes=req.notes or f"Assigned by {current_user.full_name} via AI Recommendation"
    )
    db.add(assignment)

    task.status = "ASSIGNED"

    # In-app notification for employee
    orchestrator = AIOrchestrator(db, current_user.org_id)
    orchestrator.create_notification(
        user_id=employee.id,
        title=f"New Task Assigned: {task.task_code}",
        message=f"You have been assigned '{task.title}'. Deadline: {task.deadline.strftime('%b %d, %Y %H:%M')}",
        notif_type="ASSIGNMENT"
    )

    # Audit log
    audit = AuditLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        actor_name=current_user.full_name,
        action="APPROVE_SCHEDULE_ASSIGNMENT",
        target_type="Task",
        target_id=task.task_code,
        details=f"Assigned task to {employee.full_name} ({employee.user_code})"
    )
    db.add(audit)

    orchestrator.log_activity(
        "Scheduling Agent",
        "Assignment Approved",
        f"Manager {current_user.full_name} approved assignment for {task.task_code} to {employee.full_name}",
        task.id
    )

    db.commit()
    return {
        "message": f"Task {task.task_code} successfully assigned to {employee.full_name}",
        "task_id": task.id,
        "employee_id": employee.id,
        "status": "ASSIGNED"
    }

@router.post("/reassign")
def reassign_task(
    req: ReassignTaskRequest,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    Manually reassign a task to an alternative employee.
    """
    task = db.query(Task).filter(Task.id == req.task_id, Task.org_id == current_user.org_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_emp = db.query(User).filter(User.id == req.new_employee_id, User.org_id == current_user.org_id).first()
    if not new_emp:
        raise HTTPException(status_code=404, detail="New employee not found")

    # Mark prior assignments as REASSIGNED
    priors = db.query(TaskAssignment).filter(TaskAssignment.task_id == task.id).all()
    prev_emp_name = "None"
    for p in priors:
        if p.status in ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"]:
            p.status = "REASSIGNED"
            prev_emp_name = p.employee.full_name if p.employee else "Unknown"

    assignment = TaskAssignment(
        task_id=task.id,
        employee_id=new_emp.id,
        assigned_by_user_id=current_user.id,
        assigned_at=datetime.now(timezone.utc),
        status="ASSIGNED",
        progress_percent=0,
        notes=f"Reassigned by {current_user.full_name}. Reason: {req.reason}"
    )
    db.add(assignment)
    task.status = "ASSIGNED"

    orchestrator = AIOrchestrator(db, current_user.org_id)
    orchestrator.create_notification(
        user_id=new_emp.id,
        title=f"Task Reassigned: {task.task_code}",
        message=f"You have been assigned '{task.title}' (Previously {prev_emp_name}). Reason: {req.reason}",
        notif_type="REASSIGNMENT"
    )

    audit = AuditLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        actor_name=current_user.full_name,
        action="MANUAL_REASSIGN_TASK",
        target_type="Task",
        target_id=task.task_code,
        details=f"Reassigned from {prev_emp_name} to {new_emp.full_name}. Reason: {req.reason}"
    )
    db.add(audit)

    orchestrator.log_activity(
        "Scheduling Agent",
        "Task Reassigned",
        f"Reassigned {task.task_code} to {new_emp.full_name}. Reason: {req.reason}",
        task.id
    )

    db.commit()
    return {"message": f"Task reassigned to {new_emp.full_name} successfully"}

@router.get("/calendar")
def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns calendar events for Day/Week/Month visualizations.
    Employees see their assigned tasks and deadlines.
    Managers and Higher Authority see all scheduled tasks in their scope.
    """
    role_level = current_user.role.role_level if current_user.role else "EMPLOYEE"
    
    query = db.query(Task).filter(Task.org_id == current_user.org_id)
    if role_level == "EMPLOYEE":
        query = query.join(Task.assignments).filter(TaskAssignment.employee_id == current_user.id)
    elif role_level == "MANAGER" and current_user.department_id:
        query = query.filter(Task.department_id == current_user.department_id)

    tasks = query.all()
    events = []

    for t in tasks:
        assignee_name = "Unassigned"
        assignee_id = None
        if t.assignments:
            latest = t.assignments[-1]
            assignee_name = latest.employee.full_name if latest.employee else "Unassigned"
            assignee_id = latest.employee_id

        events.append({
            "id": f"task-{t.id}",
            "title": f"[{t.task_code}] {t.title}",
            "start": (t.start_date or t.created_at).isoformat() if (t.start_date or t.created_at) else None,
            "end": t.deadline.isoformat() if t.deadline else None,
            "priority": t.priority,
            "status": t.status,
            "assignee": assignee_name,
            "assignee_id": assignee_id,
            "department": t.department.name if t.department else "General",
            "type": "TASK"
        })

    return events
