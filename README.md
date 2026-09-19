# AI Work Scheduler 🚀
### Autonomous Multi-Organization Workforce Scheduling, Allocation, Monitoring, Rescheduling, and Escalation Platform

[![Built For](https://img.shields.io/badge/Hackathon-Round%202%20Ready-6366f1.svg)](#hackathon-round-2-evaluation)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-SQLAlchemy%20%7C%20SQLite%20%2F%20Postgres-336791.svg)](https://www.sqlalchemy.org)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20RBAC%20%7C%20PBKDF2-10B981.svg)](#security--access-control)

---

## 1. Executive Summary

Organizations across every industry—**IT & Software enterprises, Hospitals, Colleges & Universities, Manufacturing plants, and Government bodies**—rely heavily on manual, error-prone workforce scheduling. Higher authorities delegate blindly to department heads, who then assign tasks based on intuition rather than empirical data. This creates skill mismatches, severe workload imbalances (80%+ burnout on key contributors), absence blindspots when staff take emergency leaves, and delayed escalations.

**AI Work Scheduler** solves this by inserting an **Autonomous AI Agent Orchestrator** between management and staff. The platform dynamically models organizational hierarchies, evaluates multi-criteria candidate fitness, monitors real-time task progress, autonomously reallocates tasks when emergency unavailabilities occur, and escalates impending SLA breaches up a multi-tiered hierarchy.

---

## 2. Multi-Organization Domain Adaptability

The platform is **not hard-coded for software engineers**. Through configurable organizational metadata, the entire application dynamically alters its terminology, roles, shifts, and skill taxonomies:

| Dimension | IT / Software Enterprise (`ORG-TECH`) | Healthcare / Hospital (`ORG-HOSP`) | College / University (`ORG-COLL`) |
| :--- | :--- | :--- | :--- |
| **Higher Authority** | Chief Executive Officer (CEO) | Hospital Director / CMO | College Principal / Dean |
| **Manager** | Engineering Project Lead | Department Head / Charge Nurse | Head of Department (HOD) |
| **Employee / Staff** | Software Engineer / DevOps Lead | ER Physician / ICU Staff Nurse | Professor / Lab Instructor |
| **Department** | Engineering Units (ENG, QA, DevOps) | Clinical Wards (ER, ICU, Gen Med) | Academic Depts (CSE, AI & DS) |
| **Work Unit** | Sprint Task / Migration | Clinical Duty / Patient Intake | Academic Assignment / Exam Prep |
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
1. **Task Analysis Agent**: Ingests task title, description, and requirements. Generates structured subtasks and infers priority.
2. **Skill Matching Agent**: Evaluates required skill taxonomy against candidate employee verified skills and proficiency levels (1–5).
3. **Availability Agent**: Checks real-time shift calendars, verified leave records, and pending time-off requests.
4. **Workload Balancing Agent**: Computes active capacity utilization (0%–100%) based on active assignments vs weekly limits, penalizing overload.
5. **Deterministic Scheduling Engine**: Computes explainable candidate suitability scores and alternative candidate rankings.
6. **Conflict & Rescheduling Agent**: Detects when assigned personnel go on leave and immediately reallocates affected work to qualified alternatives.
7. **Monitoring & Escalation Agent**: Evaluates progress vs elapsed schedule. Dispatches Level 1, 2, or 3 escalations when milestones are breached.

---

## 4. Scheduling Algorithm & Mathematical Scoring

The platform uses a transparent, deterministic scoring engine so every allocation is explainable to judges and managers:

$$\text{Score} = (0.30 \times S) + (0.20 \times D) + (0.20 \times A) + (0.10 \times E) + (0.10 \times W) + (0.10 \times F)$$

Where:
- **Skill Match ($S$, 30%)**: Overlap ratio between task requirements and candidate's skills, weighted by verified proficiency level (1–5).
- **Department Match ($D$, 20%)**: $100\%$ if candidate is in the target department; $35\%$ for cross-department candidates.
- **Availability ($A$, 20%)**: $100\%$ if employee is available during target deadline; $0\%$ if marked `ON_LEAVE`, `SICK`, or `UNAVAILABLE`.
- **Experience Match ($E$, 10%)**: Ratio of candidate's verified tenure vs minimum required years.
- **Workload Balance ($W$, 10%)**: Inverses current capacity load. Staff with $\le 20\%$ load receive $100\%$; staff $>80\%$ load receive $5\%$.
- **Schedule Fit ($F$, 10%)**: Alignment between task shift (Morning/General/Night) and employee's working shift.

### Explainability Example
> *"David Miller selected because: High required skill match (100%) • Aligned with Core Engineering • Available during required schedule (Workload: 20%) • 5.0 years relevant experience"*

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

**Planed to :** 
        Create this webpage into a application 

**Summary:**
       AI-powered workforce scheduling platform that intelligently assigns tasks based on skills, availability, workload, experience, and schedule fit. Features autonomous task allocation, conflict-based rescheduling, SLA monitoring, multi-level escalation, and role-based dashboards for organizations.

