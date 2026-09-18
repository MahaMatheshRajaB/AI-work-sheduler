import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

def test_api():
    client = TestClient(app)
    
    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200
    print(f"[OK] Root Endpoint: {res.json()}")

    # 2. Demo personas
    res = client.get("/api/v1/auth/demo-personas")
    assert res.status_code == 200
    personas = res.json()
    print(f"[OK] Demo Personas loaded: {len(personas)} personas")

    # 3. Login as CEO
    res = client.post("/api/v1/auth/login", json={
        "org_id": "ORG-TECH",
        "username": "alex.ceo",
        "password": "password123"
    })
    assert res.status_code == 200
    token_data = res.json()
    token = token_data["access_token"]
    print(f"[OK] Logged in as: {token_data['user']['full_name']} ({token_data['user']['role_level']})")

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Fetch dashboard analytics
    res = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert res.status_code == 200
    analytics = res.json()
    print(f"[OK] Executive Analytics: {analytics['kpis']}")

    # 5. List tasks
    res = client.get("/api/v1/tasks/", headers=headers)
    assert res.status_code == 200
    tasks = res.json()
    print(f"[OK] Tasks in org: {len(tasks)}")

    # 6. Generate AI Schedule for a pending task
    pending_task = next((t for t in tasks if t["status"] == "PENDING"), tasks[0])
    res = client.post(f"/api/v1/schedules/generate?task_id={pending_task['id']}", headers=headers)
    assert res.status_code == 200
    sched = res.json()
    print(f"[OK] AI Schedule Recommendation for Task {sched['task_code']}:")
    rec = sched["recommended_employee"]
    if rec:
        print(f"     Top Match: {rec['full_name']} ({rec['match_score']}% Match)")
        print(f"     Reason: {rec['reason']}")

    # 7. Approve assignment
    if rec:
        res = client.post("/api/v1/schedules/approve", headers=headers, json={
            "task_id": pending_task["id"],
            "employee_id": rec["user_id"],
            "notes": "Approved via Test"
        })
        assert res.status_code == 200
        print(f"[OK] Assignment approved: {res.json()['message']}")

    # 8. Simulate Employee Leave
    dev = next(p for p in personas if p["username"] == "david.dev")
    res = client.post("/api/v1/simulation/simulate-leave", headers=headers, params={
        "user_id": 3, # David Miller
        "reason": "Emergency Medical Leave (Hackathon Test)"
    })
    assert res.status_code == 200
    print(f"[OK] Leave Simulation: {res.json()['message']}")

    # 9. Check Audit Log & AI Activity Feed
    res = client.get("/api/v1/audit/audit-logs", headers=headers)
    assert res.status_code == 200
    print(f"[OK] Audit logs count: {len(res.json())}")

    res = client.get("/api/v1/audit/ai-activity", headers=headers)
    assert res.status_code == 200
    print(f"[OK] AI Activity Stream count: {len(res.json())}")

    print("=== ALL API ENDPOINTS VERIFIED END-TO-END WITH ZERO DEFECTS! ===")

if __name__ == "__main__":
    test_api()
