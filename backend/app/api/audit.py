from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user, require_manager_or_higher
from app.models.entities import AuditLog, AIActivityLog, User
from app.schemas.schemas import AuditLogOut, AIActivityOut

router = APIRouter()

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_manager_or_higher),
    db: Session = Depends(get_db)
):
    """Retrieve immutable organization audit trail"""
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.org_id == current_user.org_id)
        .order_by(AuditLog.id.desc())
        .limit(limit)
        .all()
    )
    return logs

@router.get("/ai-activity", response_model=List[AIActivityOut])
def get_ai_activities(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve real-time transparent AI multi-agent orchestration feed"""
    activities = (
        db.query(AIActivityLog)
        .filter(AIActivityLog.org_id == current_user.org_id)
        .order_by(AIActivityLog.id.desc())
        .limit(limit)
        .all()
    )
    return activities
