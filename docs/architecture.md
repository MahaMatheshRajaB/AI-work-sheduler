# System Architecture Specification

## 1. High-Level System Architecture

The AI Work Scheduler platform implements an enterprise multi-tenant architecture designed for dynamic organizational hierarchies, mathematical constraint scheduling, real-time SLA monitoring, and autonomous task reallocation.

```
+-------------------------------------------------------------+
|                      CLIENT TIERS                           |
|  - Web Application (React 19 + Vite + Tailwind CSS v4)      |
|  - Role Dashboards (Higher Authority, Manager, Employee)    |
|  - Real-time AI Agent Activity Drawer & Simulation Panel    |
+------------------------------+------------------------------+
                               | HTTPS / REST (JWT Bearer)
+------------------------------v------------------------------+
|                     FASTAPI API GATEWAY                     |
|  - Authentication & PBKDF2 Password Verification            |
|  - Multi-Tenant Isolation Middleware (org_id Filtering)     |
|  - Role-Based Access Control (RBAC Dependency Injection)    |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                 AI AGENT ORCHESTRATION LAYER                |
|  +---------------------+        +------------------------+  |
|  | Task Analysis Agent |        | Skill Matching Agent   |  |
|  +----------+----------+        +-----------+------------+  |
|             |                               |               |
|  +----------v----------+        +-----------v------------+  |
|  | Availability Agent  |        | Workload Balance Agent |  |
|  +----------+----------+        +-----------+------------+  |
|             |                               |               |
|             +---------------+---------------+               |
|                             |                               |
|               +-------------v--------------+                |
|               | Candidate Scoring Engine   |                |
|               +-------------+--------------+                |
|                             |                               |
|        +--------------------+--------------------+          |
|        |                                         |          |
|  +-----v------------------+       +--------------v-------+  |
|  | Conflict Rescheduling  |       | SLA Escalation Agent |  |
|  +------------------------+       +----------------------+  |
+------------------------------+------------------------------+
                               | ORM (SQLAlchemy 2.0)
+------------------------------v------------------------------+
|                  PERSISTENCE & DATA STORAGE                 |
|  - Relational Database (SQLite Foreign Keys / PostgreSQL)   |
|  - Multi-Tenant Entities (Organizations, Users, Tasks)      |
|  - Immutable Audit Trail & AI Trace Log                     |
+-------------------------------------------------------------+
```

## 2. Multi-Tenant Data Isolation
Every table containing organizational data includes an `org_id` column indexed for optimal query performance. All REST endpoints extract the authenticated user's `org_id` directly from the validated JWT token rather than trusting user-provided URL parameters, guaranteeing zero tenant leakage between organizations.

## 3. Autonomous Conflict Rescheduling
When an employee updates their status to `ON_LEAVE`, `SICK`, or `UNAVAILABLE`:
1. The **Conflict Detection Agent** triggers within the database transaction.
2. It queries all active, incomplete `TaskAssignment` records belonging to that user.
3. For each affected task, the **Scheduling Engine** executes candidate ranking excluding the unavailable user.
4. If a qualified alternative employee is identified with acceptable capacity, the task is reallocated, notifications are dispatched, and the change is committed to the immutable audit log.
5. If no alternative candidate meets the minimum requirements, the **SLA Escalation Agent** raises a Level 2 escalation to the Department Head.
