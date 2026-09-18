from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.api.deps import get_db, get_current_user, require_manager_or_higher
from app.models.entities import Escalation, Task, User, AuditLog
from app.schemas.schemas import EscalationOut, EscalationCreate
from app.services.ai_orchestrator import AIOrchestrator

router = APIRouter()

def format_escalation_out(e: Escalation) -> dict:
    return {
        "id": e.id,
        "org_id": e.org_id,
        "task_id": e.task_id,
        "task_code": e.task.task_code if e.task else f"TSK-{e.task_id}",
        "task_title": e.task.title if e.task else "Task",
        "from_user_id": e.from_user_id,
        "from_user_name": e.task.created_by_user_id if e.task else "System",
        "to_user_id": e.to_user_id,
        "to_user_name": "Department Leadership",
        "level": e.level,
        "reason": e.reason,
        "status": e.status,
        "created_at": e.created_at
    }

@router.get("/", response_model=List[EscalationOut])
def list_escalations(
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """
    List escalations:
    - HIGHER_AUTHORITY sees Level 1, 2, 3 escalations
    - MANAGER sees Level 1 & 2 escalations in their department/scope
    """
    query = db.query(Escalation).filter(Escalation.org_id == current_user.org_id)
    
    role_level = current_user.role.role_level if current_user.role else "EMPLOYEE"
    if role_level == "MANAGER":
        # Escalations for tasks in their department
        if current_user.department_id:
            query = query.join(Task, Escalation.task_id == Task.id).filter(Task.department_id == current_user.department_id)

    escalations = query.order_by(Escalation.id.desc()).all()
    return [format_escalation_out(e) for e in escalations]

@router.post("/", response_model=EscalationOut)
def create_escalation(
    esc_in: EscalationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger manual escalation (Level 1, 2, or 3)"""
    orchestrator = AIOrchestrator(db, current_user.org_id)
    esc = orchestrator.trigger_escalation(
        task_id=esc_in.task_id,
        reason=esc_in.reason,
        level=esc_in.level
    )
    return format_escalation_out(esc)

@router.post("/{escalation_id}/resolve")
def resolve_escalation(
    escalation_id: int,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """Mark an escalation as resolved"""
    esc = db.query(Escalation).filter(Escalation.id == escalation_id, Escalation.org_id == current_user.org_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")

    esc.status = "RESOLVED"
    esc.resolved_at = datetime.now(timezone.utc)

    audit = AuditLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        actor_name=current_user.full_name,
        action="RESOLVE_ESCALATION",
        target_type="Escalation",
        target_id=str(esc.id),
        details=f"Resolved Level {esc.level} escalation on {esc.task.task_code if esc.task else 'Task'}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Escalation resolved successfully"}
