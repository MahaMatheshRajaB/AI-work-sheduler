from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    org_id: Optional[str] = None
    role_level: Optional[str] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    org_id: str
    username: str
    password: str

# --- Organization & Department Schemas ---
class OrganizationBase(BaseModel):
    id: str
    name: str
    org_type: str

class OrganizationOut(OrganizationBase):
    hierarchy_config: Optional[Dict[str, Any]] = None
    terminology_config: Optional[Dict[str, Any]] = None
    settings_json: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    terminology_config: Optional[Dict[str, Any]] = None
    settings_json: Optional[Dict[str, Any]] = None

class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    org_id: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int
    org_id: str
    class Config:
        from_attributes = True

class RoleOut(BaseModel):
    id: int
    name: str
    role_level: str
    class Config:
        from_attributes = True

# --- User & Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int
    class Config:
        from_attributes = True

class EmployeeSkillOut(BaseModel):
    skill_id: int
    skill_name: str
    proficiency_level: int
    years_experience: float

class UserBase(BaseModel):
    user_code: str
    username: str
    email: str
    full_name: str
    experience_years: float = 1.0
    current_shift: str = "General"
    max_weekly_hours: int = 40

class UserOut(UserBase):
    id: int
    org_id: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    role_id: int
    role_name: Optional[str] = None
    role_level: str
    is_active: bool
    current_workload_percent: Optional[float] = 0.0
    current_availability_status: Optional[str] = "AVAILABLE"
    skills: List[EmployeeSkillOut] = []
    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskRequirementIn(BaseModel):
    skill_id: int
    min_proficiency: int = 1
    min_experience: float = 1.0

class TaskRequirementOut(BaseModel):
    skill_id: int
    skill_name: str
    min_proficiency: int
    min_experience: float

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    required_role_id: Optional[int] = None
    priority: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL
    start_date: Optional[datetime] = None
    deadline: datetime
    estimated_duration_hours: float = 4.0
    location: Optional[str] = None
    shift: str = "General"
    special_instructions: Optional[str] = None
    skill_ids: Optional[List[int]] = []
    requirements: Optional[List[TaskRequirementIn]] = []
    auto_decompose: Optional[bool] = False

class TaskAssignmentOut(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    employee_code: str
    assigned_at: datetime
    status: str
    progress_percent: int
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int
    task_code: str
    org_id: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    required_role_id: Optional[int] = None
    required_role_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    start_date: Optional[datetime] = None
    deadline: datetime
    estimated_duration_hours: float
    location: Optional[str] = None
    shift: str
    special_instructions: Optional[str] = None
    subtasks_json: Optional[List[Dict[str, Any]]] = None
    ai_decomposition_json: Optional[Dict[str, Any]] = None
    requirements: List[TaskRequirementOut] = []
    assignments: List[TaskAssignmentOut] = []
    current_assignment: Optional[TaskAssignmentOut] = None
    created_at: datetime
    class Config:
        from_attributes = True

class TaskStatusUpdate(BaseModel):
    status: str # ACCEPTED, IN_PROGRESS, PAUSED, COMPLETED, DELAYED
    progress_percent: Optional[int] = None
    notes: Optional[str] = None

# --- AI & Scheduling Schemas ---
class CandidateScoreBreakdown(BaseModel):
    skill_match: float
    department_match: float
    availability_match: float
    experience_match: float
    workload_balance: float
    schedule_fit: float

class CandidateMatch(BaseModel):
    user_id: int
    user_code: str
    full_name: str
    role_name: str
    department_name: str
    match_score: float # 0 - 100
    breakdown: CandidateScoreBreakdown
    reason: str
    is_available: bool
    current_workload: float
    experience_years: float
    matched_skills: List[str]
    missing_skills: List[str]

class AIScheduleResponse(BaseModel):
    task_id: int
    task_code: str
    recommended_employee: Optional[CandidateMatch] = None
    alternative_employees: List[CandidateMatch] = []
    reasoning_summary: str
    conflicts: List[str] = []
    warnings: List[str] = []
    ai_autonomy_level: int = 1

class ApproveAssignmentRequest(BaseModel):
    task_id: int
    employee_id: int
    notes: Optional[str] = None

class ReassignTaskRequest(BaseModel):
    task_id: int
    new_employee_id: int
    reason: str

# --- Availability & Leave ---
class AvailabilityUpdate(BaseModel):
    status: str # AVAILABLE, ON_LEAVE, UNAVAILABLE, SICK, EMERGENCY, SHIFT_CHANGE
    reason: Optional[str] = None
    date_str: Optional[str] = None

# --- Escalation ---
class EscalationCreate(BaseModel):
    task_id: int
    reason: str
    level: int = 1

class EscalationOut(BaseModel):
    id: int
    org_id: str
    task_id: int
    task_code: str
    task_title: str
    from_user_id: Optional[int] = None
    from_user_name: Optional[str] = None
    to_user_id: Optional[int] = None
    to_user_name: Optional[str] = None
    level: int
    reason: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Notifications & Audit ---
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    actor_name: str
    action: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class AIActivityOut(BaseModel):
    id: int
    task_id: Optional[int] = None
    agent_name: str
    action: str
    details: str
    timestamp: datetime
    class Config:
        from_attributes = True
