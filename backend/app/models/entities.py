from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(50), primary_key=True, index=True) # e.g. ORG-TECH, ORG-HOSP, ORG-COLL
    name = Column(String(150), nullable=False)
    org_type = Column(String(50), nullable=False) # Corporate, IT, Healthcare, College, Manufacturing, Government, etc.
    hierarchy_config = Column(JSON, nullable=True) # Dynamic levels & label mappings
    terminology_config = Column(JSON, nullable=True) # e.g. {"manager": "HOD", "employee": "Faculty", ...}
    settings_json = Column(JSON, nullable=True) # Autonomy levels, notification settings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="organization", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")
    ai_activities = relationship("AIActivityLog", back_populates="organization", cascade="all, delete-orphan")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="departments")
    users = relationship("User", back_populates="department")
    tasks = relationship("Task", back_populates="department")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    role_level = Column(String(50), nullable=False) # HIGHER_AUTHORITY, MANAGER, EMPLOYEE
    permissions_json = Column(JSON, nullable=True)

    organization = relationship("Organization", back_populates="roles")
    users = relationship("User", back_populates="role")
    tasks = relationship("Task", back_populates="required_role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_code = Column(String(50), index=True, nullable=False) # e.g. EMP-101, MGR-201, ADMIN-01
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    
    username = Column(String(80), nullable=False)
    email = Column(String(120), nullable=False)
    full_name = Column(String(120), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    experience_years = Column(Float, default=1.0)
    current_shift = Column(String(30), default="General") # Morning, General, Night
    max_weekly_hours = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="users")
    department = relationship("Department", back_populates="users")
    role = relationship("Role", back_populates="users")
    skills = relationship("EmployeeSkill", back_populates="user", cascade="all, delete-orphan")
    assignments = relationship("TaskAssignment", foreign_keys="[TaskAssignment.employee_id]", back_populates="employee")
    availabilities = relationship("AvailabilityRecord", foreign_keys="[AvailabilityRecord.user_id]", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True) # Technical, Medical, Administrative, Operations

    employee_skills = relationship("EmployeeSkill", back_populates="skill", cascade="all, delete-orphan")
    task_requirements = relationship("TaskRequirement", back_populates="skill", cascade="all, delete-orphan")

class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(Integer, default=3) # 1 to 5
    years_experience = Column(Float, default=1.0)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="employee_skills")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_code = Column(String(50), index=True, nullable=False) # e.g. TSK-101
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    required_role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="PENDING") # PENDING, SCHEDULED, ASSIGNED, IN_PROGRESS, BLOCKED, COMPLETED, DELAYED, CANCELLED, ESCALATED
    
    start_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=False)
    estimated_duration_hours = Column(Float, default=4.0)
    location = Column(String(100), nullable=True)
    shift = Column(String(30), default="General")
    
    dependencies_json = Column(JSON, nullable=True)
    special_instructions = Column(Text, nullable=True)
    subtasks_json = Column(JSON, nullable=True)
    ai_decomposition_json = Column(JSON, nullable=True)

    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="tasks")
    department = relationship("Department", back_populates="tasks")
    required_role = relationship("Role", back_populates="tasks")
    requirements = relationship("TaskRequirement", back_populates="task", cascade="all, delete-orphan")
    assignments = relationship("TaskAssignment", back_populates="task", cascade="all, delete-orphan")
    ai_recommendations = relationship("AIRecommendation", back_populates="task", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="task", cascade="all, delete-orphan")

class TaskRequirement(Base):
    __tablename__ = "task_requirements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    min_proficiency = Column(Integer, default=1)
    min_experience = Column(Float, default=1.0)

    task = relationship("Task", back_populates="requirements")
    skill = relationship("Skill", back_populates="task_requirements")

class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    status = Column(String(30), default="ASSIGNED") # ASSIGNED, ACCEPTED, IN_PROGRESS, PAUSED, COMPLETED, DELAYED, REASSIGNED
    progress_percent = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="assignments")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="assignments")

class AvailabilityRecord(Base):
    __tablename__ = "availability_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date_str = Column(String(20), nullable=False) # YYYY-MM-DD
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, ON_LEAVE, UNAVAILABLE, SICK, EMERGENCY, SHIFT_CHANGE
    reason = Column(Text, nullable=True)
    approved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id], back_populates="availabilities")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    recommended_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, nullable=False)
    breakdown_json = Column(JSON, nullable=False)
    reasoning_summary = Column(Text, nullable=False)
    alternatives_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="ai_recommendations")

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    to_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    level = Column(Integer, default=1) # 1: Mgr, 2: Dept Head/Director, 3: Higher Authority
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="PENDING") # PENDING, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="escalations")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO") # ASSIGNMENT, DELAY, ESCALATION, REASSIGNMENT, LEAVE, SYSTEM
    is_read = Column(Boolean, default=False)
    link = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="notifications")
    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_name = Column(String(100), default="System")
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True) # Task, Assignment, Schedule, User, Leave
    target_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="audit_logs")

class AIActivityLog(Base):
    __tablename__ = "ai_activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    agent_name = Column(String(80), nullable=False) # Task Analysis Agent, Skill Matching Agent, Scheduling Agent, etc.
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="ai_activities")
