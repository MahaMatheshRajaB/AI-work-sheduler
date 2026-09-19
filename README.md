# AI Work Scheduler 🚀
### Autonomous Multi-Organization Workforce Scheduling, Allocation, Monitoring, Rescheduling, and Escalation Platform

[![Built For](https://img.shields.io/badge/Hackathon-Round%202%20Ready-6366f1.svg)](#hackathon-round-2-evaluation)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-SQLAlchemy%20%7C%20SQLite%20%2F%20Postgres-336791.svg)](https://www.sqlalchemy.org)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20RBAC%20%7C%20PBKDF2-10B981.svg)](#security--access-control)

---

## 1. Executive Summary

Every industry, from IT & Software enterprises to Hospitals, Colleges & Universities Manufacturing plants and Government bodies relies heavily on workforce scheduling. Manual scheduling is prone to errors. Higher authorities delegate scheduling to department heads. Department heads then assign tasks based on intuition than data. This creates skill mismatches, heavy workload imbalances and than 80 % burnout among key contributors. It also produces spots when staff take emergency leaves and causes delayed escalations.

**AI Work Scheduler** solves this issue by inserting an Autonomous AI Agent Orchestrator between management and staff. AI Work Scheduler dynamically models hierarchies evaluates many criteria to find the best candidate, for each task monitors real‑time task progress reallocates tasks automatically when emergency unavailabilities occur and escalates impending SLA breaches up a multi‑tiered hierarchy

---

## 2. Multi-Organization Domain Adaptability

I see that the platform is not fixed to software engineers. The platform can change its terms, roles, shifts and skill lists automatically by using adjustable organization data:

| Dimension | IT / Software Enterprise (`ORG-TECH`) | Healthcare / Hospital (`ORG-HOSP`) | College / University (`ORG-COLL`)

| :--- | :--- | :--- | :--- |

| **Higher Authority** | Chief Executive Officer (CEO) | Hospital Director / CMO | College Principal / Dean |

| **Manager** | Engineering Project Lead | Department Head / Charge Nurse | Head of Department (HOD) |

| **Employee / Staff** | Software Engineer / DevOps Lead | ER Physician / ICU Staff Nurse | Professor / Lab Instructor |

| **Department** | Engineering Units (ENG, QA, DevOps) | Clinical Wards (ER, ICU, Gen Med) | Academic Depts (CSE, AI & DS)

| **Work Unit** | Sprint Task / Migration Clinical Duty / Patient Intake | Academic Assignment / Exam Prep |

| **Key Skills** | FastAPI, React, AWS, Docker | Emergency Triage, ICU, ACLS | Pedagogy, Exam Formulation, Labs |

---

## 3. System Architecture & Multi-Agent Lifecycle

```
                                 USER
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  REACT FRONTEND │  (Vite + Tailwind v4 + Recharts)
                         └────────┬────────┘
                                  │  REST API (JWT Bearer)
                                  ▼
                         ┌─────────────────┐
                         │ FASTAPI BACKEND │  (Python 3.14 Async Routers)
                         └────────┬────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │   AI AGENT ORCHESTRATOR │
                     └────────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Task Analysis   │    │  Skill Matching  │    │  Availability &  │
│  & Decomposition │    │  Taxonomy Agent  │    │  Workload Agent  │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     ┌─────────────────────────┐
                     │ CANDIDATE SCORING ENGINE│ (Weighted Constraint Fit)
                     └───────────┬─────────────┘
                                 │
                     ┌───────────┴─────────────┐
                     │ RELATIONAL DATABASE     │ (SQLAlchemy SQLite/Postgres)
                     └───────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Conflict & Auto- │    │  Monitoring &    │    │ Real-time        │
│ Rescheduling     │    │  SLA Escalation  │    │ Notifications    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### The 7 Autonomous AI Agents

1. **Task Analysis Agent**: This agent looks at the task title, description and requirements. It then creates a list of tasks and decides which ones are most important.

2. **Skill Matching Agent**: This agent checks the skills that are needed against the skills that each employee has using a scale from one to five to show how good they are.

3. **Availability Agent**: This agent checks the shift schedules confirmed leave records and any pending time‑off requests to see who can work.

4. **Workload Balancing Agent**: This agent calculates how busy each worker is, from zero percent to one hundred percent, based on jobs and weekly limits and it reduces the load when someone is overloaded.

5. **Deterministic Scheduling Engine**: This engine calculates scores that show how suitable each candidate is and lists alternative options.

6. **Conflict & Rescheduling Agent**: This agent finds out when workers go on leave and quickly moves their work to qualified workers.

7. **Monitoring & Escalation Agent**: This agent watches progress, against the schedule. It sends Level 1  2 or 3 alerts when a milestone is missed.
---

## 4. Scheduling Algorithm & Mathematical Scoring

The platform uses a clear and definite scoring system so every assignment can be explained to judges and managers:

$$\text{Score} = (0.30 \times S) + (0.20 \times D) + (0.20 \times A). 0.10 \Times E). 0.10 \Times W). 0.10 \Times F)$$

Where:

- **Skill Match (S, 30%)**: How much the task requirements match the candidates skills, based on verified skill level (1–5).

- **Department Match (D, 20%)**: 100% if the candidate is in the department being targeted; 35% if the candidate is from a department.

- **Availability (A, 20%)**: 100% if the employee's available during the deadline; 0% if marked as ON_LEAVE, SICK or UNAVAILABLE.

- **Experience Match (E 10%)**: How long the candidate has worked compared to the required years.

- **Workload Balance (W 10%)**: This is the opposite of workload. Employees with 20% or less workload get 100%; employees with than 80% workload get 5%.

- **Schedule Fit (F, 10%)**: How well the task shift (Morning/General/Night) matches the employees shift.

### Explainability Example

> "David Miller selected because: required skill match (100%) • Aligned with Core Engineering • Available, during required schedule (Workload: 20%) • 5.0 years relevant experience"
---

## 5. Distinct Role-Based Dashboards

The application provides three strictly separated user experiences:

### Page 1: Higher Authority Dashboard (CEO / Director / Principal)
- **Global Overview**: Total workforce, active on-duty count, staff on leave, tasks in-flight vs completed.
- **Visual Analytics**: Interactive Recharts visualizations of department task volumes and status distributions.
- **Global Controls**: Cross-department task creation, organization-wide SLA escalation center, immutable audit logs.

### Page 2: Manager / Team Leader Dashboard (Project Lead / HOD / Head Nurse)
- **Department Queue**: Scoped strictly to manager's department tasks.
- **Interactive AI Scheduling Tool**: Side-by-side split screen showing task parameters, AI candidate rankings, and explainable justifications.
- **Team Availability & Workload Gauges**: Real-time load indicators (Low, Normal, Overloaded) and on-leave badges.

### Page 3: Employee Workstation (Developer / Nurse / Faculty)
- **Personalized Workspace**: Shows only authorized personal tasks with deadlines and priorities.
- **Interactive Task Lifecycle**: `Start Task`, `Pause`, `Mark Complete`, and an interactive 0%–100% progress slider.
- **Availability & Leave Request Modal**: Allows staff to toggle status to `On Leave`, `Sick`, or `Emergency`.

---

## 6. End-to-End Hackathon Demonstration Scenario

Judges can execute and verify the complete 25-step autonomous workflow:

```
Step 1:  Login as Higher Authority (Alex Mercer, CEO - ORG-TECH)
Step 2:  Click "Create Task" -> "Cloud Infrastructure Migration", require DevOps + AWS skills
Step 3:  Toggle "AI Task Decomposition" -> AI auto-partitions 3 subtasks
Step 4:  Task is dispatched to Engineering Unit queue
Step 5:  Switch persona to Manager (Sarah Chen, Project Lead)
Step 6:  Manager opens task -> Clicks "Generate AI Schedule"
Step 7:  AI Candidate Scoring Engine ranks candidates: Marcus Vance (92% match)
Step 8:  Manager clicks "Approve & Assign" -> Dispatched to employee
Step 9:  Switch persona to Employee (David Miller, Senior Dev)
Step 10: Employee views task -> Clicks "Start Task" -> Adjusts progress slider to 45%
Step 11: Employee clicks "Apply Leave / Availability" -> Sets "On Leave" (Medical Emergency)
Step 12: AI Conflict Detection Agent triggers in background:
         - Detects David Miller is assigned active task TSK-TECH-101
         - Scans remaining department staff
         - Auto-reallocates task to Sarah Chen (Project Lead)
         - In-app notifications dispatched to replacement and manager
Step 13: Manager opens "Demo Mode" -> Clicks "Simulate Task Delay & Overdue"
Step 14: AI Monitoring Agent detects 100% time expired with low progress:
         - Automatically raises Level 2 Escalation
Step 15: Switch back to Higher Authority (Alex Mercer, CEO):
         - CEO opens "Escalations Center" -> Views Level 2 alert
         - Clicks "Resolve Escalation"
Step 16: Audit Logs & AI Stream record every single autonomous step with timestamps!
```

---

## 7. Hackathon Round 2 Evaluation

### A. Problem Statement Alignment
- **Problem**: Manual scheduling creates skill mismatches, unfair workloads, unmonitored delays, and absence bottlenecks.
- **Users**: Corporations, Hospitals, Colleges, Manufacturing Units, and Government departments.
- **Impact**: Zero downtime reallocations, transparent explainability, real-time SLA breach detection, and balanced team capacity.

### B. Technical Implementation
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Backend API**: Python 3.14, FastAPI async routers, Pydantic v2 schemas.
- **Database**: Relational SQLite / PostgreSQL with foreign key pragmas and multi-tenant `org_id` indexes.
- **AI Orchestration**: Deterministic 6-parameter scoring formula + multi-agent lifecycle state machine.
- **Security**: JWT Bearer authentication, PBKDF2 SHA-256 password hashing, backend RBAC middleware.

### C. Prototype Functionality Checklist
- [x] Multi-tenant organization isolation (`ORG-TECH`, `ORG-HOSP`, `ORG-COLL`)
- [x] 1-Click persona switcher across all 3 organizations
- [x] Separate Higher Authority, Manager, and Employee dashboards
- [x] Task creation with automated AI subtask decomposition
- [x] Skill taxonomy matching and proficiency checks
- [x] Explainable candidate score breakdown
- [x] Human-in-the-loop manager approval workflow
- [x] Interactive employee task progress updates
- [x] Automatic conflict detection and rescheduling on employee leave
- [x] Multi-level hierarchical escalations (Level 1, 2, 3)
- [x] Day / Week / Month schedule calendar visualization
- [x] Real-time in-app notification center
- [x] Hackathon Demo Simulation panel
- [x] Dynamic terminology and autonomy level configuration
- [x] Cryptographically timestamped audit trail and AI agent stream

### D. Technical Depth
- **Multi-Tenant Architecture**: Strict `org_id` segregation across all database queries prevents data leaks.
- **Candidate Scoring**: Multi-variable constraint formula balancing skills, department fit, availability, tenure, workload, and shifts.
- **AI Multi-Agent State Machine**: Inter-agent message passing between Task Analysis, Skill Matching, Workload Analysis, Scheduling, Conflict, and Escalation agents.

### E. Team Readiness
- Modular, production-ready codebase with clean separation of concerns (`api/`, `core/`, `models/`, `schemas/`, `services/`, `seeds/`).
- Automated backend workflow test suite (`backend/tests/test_workflow.py`).
- 1-Click launcher scripts (`start.bat` and `start.ps1`) for Windows.

---

## 8. Demo Credentials

The platform seeds realistic demo data for 3 organizations:

| Organization | Persona | Role Level | Username | Password |
| :--- | :--- | :--- | :--- | :--- |
| **TechNova Solutions (IT)** | Alex Mercer | Higher Authority (CEO) | `alex.ceo` | `password123` |
| **TechNova Solutions (IT)** | Sarah Chen | Manager (Project Lead) | `sarah.lead` | `password123` |
| **TechNova Solutions (IT)** | David Miller | Employee (Senior Dev) | `david.dev` | `password123` |
| **St. Jude Hospital** | Dr. Arthur Reynolds | Higher Authority (Director) | `dr.reynolds` | `password123` |
| **St. Jude Hospital** | Dr. Anita Patel | Manager (ER Head) | `dr.patel` | `password123` |
| **St. Jude Hospital** | Dr. James Wilson | Employee (ER Physician) | `dr.james` | `password123` |
| **Apex Institute (College)** | Prof. R.K. Sharma | Higher Authority (Principal) | `prof.sharma` | `password123` |
| **Apex Institute (College)** | Dr. Sunita Gupta | Manager (HOD CSE) | `dr.gupta` | `password123` |
| **Apex Institute (College)** | Arun Kumar | Employee (Asst Professor) | `arun.fac` | `password123` |

---

## 9. Quick Start & Setup Instructions

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm (Tested on Node v22)
- Windows 10/11

### Option 1: 1-Click Launch (Recommended for Judges)
Simply double-click `start.bat` in the project root folder:
```cmd
start.bat
```
This automatically launches the FastAPI backend on `http://127.0.0.1:8000`, the Vite frontend on `http://localhost:5173`, and opens your default browser.

### Option 2: Manual Terminal Startup

**Terminal 1 — Backend:**
```cmd
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```cmd
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 10. Future Scope & Roadmap

1. **WhatsApp & SMS Webhook Integration**: Two-way staff availability confirmation via Twilio / WhatsApp Business API.
2. **Predictive Workload Forecasting**: Machine learning models predicting sprint velocity and clinical shift exhaustion.
3. **Advanced OR-Tools Integer Programming**: Mixed-integer linear programming (MILP) solver for multi-month nurse rostering.
4. **Voice-Based Scheduling**: Natural language speech task intake for hands-free hospital ward management.
5. **Mobile Native Application**: React Native / Flutter apps with offline shift check-in and push notifications.
6. **Enterprise SSO & Directory Sync**: SCIM and SAML 2.0 integration with Okta, Azure AD, and Google Workspace.

## **Planed to :** 
      
      We are currently working on developing this web application into a complete software solution, with plans to extend it to Android and iOS applications in the future.

As the application is now ready to be launched on the web, our next step is to collect feedback and ratings from real users. Today, we have planned to reach at least 50 users and encourage them to try the application and share their genuine feedback. This will help us understand what works well, identify areas that need improvement, and make the application more useful and user-friendly.

We also plan to share the project on LinkedIn and reach out to our connections to get more people involved in testing the application. Through this initial user feedback and networking, we hope to improve the application based on real-world usage and gradually expand its reach.

## **Summary:**
     Work Scheduler is an intelligent, organization-independent work allocation and management system that uses AI agents to automate the complete workflow from higher authorities to team leaders and employees.
When a client assigns work to an organization, the AI agent analyzes the employee’s department, skills, experience, availability, current workload, and leave status and automatically assigns the right person for the task. Work can flow from MD/Manager → Team Leader → Employee, with each role having a separate dashboard and access level.
If an employee or team leader is unavailable, overloaded, or fails to complete the assigned work, the AI agent can report the issue to the appropriate higher authority and intelligently reschedule the task to another suitable person. This creates a continuous and adaptive workflow without requiring managers to manually track every task.
The system is designed to work across IT companies, businesses, schools, colleges, hospitals, government organizations, and other institutions, adapting its scheduling rules according to the organization type and user-provided requirements.

Core idea:
“The AI agent acts as the bridge between every level of an organization—understanding the work, assigning it to the right person, monitoring progress, escalating delays, and automatically rescheduling when required.”
Each organization gets its own secure ID and password, with role-based access for Higher Authority, Team Leaders/Managers, and Employees, ensuring that users can access only the information and functions relevant to their role.

