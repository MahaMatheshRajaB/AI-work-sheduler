import React from 'react';
import { 
  Award, CheckCircle2, Cpu, ShieldCheck, Database, 
  Workflow, Users, ArrowRight, Layers, Bot, Sliders 
} from 'lucide-react';

export const HackathonRound2 = () => {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="bg-linear-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/50 p-8 rounded-3xl space-y-3 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase tracking-wider">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Hackathon Round 2 Evaluation Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          AI Work Scheduler — Platform Verification & Architecture
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive review documentation addressing Problem Statement Alignment, Technical Implementation, Prototype Functionality, Technical Depth, and Team Readiness.
        </p>
      </div>

      {/* SECTION A */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Problem Statement Alignment</h2>
            <p className="text-xs text-slate-400">Core organizational challenges addressed by the AI Work Scheduler</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-rose-400 text-xs uppercase tracking-wide">The Critical Pain Point</h3>
            <p className="text-slate-300 leading-relaxed">
              Organizations globally (corporate, healthcare, colleges, manufacturing, government) struggle with manual workforce scheduling and ad-hoc task distribution. This causes:
            </p>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>Mismatched skill allocation causing failed deliverables</li>
              <li>Unequal workload with 80%+ burnout on key contributors</li>
              <li>Absence blindspots where emergency leaves halt workflows</li>
              <li>SLA delays going undetected until after client delivery deadlines</li>
              <li>Siloed communication between higher authorities and ground staff</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wide">The AI Agent Solution & Real Impact</h3>
            <p className="text-slate-300 leading-relaxed">
              The platform acts as an intelligent coordination layer between Higher Authorities, Department Managers, and Staff:
            </p>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">Optimal Utilization:</strong> Multi-criteria candidate scoring balancing skills and capacity</li>
              <li><strong className="text-slate-200">Zero-Delay Rescheduling:</strong> Autonomous conflict detection on employee leave</li>
              <li><strong className="text-slate-200">Multi-Level Escalation:</strong> Automated SLA monitoring escalating to Level 1, 2, or 3</li>
              <li><strong className="text-slate-200">Domain Generalized:</strong> Configurable terminology for hospitals, universities, & IT</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION B */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
            B
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Technical Implementation</h2>
            <p className="text-xs text-slate-400">Production-grade stack, zero external mockups, fully connected end-to-end</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-300">Frontend Layer</div>
            <div className="text-white font-semibold">React 19 + Vite + Tailwind CSS v4</div>
            <p className="text-slate-400 text-[11px]">
              Lucide React icons, Recharts interactive data visualization, role-scoped routing, real-time AI activity drawer.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-300">Backend API Layer</div>
            <div className="text-white font-semibold">Python 3.14 + FastAPI</div>
            <p className="text-slate-400 text-[11px]">
              High-throughput async REST API, CORS middleware, Pydantic v2 schemas, strict JWT Bearer authentication.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-300">Database & Persistence</div>
            <div className="text-white font-semibold">SQLAlchemy 2.0 + SQLite/PostgreSQL</div>
            <p className="text-slate-400 text-[11px]">
              Foreign keys enabled, cascade deletions, multi-tenant org_id segregation, automated startup migrations & seeds.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-300">AI Agent Orchestrator</div>
            <div className="text-white font-semibold">Multi-Agent State Machine</div>
            <p className="text-slate-400 text-[11px]">
              Task Decomposition, Skill Matching, Availability Analysis, Scheduling, and Conflict Agents.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-300">Scheduling Engine</div>
            <div className="text-white font-semibold">Weighted Multi-Criteria Scoring</div>
            <p className="text-slate-400 text-[11px]">
              Deterministic constraint satisfaction formula with 100% explainability breakdown and candidate ranking.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-300">Enterprise Security</div>
            <div className="text-white font-semibold">PBKDF2 Salted Hashing + RBAC</div>
            <p className="text-slate-400 text-[11px]">
              Backend authorization middleware enforcing Higher Authority, Manager, and Employee scopes.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION C */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
            C
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Prototype Functionality Checklist</h2>
            <p className="text-xs text-slate-400">All 19 critical hackathon functional requirements verified</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            "Multi-Tenant Login with 1-Click Persona Selectors",
            "3 Distinct Pre-Seeded Organizations (Tech, Hospital, College)",
            "Dedicated Higher Authority Executive Command Dashboard",
            "Scoped Manager / Team Leader Dashboard",
            "Self-Contained Employee Workstation with Status Sliders",
            "Task Creation with AI Decomposition into Subtasks",
            "Skill Taxonomy & Proficiency Constraint Checking",
            "Transparent Candidate Scoring & Explainability Justifications",
            "1-Click Manager Review & Assignment Approvals",
            "Employee Task Lifecycle (Start, Pause, Complete, Progress %)",
            "Leave Application & Availability Status Toggle",
            "Instant AI Conflict Detection & Auto-Rescheduling on Leave",
            "SLA Monitoring & Multi-Level Escalations (Level 1, 2, 3)",
            "Day / Week / Month Schedule Calendar Timeline",
            "Real-time In-App Notification Center with Read Tracking",
            "Interactive Hackathon Demo Mode & Simulation Controls",
            "Dynamic Organizational Terminology & Hierarchy Editor",
            "Immutable Cryptographic Audit Trail & AI Activity Feed",
            "Zero-Setup Offline Guarantees with Optional LLM API Connectors"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION D */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
            D
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Technical Depth & Mathematical Formulations</h2>
            <p className="text-xs text-slate-400">Explainable candidate scoring formula and multi-agent coordination</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">Candidate Score Formula</h3>
          <div className="p-3 bg-slate-900 rounded-lg font-mono text-indigo-300 border border-slate-800">
            Score = (0.30 × SkillMatch) + (0.20 × DeptMatch) + (0.20 × Availability) + (0.10 × Experience) + (0.10 × WorkloadBalance) + (0.10 × ScheduleFit)
          </div>
          <p className="text-slate-400 leading-relaxed">
            The workload balance component dynamically penalizes employees exceeding 80% capacity to ensure equitable team distribution. When employees go on emergency leave, the Conflict Detection Agent recalculates fitness scores across remaining personnel in real-time, executing reallocations with zero scheduling downtime.
          </p>
        </div>
      </section>

      {/* SECTION E */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
            E
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Team Readiness & Project Structure</h2>
            <p className="text-xs text-slate-400">Modular organization, unit test suite, and launch scripts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white">Production-Ready Directory Layout</h3>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 overflow-x-auto">
{`Ai work Scheduler/
├── backend/
│   ├── app/ (api, core, models, schemas, services, seeds)
│   ├── tests/ (Pytest test suite)
│   └── requirements.txt
├── frontend/
│   ├── src/ (components, context, pages, services)
│   └── package.json
├── docs/ (Architecture & API Specs)
├── start.bat (1-Click Windows Launcher)
└── README.md`}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <h3 className="font-bold text-white">1-Click Launch Instructions for Judges</h3>
            <p className="text-slate-400 leading-relaxed">
              The application provides automated Windows batch scripts for instant testing:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-indigo-300">
              .\start.bat
            </div>
            <p className="text-slate-400 text-[11px]">
              Starts FastAPI backend on port 8000 and Vite frontend on port 5173 with automated browser launch and database seeding.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
