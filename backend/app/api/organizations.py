from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db, get_current_user, require_higher_authority
from app.models.entities import Organization, Department, Role, Skill, User
from app.schemas.schemas import (
    OrganizationOut, OrganizationUpdate, DepartmentOut, DepartmentCreate, 
    RoleOut, SkillOut, SkillCreate, SkillBase
)

router = APIRouter()

@router.get("/current", response_model=OrganizationOut)
def get_current_org(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve tenant organization profile and terminology configuration"""
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.put("/current", response_model=OrganizationOut)
def update_current_org(
    update_data: OrganizationUpdate,
    current_user: User = Depends(require_higher_authority),
    db: Session = Depends(get_db)
):
    """Update organization settings, dynamic terminology, and autonomy parameters"""
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if update_data.name:
        org.name = update_data.name
    if update_data.terminology_config:
        org.terminology_config = update_data.terminology_config
    if update_data.settings_json:
        org.settings_json = update_data.settings_json
    
    db.commit()
    db.refresh(org)
    return org

@router.get("/departments", response_model=List[DepartmentOut])
def list_departments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all departments in current organization"""
    depts = db.query(Department).filter(Department.org_id == current_user.org_id).all()
    return depts

@router.post("/departments", response_model=DepartmentOut)
def create_department(
    dept_in: DepartmentCreate,
    current_user: User = Depends(require_higher_authority),
    db: Session = Depends(get_db)
):
    """Create a new department in current organization"""
    dept = Department(
        org_id=current_user.org_id,
        name=dept_in.name,
        code=dept_in.code.upper(),
        description=dept_in.description
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/roles", response_model=List[RoleOut])
def list_roles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List roles in current organization"""
    roles = db.query(Role).filter(Role.org_id == current_user.org_id).all()
    return roles

@router.get("/skills", response_model=List[SkillOut])
def list_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List skills in organization"""
    skills = db.query(Skill).filter(Skill.org_id == current_user.org_id).all()
    return skills

@router.post("/skills", response_model=SkillOut)
def create_skill(
    skill_in: SkillBase,
    current_user: User = Depends(require_higher_authority),
    db: Session = Depends(get_db)
):
    """Register a new skill in organization taxonomy"""
    skill = Skill(
        org_id=current_user.org_id,
        name=skill_in.name,
        category=skill_in.category or "General"
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill
