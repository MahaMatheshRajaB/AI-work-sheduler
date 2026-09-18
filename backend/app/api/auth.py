from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User, Organization
from app.schemas.schemas import LoginRequest, Token, UserOut
from app.core.security import verify_password, create_access_token

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with Org ID, Username, and Password"""
    # 1. Verify organization exists
    org = db.query(Organization).filter(Organization.id == login_req.org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization '{login_req.org_id}' not found."
        )

    # 2. Find user in that organization
    user = (
        db.query(User)
        .filter(
            User.org_id == login_req.org_id,
            (User.username == login_req.username) | (User.email == login_req.username) | (User.user_code == login_req.username)
        )
        .first()
    )
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, organization ID, or password."
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive.")

    role_level = user.role.role_level if user.role else "EMPLOYEE"
    role_name = user.role.name if user.role else "Staff"
    dept_name = user.department.name if user.department else None

    # Generate JWT
    token_payload = {
        "sub": user.username,
        "user_id": user.id,
        "org_id": user.org_id,
        "role_level": role_level
    }
    access_token = create_access_token(data=token_payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "user_code": user.user_code,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "org_id": user.org_id,
            "org_name": org.name,
            "org_type": org.org_type,
            "department_id": user.department_id,
            "department_name": dept_name,
            "role_id": user.role_id,
            "role_name": role_name,
            "role_level": role_level,
            "terminology": org.terminology_config or {}
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently logged-in user profile with tenant metadata"""
    role_level = current_user.role.role_level if current_user.role else "EMPLOYEE"
    role_name = current_user.role.name if current_user.role else "Staff"
    dept_name = current_user.department.name if current_user.department else None
    org = current_user.organization

    return {
        "id": current_user.id,
        "user_code": current_user.user_code,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "org_id": current_user.org_id,
        "org_name": org.name if org else "",
        "org_type": org.org_type if org else "",
        "department_id": current_user.department_id,
        "department_name": dept_name,
        "role_id": current_user.role_id,
        "role_name": role_name,
        "role_level": role_level,
        "terminology": org.terminology_config if org else {}
    }

@router.get("/demo-personas")
def get_demo_personas(db: Session = Depends(get_db)):
    """Returns quick login personas across organizations for rapid hackathon testing"""
    personas = [
        # Tech Company
        {
            "org_id": "ORG-TECH",
            "org_name": "TechNova Solutions (IT)",
            "username": "alex.ceo",
            "password": "password123",
            "role_level": "HIGHER_AUTHORITY",
            "title": "Alex Mercer (CEO)",
            "description": "Executive oversight, organization analytics, task dispatch"
        },
        {
            "org_id": "ORG-TECH",
            "org_name": "TechNova Solutions (IT)",
            "username": "sarah.lead",
            "password": "password123",
            "role_level": "MANAGER",
            "title": "Sarah Chen (Project Lead)",
            "description": "Team scheduling, review AI recommendations, manage assignments"
        },
        {
            "org_id": "ORG-TECH",
            "org_name": "TechNova Solutions (IT)",
            "username": "david.dev",
            "password": "password123",
            "role_level": "EMPLOYEE",
            "title": "David Miller (Senior Dev)",
            "description": "Individual task execution, update progress, report leave"
        },
        # Hospital
        {
            "org_id": "ORG-HOSP",
            "org_name": "St. Jude Memorial Hospital",
            "username": "dr.reynolds",
            "password": "password123",
            "role_level": "HIGHER_AUTHORITY",
            "title": "Dr. Arthur Reynolds (Director)",
            "description": "Hospital administration, clinical duty oversight"
        },
        {
            "org_id": "ORG-HOSP",
            "org_name": "St. Jude Memorial Hospital",
            "username": "dr.patel",
            "password": "password123",
            "role_level": "MANAGER",
            "title": "Dr. Anita Patel (ER Head)",
            "description": "Emergency triage schedules, shift allocation"
        },
        {
            "org_id": "ORG-HOSP",
            "org_name": "St. Jude Memorial Hospital",
            "username": "dr.james",
            "password": "password123",
            "role_level": "EMPLOYEE",
            "title": "Dr. James Wilson (ER Physician)",
            "description": "Emergency clinical duties, shift status"
        },
        # College
        {
            "org_id": "ORG-COLL",
            "org_name": "Apex Institute of Tech (College)",
            "username": "prof.sharma",
            "password": "password123",
            "role_level": "HIGHER_AUTHORITY",
            "title": "Prof. R.K. Sharma (Principal)",
            "description": "Academic administration & institutional planning"
        },
        {
            "org_id": "ORG-COLL",
            "org_name": "Apex Institute of Tech (College)",
            "username": "dr.gupta",
            "password": "password123",
            "role_level": "MANAGER",
            "title": "Dr. Sunita Gupta (HOD CSE)",
            "description": "Faculty course assignments & exam planning"
        },
        {
            "org_id": "ORG-COLL",
            "org_name": "Apex Institute of Tech (College)",
            "username": "arun.fac",
            "password": "password123",
            "role_level": "EMPLOYEE",
            "title": "Arun Kumar (Asst Professor)",
            "description": "Academic tasks, lecture delivery & exam prep"
        }
    ]
    return personas
