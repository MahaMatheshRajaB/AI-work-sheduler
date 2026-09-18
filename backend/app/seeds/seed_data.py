from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.entities import (
    Organization, Department, Role, User, Skill, EmployeeSkill, Task, 
    TaskRequirement, TaskAssignment, AvailabilityRecord, Notification, AuditLog, AIActivityLog
)
from app.core.security import get_password_hash

def seed_all_demo_data(db: Session):
    """Seed comprehensive demo data for 3 distinct organization types"""
    # Check if already seeded
    existing_org = db.query(Organization).first()
    if existing_org:
        return

    print("Seeding demo organizations and workforce datasets...")
    hashed_pwd = get_password_hash("password123")

    # =========================================================================
    # 1. ORG-TECH: TechNova Solutions (IT / Software Enterprise)
    # =========================================================================
    tech_org = Organization(
        id="ORG-TECH",
        name="TechNova Solutions Inc.",
        org_type="IT",
        hierarchy_config={
            "levels": [
                {"name": "Executive Management", "level": "HIGHER_AUTHORITY", "title": "CEO / VP"},
                {"name": "Project Management", "level": "MANAGER", "title": "Project Lead / Eng Manager"},
                {"name": "Engineering Staff", "level": "EMPLOYEE", "title": "Software Engineer / Specialist"}
            ]
        },
        terminology_config={
            "higher_authority": "Chief Executive Officer",
            "manager": "Project Lead",
            "employee": "Software Engineer",
            "department": "Engineering Unit",
            "task": "Sprint Task"
        },
        settings_json={"autonomy_level": 1, "auto_reschedule": True}
    )
    db.add(tech_org)

    # Departments
    tech_dept_eng = Department(org_id="ORG-TECH", name="Core Engineering", code="ENG", description="Frontend & Backend development")
    tech_dept_ops = Department(org_id="ORG-TECH", name="Cloud & DevOps", code="DEVOPS", description="Infrastructure and CI/CD pipelines")
    tech_dept_qa = Department(org_id="ORG-TECH", name="Quality Assurance", code="QA", description="Test automation & security audits")
    db.add_all([tech_dept_eng, tech_dept_ops, tech_dept_qa])
    db.flush()

    # Roles
    tech_role_exec = Role(org_id="ORG-TECH", name="Chief Executive Officer", role_level="HIGHER_AUTHORITY")
    tech_role_pm = Role(org_id="ORG-TECH", name="Engineering Project Lead", role_level="MANAGER")
    tech_role_dev = Role(org_id="ORG-TECH", name="Fullstack Developer", role_level="EMPLOYEE")
    tech_role_devops = Role(org_id="ORG-TECH", name="DevOps Specialist", role_level="EMPLOYEE")
    tech_role_qa = Role(org_id="ORG-TECH", name="QA Automation Engineer", role_level="EMPLOYEE")
    db.add_all([tech_role_exec, tech_role_pm, tech_role_dev, tech_role_devops, tech_role_qa])
    db.flush()

    # Skills
    skills_tech = {
        "react": Skill(org_id="ORG-TECH", name="React & Modern UI", category="Frontend"),
        "fastapi": Skill(org_id="ORG-TECH", name="Python & FastAPI", category="Backend"),
        "aws": Skill(org_id="ORG-TECH", name="AWS Cloud Architecture", category="Infrastructure"),
        "docker": Skill(org_id="ORG-TECH", name="Docker & Kubernetes", category="DevOps"),
        "testing": Skill(org_id="ORG-TECH", name="Automated Testing & Jest", category="QA"),
        "db": Skill(org_id="ORG-TECH", name="PostgreSQL & Optimization", category="Database")
    }
    db.add_all(skills_tech.values())
    db.flush()

    # Users
    user_tech_ceo = User(
        user_code="TECH-EXEC-01", org_id="ORG-TECH", role_id=tech_role_exec.id,
        username="alex.ceo", email="alex@technova.io", full_name="Alex Mercer (CEO)",
        hashed_password=hashed_pwd, experience_years=12.0
    )
    user_tech_pm = User(
        user_code="TECH-MGR-01", org_id="ORG-TECH", department_id=tech_dept_eng.id, role_id=tech_role_pm.id,
        username="sarah.lead", email="sarah@technova.io", full_name="Sarah Chen (Project Lead)",
        hashed_password=hashed_pwd, experience_years=7.0
    )
    user_tech_emp1 = User(
        user_code="TECH-DEV-01", org_id="ORG-TECH", department_id=tech_dept_eng.id, role_id=tech_role_dev.id,
        username="david.dev", email="david@technova.io", full_name="David Miller (Senior Dev)",
        hashed_password=hashed_pwd, experience_years=5.0
    )
    user_tech_emp2 = User(
        user_code="TECH-DEV-02", org_id="ORG-TECH", department_id=tech_dept_eng.id, role_id=tech_role_dev.id,
        username="elena.dev", email="elena@technova.io", full_name="Elena Rostova (Frontend Dev)",
        hashed_password=hashed_pwd, experience_years=3.0
    )
    user_tech_devops = User(
        user_code="TECH-OPS-01", org_id="ORG-TECH", department_id=tech_dept_ops.id, role_id=tech_role_devops.id,
        username="marcus.ops", email="marcus@technova.io", full_name="Marcus Vance (DevOps Lead)",
        hashed_password=hashed_pwd, experience_years=6.0
    )
    user_tech_qa = User(
        user_code="TECH-QA-01", org_id="ORG-TECH", department_id=tech_dept_qa.id, role_id=tech_role_qa.id,
        username="priya.qa", email="priya@technova.io", full_name="Priya Sharma (QA Engineer)",
        hashed_password=hashed_pwd, experience_years=4.0
    )
    db.add_all([user_tech_ceo, user_tech_pm, user_tech_emp1, user_tech_emp2, user_tech_devops, user_tech_qa])
    db.flush()

    # Link skills
    db.add_all([
        EmployeeSkill(user_id=user_tech_emp1.id, skill_id=skills_tech["react"].id, proficiency_level=5, years_experience=5.0),
        EmployeeSkill(user_id=user_tech_emp1.id, skill_id=skills_tech["fastapi"].id, proficiency_level=4, years_experience=4.0),
        EmployeeSkill(user_id=user_tech_emp1.id, skill_id=skills_tech["db"].id, proficiency_level=4, years_experience=4.0),
        EmployeeSkill(user_id=user_tech_emp2.id, skill_id=skills_tech["react"].id, proficiency_level=4, years_experience=3.0),
        EmployeeSkill(user_id=user_tech_devops.id, skill_id=skills_tech["aws"].id, proficiency_level=5, years_experience=6.0),
        EmployeeSkill(user_id=user_tech_devops.id, skill_id=skills_tech["docker"].id, proficiency_level=5, years_experience=6.0),
        EmployeeSkill(user_id=user_tech_qa.id, skill_id=skills_tech["testing"].id, proficiency_level=5, years_experience=4.0)
    ])
    db.flush()

    # Tasks
    now = datetime.now(timezone.utc)
    task_tech_1 = Task(
        task_code="TSK-TECH-101", org_id="ORG-TECH", department_id=tech_dept_eng.id,
        title="Microservice API Gateway Migration",
        description="Migrate legacy monolithic gateway to high-throughput async FastAPI gateway with JWT validation.",
        priority="HIGH", status="IN_PROGRESS",
        start_date=now - timedelta(days=1), deadline=now + timedelta(days=2),
        estimated_duration_hours=12.0, created_by_user_id=user_tech_pm.id
    )
    task_tech_2 = Task(
        task_code="TSK-TECH-102", org_id="ORG-TECH", department_id=tech_dept_ops.id,
        title="Kubernetes Production Cluster Hardening",
        description="Implement network security policies and autoscaling groups for AWS EKS.",
        priority="CRITICAL", status="ASSIGNED",
        start_date=now, deadline=now + timedelta(days=1),
        estimated_duration_hours=8.0, created_by_user_id=user_tech_ceo.id
    )
    task_tech_3 = Task(
        task_code="TSK-TECH-103", org_id="ORG-TECH", department_id=tech_dept_eng.id,
        title="Quarterly Client Security Audit & Penetration Testing",
        description="Perform comprehensive vulnerability analysis and code scanning for upcoming SOC2 compliance.",
        priority="MEDIUM", status="PENDING",
        start_date=now, deadline=now + timedelta(days=3),
        estimated_duration_hours=16.0, created_by_user_id=user_tech_ceo.id
    )
    db.add_all([task_tech_1, task_tech_2, task_tech_3])
    db.flush()

    # Task Requirements
    db.add(TaskRequirement(task_id=task_tech_1.id, skill_id=skills_tech["fastapi"].id, min_proficiency=4, min_experience=3.0))
    db.add(TaskRequirement(task_id=task_tech_2.id, skill_id=skills_tech["aws"].id, min_proficiency=4, min_experience=4.0))
    db.add(TaskRequirement(task_id=task_tech_3.id, skill_id=skills_tech["testing"].id, min_proficiency=3, min_experience=2.0))

    # Assignments
    db.add(TaskAssignment(task_id=task_tech_1.id, employee_id=user_tech_emp1.id, assigned_by_user_id=user_tech_pm.id, status="IN_PROGRESS", progress_percent=45))
    db.add(TaskAssignment(task_id=task_tech_2.id, employee_id=user_tech_devops.id, assigned_by_user_id=user_tech_pm.id, status="ASSIGNED", progress_percent=10))
    db.flush()

    # =========================================================================
    # 2. ORG-HOSP: St. Jude Memorial Hospital (Healthcare)
    # =========================================================================
    hosp_org = Organization(
        id="ORG-HOSP",
        name="St. Jude Memorial Hospital",
        org_type="Healthcare",
        hierarchy_config={
            "levels": [
                {"name": "Hospital Administration", "level": "HIGHER_AUTHORITY", "title": "Hospital Director / CMO"},
                {"name": "Clinical Leadership", "level": "MANAGER", "title": "Department Head / Charge Nurse"},
                {"name": "Clinical Staff", "level": "EMPLOYEE", "title": "Physician / Registered Nurse"}
            ]
        },
        terminology_config={
            "higher_authority": "Hospital Director",
            "manager": "Charge Head",
            "employee": "Doctor / Nurse",
            "department": "Medical Ward",
            "task": "Clinical Duty"
        },
        settings_json={"autonomy_level": 1, "auto_reschedule": True}
    )
    db.add(hosp_org)

    hosp_dept_er = Department(org_id="ORG-HOSP", name="Emergency & Trauma", code="ER", description="Emergency acute patient stabilization")
    hosp_dept_icu = Department(org_id="ORG-HOSP", name="Intensive Care Unit", code="ICU", description="Critical inpatient monitoring")
    hosp_dept_gen = Department(org_id="ORG-HOSP", name="General Medicine", code="GEN", description="General outpatient & consultations")
    db.add_all([hosp_dept_er, hosp_dept_icu, hosp_dept_gen])
    db.flush()

    hosp_role_dir = Role(org_id="ORG-HOSP", name="Hospital Director", role_level="HIGHER_AUTHORITY")
    hosp_role_head = Role(org_id="ORG-HOSP", name="Emergency Department Head", role_level="MANAGER")
    hosp_role_doc = Role(org_id="ORG-HOSP", name="Emergency Physician", role_level="EMPLOYEE")
    hosp_role_nurse = Role(org_id="ORG-HOSP", name="Critical Care Nurse", role_level="EMPLOYEE")
    db.add_all([hosp_role_dir, hosp_role_head, hosp_role_doc, hosp_role_nurse])
    db.flush()

    skills_hosp = {
        "emergency": Skill(org_id="ORG-HOSP", name="Emergency Care & Triage", category="Clinical"),
        "icu": Skill(org_id="ORG-HOSP", name="ICU Protocols & Ventilator", category="Critical"),
        "cardio": Skill(org_id="ORG-HOSP", name="Advanced Cardiac Life Support (ACLS)", category="Cardiology"),
        "pediatrics": Skill(org_id="ORG-HOSP", name="Pediatric Care", category="Pediatrics")
    }
    db.add_all(skills_hosp.values())
    db.flush()

    user_hosp_dir = User(
        user_code="HOSP-DIR-01", org_id="ORG-HOSP", role_id=hosp_role_dir.id,
        username="dr.reynolds", email="reynolds@stjude.org", full_name="Dr. Arthur Reynolds (Director)",
        hashed_password=hashed_pwd, experience_years=20.0
    )
    user_hosp_mgr = User(
        user_code="HOSP-HEAD-01", org_id="ORG-HOSP", department_id=hosp_dept_er.id, role_id=hosp_role_head.id,
        username="dr.patel", email="patel@stjude.org", full_name="Dr. Anita Patel (ER Head)",
        hashed_password=hashed_pwd, experience_years=12.0
    )
    user_hosp_doc1 = User(
        user_code="HOSP-DOC-01", org_id="ORG-HOSP", department_id=hosp_dept_er.id, role_id=hosp_role_doc.id,
        username="dr.james", email="james@stjude.org", full_name="Dr. James Wilson (ER Physician)",
        hashed_password=hashed_pwd, experience_years=6.0, current_shift="Morning"
    )
    user_hosp_nurse1 = User(
        user_code="HOSP-NURSE-01", org_id="ORG-HOSP", department_id=hosp_dept_er.id, role_id=hosp_role_nurse.id,
        username="clara.nurse", email="clara@stjude.org", full_name="Clara Barton (Charge Nurse)",
        hashed_password=hashed_pwd, experience_years=5.0, current_shift="General"
    )
    user_hosp_nurse2 = User(
        user_code="HOSP-NURSE-02", org_id="ORG-HOSP", department_id=hosp_dept_icu.id, role_id=hosp_role_nurse.id,
        username="sam.nurse", email="sam@stjude.org", full_name="Samuel Rivera (ICU Nurse)",
        hashed_password=hashed_pwd, experience_years=4.0, current_shift="Night"
    )
    db.add_all([user_hosp_dir, user_hosp_mgr, user_hosp_doc1, user_hosp_nurse1, user_hosp_nurse2])
    db.flush()

    db.add_all([
        EmployeeSkill(user_id=user_hosp_doc1.id, skill_id=skills_hosp["emergency"].id, proficiency_level=5, years_experience=6.0),
        EmployeeSkill(user_id=user_hosp_doc1.id, skill_id=skills_hosp["cardio"].id, proficiency_level=4, years_experience=5.0),
        EmployeeSkill(user_id=user_hosp_nurse1.id, skill_id=skills_hosp["emergency"].id, proficiency_level=4, years_experience=5.0),
        EmployeeSkill(user_id=user_hosp_nurse2.id, skill_id=skills_hosp["icu"].id, proficiency_level=5, years_experience=4.0)
    ])
    db.flush()

    task_hosp_1 = Task(
        task_code="TSK-HOSP-201", org_id="ORG-HOSP", department_id=hosp_dept_er.id,
        title="Trauma Bay Night Shift Duty",
        description="Coordinate emergency room intake and triage during Saturday night trauma surge.",
        priority="CRITICAL", status="ASSIGNED",
        start_date=now, deadline=now + timedelta(hours=12),
        estimated_duration_hours=8.0, created_by_user_id=user_hosp_mgr.id
    )
    db.add(task_hosp_1)
    db.flush()
    db.add(TaskRequirement(task_id=task_hosp_1.id, skill_id=skills_hosp["emergency"].id, min_proficiency=4, min_experience=3.0))
    db.add(TaskAssignment(task_id=task_hosp_1.id, employee_id=user_hosp_doc1.id, assigned_by_user_id=user_hosp_mgr.id, status="IN_PROGRESS", progress_percent=50))
    db.flush()

    # =========================================================================
    # 3. ORG-COLL: Apex Institute of Technology (Higher Education / College)
    # =========================================================================
    coll_org = Organization(
        id="ORG-COLL",
        name="Apex Institute of Technology",
        org_type="College",
        hierarchy_config={
            "levels": [
                {"name": "Executive Administration", "level": "HIGHER_AUTHORITY", "title": "Principal / Dean"},
                {"name": "Departmental Leadership", "level": "MANAGER", "title": "Head of Department (HOD)"},
                {"name": "Academic Staff", "level": "EMPLOYEE", "title": "Professor / Lab Instructor"}
            ]
        },
        terminology_config={
            "higher_authority": "Principal",
            "manager": "HOD",
            "employee": "Faculty",
            "department": "Academic Department",
            "task": "Academic Assignment"
        },
        settings_json={"autonomy_level": 1, "auto_reschedule": True}
    )
    db.add(coll_org)

    coll_dept_cse = Department(org_id="ORG-COLL", name="Computer Science & Engineering", code="CSE", description="Core CS and software labs")
    coll_dept_ai = Department(org_id="ORG-COLL", name="AI & Data Science", code="AIDS", description="Machine Learning and Analytics")
    db.add_all([coll_dept_cse, coll_dept_ai])
    db.flush()

    coll_role_prin = Role(org_id="ORG-COLL", name="College Principal", role_level="HIGHER_AUTHORITY")
    coll_role_hod = Role(org_id="ORG-COLL", name="Head of Department", role_level="MANAGER")
    coll_role_fac = Role(org_id="ORG-COLL", name="Assistant Professor", role_level="EMPLOYEE")
    coll_role_lab = Role(org_id="ORG-COLL", name="Lab Instructor", role_level="EMPLOYEE")
    db.add_all([coll_role_prin, coll_role_hod, coll_role_fac, coll_role_lab])
    db.flush()

    skills_coll = {
        "teaching": Skill(org_id="ORG-COLL", name="Classroom Pedagogy & Lecture", category="Teaching"),
        "exam": Skill(org_id="ORG-COLL", name="Exam Paper Formulation & Evaluation", category="Administration"),
        "lab": Skill(org_id="ORG-COLL", name="Lab Practical Coordination", category="Laboratory"),
        "research": Skill(org_id="ORG-COLL", name="Research Grant Proposal Writing", category="Academic")
    }
    db.add_all(skills_coll.values())
    db.flush()

    user_coll_prin = User(
        user_code="COLL-PRIN-01", org_id="ORG-COLL", role_id=coll_role_prin.id,
        username="prof.sharma", email="principal@apextech.edu", full_name="Prof. R.K. Sharma (Principal)",
        hashed_password=hashed_pwd, experience_years=25.0
    )
    user_coll_hod = User(
        user_code="COLL-HOD-01", org_id="ORG-COLL", department_id=coll_dept_cse.id, role_id=coll_role_hod.id,
        username="dr.gupta", email="hod.cse@apextech.edu", full_name="Dr. Sunita Gupta (HOD CSE)",
        hashed_password=hashed_pwd, experience_years=14.0
    )
    user_coll_fac1 = User(
        user_code="COLL-FAC-01", org_id="ORG-COLL", department_id=coll_dept_cse.id, role_id=coll_role_fac.id,
        username="arun.fac", email="arun@apextech.edu", full_name="Arun Kumar (Asst Professor)",
        hashed_password=hashed_pwd, experience_years=5.0
    )
    user_coll_fac2 = User(
        user_code="COLL-FAC-02", org_id="ORG-COLL", department_id=coll_dept_cse.id, role_id=coll_role_fac.id,
        username="meera.fac", email="meera@apextech.edu", full_name="Meera Nair (Asst Professor)",
        hashed_password=hashed_pwd, experience_years=4.0
    )
    db.add_all([user_coll_prin, user_coll_hod, user_coll_fac1, user_coll_fac2])
    db.flush()

    db.add_all([
        EmployeeSkill(user_id=user_coll_fac1.id, skill_id=skills_coll["exam"].id, proficiency_level=5, years_experience=5.0),
        EmployeeSkill(user_id=user_coll_fac1.id, skill_id=skills_coll["teaching"].id, proficiency_level=4, years_experience=5.0),
        EmployeeSkill(user_id=user_coll_fac2.id, skill_id=skills_coll["lab"].id, proficiency_level=5, years_experience=4.0),
        EmployeeSkill(user_id=user_coll_fac2.id, skill_id=skills_coll["teaching"].id, proficiency_level=4, years_experience=4.0)
    ])
    db.flush()

    task_coll_1 = Task(
        task_code="TSK-COLL-301", org_id="ORG-COLL", department_id=coll_dept_cse.id,
        title="End Semester Question Paper Formulation",
        description="Prepare comprehensive exam paper and answer key for CS402 Distributed Systems.",
        priority="HIGH", status="PENDING",
        start_date=now, deadline=now + timedelta(days=4),
        estimated_duration_hours=6.0, created_by_user_id=user_coll_prin.id
    )
    db.add(task_coll_1)
    db.flush()
    db.add(TaskRequirement(task_id=task_coll_1.id, skill_id=skills_coll["exam"].id, min_proficiency=4, min_experience=3.0))
    db.flush()

    # Initial AI Activity and Audit entries
    db.add_all([
        AIActivityLog(org_id="ORG-TECH", agent_name="System Orchestrator", action="SYSTEM_INIT", details="Multi-tenant workforce scheduling engine online with 3 organizations.", timestamp=now - timedelta(hours=5)),
        AIActivityLog(org_id="ORG-TECH", task_id=task_tech_1.id, agent_name="Scheduling Agent", action="SCHEDULE_ALLOCATED", details=f"Recommended David Miller for TSK-TECH-101 (Score: 94.5%)", timestamp=now - timedelta(hours=3)),
        AuditLog(org_id="ORG-TECH", user_id=user_tech_pm.id, actor_name="Sarah Chen (Project Lead)", action="ASSIGN_TASK", target_type="Task", target_id="TSK-TECH-101", details="Approved AI recommendation and assigned to David Miller.", created_at=now - timedelta(hours=2)),
        Notification(org_id="ORG-TECH", user_id=user_tech_emp1.id, title="New Assignment: TSK-TECH-101", message="You were assigned Microservice API Gateway Migration.", type="ASSIGNMENT", created_at=now - timedelta(hours=2))
    ])

    db.commit()
    print("Seed data successfully initialized for Tech, Hospital, and College organizations!")
