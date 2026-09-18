from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.api.deps import get_db, get_current_user, require_manager_or_higher
from app.models.entities import Task, TaskRequirement, TaskAssignment, User, Skill, AuditLog
from app.schemas.schemas import TaskOut, TaskCreate, TaskStatusUpdate, TaskAssignmentOut, TaskRequirementOut
from app.services.ai_orchestrator import AIOrchestrator

router = APIRouter()

def format_task_out(db: Session, task: Task) -> dict:
    dept_name = task.department.name if task.department else None
    role_name = task.required_role.name if task.required_role else None

    # Requirements
    reqs_out = []
    for r in task.requirements:
        skill_name = r.skill.name if r.skill else f"Skill {r.skill_id}"
        reqs_out.append({
            "skill_id": r.skill_id,
            "skill_name": skill_name,
            "min_proficiency": r.min_proficiency,
            "min_experience": r.min_experience
        })

    # Assignments
    assignments_out = []
    latest_assign = None
    for a in task.assignments:
        emp = a.employee
        item = {
            "id": a.id,
            "employee_id": a.employee_id,
            "employee_name": emp.full_name if emp else "Unknown",
            "employee_code": emp.user_code if emp else "",
            "assigned_at": a.assigned_at,
            "status": a.status,
            "progress_percent": a.progress_percent,
            "notes": a.notes,
            "completed_at": a.completed_at
        }
        assignments_out.append(item)
        if not latest_assign or a.id > latest_assign["id"]:
            latest_assign = item

    return {
        "id": task.id,
        "task_code": task.task_code,
        "org_id": task.org_id,
        "department_id": task.department_id,
        "department_name": dept_name,
        "required_role_id": task.required_role_id,
        "required_role_name": role_name,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "start_date": task.start_date,
        "deadline": task.deadline,
        "estimated_duration_hours": task.estimated_duration_hours,
        "location": task.location,
        "shift": task.shift,
        "special_instructions": task.special_instructions,
        "subtasks_json": task.subtasks_json,
        "ai_decomposition_json": task.ai_decomposition_json,
        "requirements": reqs_out,
        "assignments": assignments_out,
        "current_assignment": latest_assign,
        "created_at": task.created_at
    }

