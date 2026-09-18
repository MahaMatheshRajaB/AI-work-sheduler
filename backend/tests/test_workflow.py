import os
import sys

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, engine, SessionLocal
from app.seeds.seed_data import seed_all_demo_data
from app.models.entities import Organization, User, Task, TaskAssignment, AvailabilityRecord
from app.services.ai_orchestrator import AIOrchestrator
from app.services.scheduler_engine import rank_candidates_for_task
from app.core.security import verify_password, create_access_token, decode_access_token

def test_full_workflow():
    print("=== STARTING BACKEND VERIFICATION TEST ===")
    
    # 1. Initialize tables & seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_all_demo_data(db)

    # 2. Test Multi-tenant existence
    org_count = db.query(Organization).count()
    assert org_count == 3, f"Expected 3 organizations, found {org_count}"
    print("[OK] Verified 3 Organizations seeded (Tech, Hospital, College)")

    # 3. Test Authentication
    ceo = db.query(User).filter(User.username == "alex.ceo").first()
    assert ceo is not None, "CEO user not found"
    assert verify_password("password123", ceo.hashed_password), "Password verification failed"
    token = create_access_token({"sub": ceo.username, "org_id": ceo.org_id, "user_id": ceo.id})
    payload = decode_access_token(token)
    assert payload["sub"] == "alex.ceo", "JWT payload invalid"
    print(f"[OK] Authentication & JWT verified for {ceo.full_name}")

    # 4. Test AI Candidate Scoring Engine
    task = db.query(Task).filter(Task.task_code == "TSK-TECH-103").first()
    assert task is not None, "Task TSK-TECH-103 not found"
    ranked = rank_candidates_for_task(db, task)
    assert len(ranked) > 0, "No candidates ranked"
    top_candidate = ranked[0]
    print(f"[OK] AI Scheduling Engine ranked {len(ranked)} candidates for '{task.title}'")
    print(f"   Top Match: {top_candidate['candidate'].full_name} ({top_candidate['match_score']}% Match)")
    print(f"   Reason: {top_candidate['reason']}")
    assert top_candidate["match_score"] > 50, "Expected match score to be valid"

    # 5. Test AI Orchestrator Schedule Generation
    orchestrator = AIOrchestrator(db, "ORG-TECH")
    rec_result = orchestrator.generate_schedule_recommendation(task.id)
    assert rec_result["recommended_employee"] is not None
    assert rec_result["ai_autonomy_level"] == 1
    print("[OK] AI Orchestrator recommendation saved to database")

    # 6. Test Automatic Conflict Detection & Rescheduling on Leave
    # Assign task 103 to David Miller first
    david = db.query(User).filter(User.username == "david.dev").first()
    task.status = "ASSIGNED"
    assign = TaskAssignment(
        task_id=task.id,
        employee_id=david.id,
        status="ASSIGNED",
        progress_percent=20
    )
    db.add(assign)
    db.commit()

    # Now simulate David Miller going on emergency leave
    print(f"Simulating leave for {david.full_name}...")
    reschedules = orchestrator.handle_employee_unavailability(david.id, reason="Emergency Medical Leave")
    assert len(reschedules) > 0, "Expected at least 1 task to be rescheduled"
    rescheduled_task = reschedules[0]
    print(f"[OK] AI Conflict Detection triggered: Task {rescheduled_task['task_code']} reallocated to {rescheduled_task['new_assignee']}")

    # 7. Test Hierarchical Escalation
    esc = orchestrator.trigger_escalation(task.id, reason="Progress bottleneck detected past SLA", level=2)
    assert esc.level == 2, "Escalation level mismatch"
    assert task.status == "ESCALATED", "Task status not set to ESCALATED"
    print("[OK] Hierarchical Level 2 Escalation successfully triggered")

    db.close()
    print("=== ALL BACKEND WORKFLOW TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_full_workflow()
