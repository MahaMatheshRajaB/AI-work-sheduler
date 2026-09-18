# REST API Specification

All endpoints are prefixed with `/api/v1` and return JSON payloads. Protected endpoints require an `Authorization: Bearer <token>` header.

## 1. Authentication (`/auth`)
- `POST /auth/login`: Authenticate with `org_id`, `username`, `password`. Returns JWT token and tenant profile.
- `GET /auth/me`: Retrieve currently logged-in user profile.
- `GET /auth/demo-personas`: List preset login credentials for instant hackathon demonstration.

## 2. Organizations & Terminology (`/organizations`)
- `GET /organizations/current`: Get current tenant settings, custom terminology, and hierarchy rules.
- `PUT /organizations/current`: Update terminology mappings and AI autonomy levels.
- `GET /organizations/departments`: List organization departments.
- `POST /organizations/departments`: Create department (Higher Authority only).
- `GET /organizations/roles`: List organization roles.
- `GET /organizations/skills`: List skill taxonomy.
- `POST /organizations/skills`: Add skill (Higher Authority only).

## 3. Users & Availability (`/users`)
- `GET /users/`: List users within organization. Filtered by department for Managers.
- `GET /users/team`: List teammates in the current user's department.
- `GET /users/profile`: Get self profile with verified skills and capacity utilization.
- `POST /users/availability`: Update availability (`AVAILABLE`, `ON_LEAVE`, `SICK`, `EMERGENCY`). Automatically triggers AI Conflict Detection Agent if leave is taken!

## 4. Task Management (`/tasks`)
- `GET /tasks/`: Scoped task list (Higher Authority = all, Manager = department, Employee = assigned).
- `GET /tasks/{id}`: Task details including requirements, assignments, and subtasks.
- `POST /tasks/`: Create task with priority, deadline, skills, and optional AI decomposition.
- `POST /tasks/{id}/status`: Update progress % and status (`ACCEPTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`).

## 5. AI Scheduling Engine (`/schedules`)
- `POST /schedules/generate?task_id={id}`: Evaluate candidate pool and return transparent match scores, weight breakdowns, and explainable justifications.
- `POST /schedules/approve`: Manager or Higher Authority approves assignment.
- `POST /schedules/reassign`: Manually reassign task to alternative employee.
- `GET /schedules/calendar`: Calendar timeline events for Day/Week/Month visualizations.

## 6. Escalations (`/escalations`)
- `GET /escalations/`: List Level 1, 2, and 3 escalations.
- `POST /escalations/`: Trigger manual or automated escalation.
- `POST /escalations/{id}/resolve`: Mark escalation as resolved with audit timestamp.

## 7. Analytics & Audit (`/analytics`, `/audit`)
- `GET /analytics/dashboard`: Real-time KPIs, department workload distributions, status breakdown.
- `GET /audit/audit-logs`: Immutable organization audit trail.
- `GET /audit/ai-activity`: Real-time transparent AI multi-agent orchestration feed.

## 8. Hackathon Simulation Controls (`/simulation`)
- `POST /simulation/simulate-leave`: Simulates emergency leave for selected personnel.
- `POST /simulation/simulate-delay`: Simulates overdue SLA breach and triggers Level 2 escalation.
- `POST /simulation/simulate-overload`: Injects 36 hours of simulated work to test workload balancing penalties.
