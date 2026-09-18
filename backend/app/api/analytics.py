from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.api.deps import get_db, get_current_user
from app.models.entities import Task, User, Department, TaskAssignment, AvailabilityRecord, Escalation, AIRecommendation, AIActivityLog
from app.services.scheduler_engine import calculate_employee_workload

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns analytics KPIs tailored to organization and user authority.
    """
    org_id = current_user.org_id

    # Base task query scoped by role
    task_query = db.query(Task).filter(Task.org_id == org_id)
    if current_user.role and current_user.role.role_level == "MANAGER" and current_user.department_id:
        task_query = task_query.filter(Task.department_id == current_user.department_id)

    all_tasks = task_query.all()
    total_tasks = len(all_tasks)
    pending_tasks = sum(1 for t in all_tasks if t.status == "PENDING")
    active_tasks = sum(1 for t in all_tasks if t.status in ["ASSIGNED", "IN_PROGRESS", "ACCEPTED"])
    completed_tasks = sum(1 for t in all_tasks if t.status == "COMPLETED")
    delayed_tasks = sum(1 for t in all_tasks if t.status == "DELAYED")
    escalated_tasks = sum(1 for t in all_tasks if t.status == "ESCALATED")

    # Workforce metrics
    user_query = db.query(User).filter(User.org_id == org_id, User.is_active == True)
    if current_user.role and current_user.role.role_level == "MANAGER" and current_user.department_id:
        user_query = user_query.filter(User.department_id == current_user.department_id)
    
    total_workforce = user_query.count()
    
    # Active vs on-leave count
    users = user_query.all()
    on_leave_count = 0
    utilization_data = []

    for u in users:
        workload = calculate_employee_workload(db, u.id)
        # Check if on leave
        latest_avail = (
            db.query(AvailabilityRecord)
            .filter(AvailabilityRecord.user_id == u.id)
            .order_by(AvailabilityRecord.id.desc())
            .first()
        )
        is_on_leave = latest_avail and latest_avail.status in ["ON_LEAVE", "SICK", "UNAVAILABLE", "EMERGENCY"]
        if is_on_leave:
            on_leave_count += 1

        if u.role and u.role.role_level == "EMPLOYEE":
            utilization_data.append({
                "name": u.full_name,
                "workload": workload,
                "status": "On Leave" if is_on_leave else ("Overloaded" if workload > 80 else "Normal")
            })

    # Department Workload breakdown
    depts = db.query(Department).filter(Department.org_id == org_id).all()
    dept_workload = []
    for d in depts:
        d_tasks = [t for t in all_tasks if t.department_id == d.id]
        d_active = sum(1 for t in d_tasks if t.status in ["ASSIGNED", "IN_PROGRESS"])
        d_completed = sum(1 for t in d_tasks if t.status == "COMPLETED")
        dept_workload.append({
            "department": d.name,
            "code": d.code,
            "active_tasks": d_active,
            "completed_tasks": d_completed,
            "total_tasks": len(d_tasks)
        })

    # AI Stats
    ai_recommendations_count = db.query(AIRecommendation).join(Task).filter(Task.org_id == org_id).count()
    ai_activities_count = db.query(AIActivityLog).filter(AIActivityLog.org_id == org_id).count()
    open_escalations = db.query(Escalation).filter(Escalation.org_id == org_id, Escalation.status == "PENDING").count()

    return {
        "kpis": {
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "active_tasks": active_tasks,
            "completed_tasks": completed_tasks,
            "delayed_tasks": delayed_tasks,
            "escalated_tasks": escalated_tasks,
            "total_workforce": total_workforce,
            "active_workforce": total_workforce - on_leave_count,
            "on_leave_count": on_leave_count,
            "ai_scheduled_count": ai_recommendations_count,
            "ai_events_processed": ai_activities_count,
            "open_escalations": open_escalations
        },
        "department_workload": dept_workload,
        "employee_utilization": utilization_data[:8],
        "task_status_distribution": [
            {"name": "Completed", "value": completed_tasks, "color": "#10B981"},
            {"name": "In Progress", "value": active_tasks, "color": "#3B82F6"},
            {"name": "Pending", "value": pending_tasks, "color": "#F59E0B"},
            {"name": "Delayed", "value": delayed_tasks, "color": "#EF4444"},
            {"name": "Escalated", "value": escalated_tasks, "color": "#8B5CF6"}
        ]
    }