@router.get("/", response_model=List[TaskOut])
def list_tasks(
    status_filter: Optional[str] = None,
    department_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List tasks based on RBAC:
    - HIGHER_AUTHORITY: All organization tasks
    - MANAGER: Department tasks
    - EMPLOYEE: Tasks assigned to them
    """
    query = db.query(Task).filter(Task.org_id == current_user.org_id)

    role_level = current_user.role.role_level if current_user.role else "EMPLOYEE"

    if role_level == "EMPLOYEE":
        # Only tasks where user is assigned
        query = query.join(Task.assignments).filter(TaskAssignment.employee_id == current_user.id)
    elif role_level == "MANAGER":
        # Tasks in manager's department
        if current_user.department_id:
            query = query.filter(Task.department_id == current_user.department_id)
    else:
        # Higher Authority: optionally filter by department
        if department_id:
            query = query.filter(Task.department_id == department_id)

    if status_filter:
        query = query.filter(Task.status == status_filter.upper())

    tasks = query.order_by(Task.id.desc()).all()
    return [format_task_out(db, t) for t in tasks]

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve details for a single task"""
    task = db.query(Task).filter(Task.id == task_id, Task.org_id == current_user.org_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    role_level = current_user.role.role_level if current_user.role else "EMPLOYEE"
    if role_level == "EMPLOYEE":
        # Verify employee is assigned
        is_assigned = any(a.employee_id == current_user.id for a in task.assignments)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Forbidden: You are not assigned to this task")

    return format_task_out(db, task)

@router.post("/", response_model=TaskOut)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    Create a new task with AI analysis and optional automatic decomposition.
    Higher Authority or Manager can create tasks.
    """
    dept_id = task_in.department_id
    if not dept_id and current_user.department_id:
        dept_id = current_user.department_id

    # Generate sequential task code
    task_count = db.query(Task).filter(Task.org_id == current_user.org_id).count() + 1
    code_prefix = current_user.org_id.replace("ORG-", "")
    task_code = f"TSK-{code_prefix}-{task_count:03d}"

    orchestrator = AIOrchestrator(db, current_user.org_id)
    ai_decomp = None
    subtasks = None

    if task_in.auto_decompose:
        ai_result = orchestrator.analyze_and_decompose_task(task_in.title, task_in.description or "", dept_id)
        ai_decomp = ai_result
        subtasks = ai_result.get("subtasks")

    task = Task(
        task_code=task_code,
        org_id=current_user.org_id,
        department_id=dept_id,
        required_role_id=task_in.required_role_id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority.upper(),
        status="PENDING",
        start_date=task_in.start_date or datetime.now(timezone.utc),
        deadline=task_in.deadline,
        estimated_duration_hours=task_in.estimated_duration_hours,
        location=task_in.location,
        shift=task_in.shift,
        special_instructions=task_in.special_instructions,
        subtasks_json=subtasks,
        ai_decomposition_json=ai_decomp,
        created_by_user_id=current_user.id
    )
    db.add(task)
    db.flush()

    # Add skill requirements
    for skill_id in (task_in.skill_ids or []):
        db.add(TaskRequirement(task_id=task.id, skill_id=skill_id, min_proficiency=3, min_experience=1.0))

    for req in (task_in.requirements or []):
        db.add(TaskRequirement(
            task_id=task.id, 
            skill_id=req.skill_id, 
            min_proficiency=req.min_proficiency, 
            min_experience=req.min_experience
        ))

    # Audit log
    audit = AuditLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        actor_name=current_user.full_name,
        action="CREATE_TASK",
        target_type="Task",
        target_id=task_code,
        details=f"Created task '{task.title}' with priority {task.priority}"
    )
    db.add(audit)

    db.commit()
    db.refresh(task)

    orchestrator.log_activity("Task Agent", "Task Created", f"Task {task.task_code} dispatched to queue", task.id)
    return format_task_out(db, task)

@router.post("/{task_id}/status")
def update_task_status(
    task_id: int,
    status_update: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update task status (ACCEPTED, IN_PROGRESS, PAUSED, COMPLETED, DELAYED) and progress %.
    Accessible by assigned employee or managers.
    """
    task = db.query(Task).filter(Task.id == task_id, Task.org_id == current_user.org_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    assignment = (
        db.query(TaskAssignment)
        .filter(TaskAssignment.task_id == task_id)
        .order_by(TaskAssignment.id.desc())
        .first()
    )

    role_level = current_user.role.role_level if current_user.role else "EMPLOYEE"
    if role_level == "EMPLOYEE":
        if not assignment or assignment.employee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You are not the assigned employee for this task")

    new_status = status_update.status.upper()
    task.status = new_status
    if assignment:
        assignment.status = new_status
        if status_update.progress_percent is not None:
            assignment.progress_percent = max(0, min(100, status_update.progress_percent))
        if status_update.notes:
            assignment.notes = status_update.notes
        if new_status == "COMPLETED":
            assignment.progress_percent = 100
            assignment.completed_at = datetime.now(timezone.utc)

    # Audit log
    audit = AuditLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        actor_name=current_user.full_name,
        action="UPDATE_TASK_STATUS",
        target_type="Task",
        target_id=task.task_code,
        details=f"Status set to {new_status} (Progress: {assignment.progress_percent if assignment else 0}%)"
    )
    db.add(audit)

    orchestrator = AIOrchestrator(db, current_user.org_id)
    orchestrator.log_activity("Monitoring Agent", "Status Update", f"Task {task.task_code} updated to {new_status}", task.id)

    db.commit()
    return {"message": "Status updated successfully", "status": new_status, "progress": assignment.progress_percent if assignment else 0}
