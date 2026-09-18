import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, CheckSquare, Users, Calendar, Bot, 
  AlertTriangle, BarChart3, Settings, ShieldCheck, Award,
  Clock, FileText, UserCheck, Stethoscope, GraduationCap, Briefcase
} from 'lucide-react';

export const Sidebar = ({ activePage, setActivePage }) => {
  const { user, getTerm } = useAuth();
  if (!user) return null;

  const roleLevel = user.role_level || 'EMPLOYEE';

  // Dynamic Navigation Items based on Role
  let navItems = [];

  if (roleLevel === 'HIGHER_AUTHORITY') {
    navItems = [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'tasks', label: getTerm('task', 'Tasks') + ' Management', icon: CheckSquare },
      { id: 'ai-scheduler', label: 'AI Scheduler Engine', icon: Bot, badge: 'AI' },
      { id: 'calendar', label: 'Master Schedule', icon: Calendar },
      { id: 'personnel', label: 'Workforce & Departments', icon: Users },
      { id: 'escalations', label: 'Escalations Center', icon: AlertTriangle },
      { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
      { id: 'audit-logs', label: 'Audit & AI Traces', icon: ShieldCheck },
      { id: 'settings', label: 'Organization Config', icon: Settings },
    ];
  } else if (roleLevel === 'MANAGER') {
    navItems = [
      { id: 'dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
      { id: 'tasks', label: 'Incoming & Team Tasks', icon: CheckSquare },
      { id: 'ai-scheduler', label: 'AI Smart Allocation', icon: Bot, badge: 'AI' },
      { id: 'calendar', label: 'Team Schedule Calendar', icon: Calendar },
      { id: 'team', label: 'My Team & Availability', icon: Users },
      { id: 'escalations', label: 'Active Escalations', icon: AlertTriangle },
      { id: 'analytics', label: 'Department Analytics', icon: BarChart3 },
    ];
  } else {
    // EMPLOYEE
    navItems = [
      { id: 'dashboard', label: 'My Workspace', icon: LayoutDashboard },
      { id: 'my-tasks', label: 'My Active Tasks', icon: CheckSquare },
      { id: 'calendar', label: 'My Schedule', icon: Calendar },
      { id: 'leave', label: 'Leave & Availability', icon: Clock },
      { id: 'profile', label: 'My Skills & Profile', icon: UserCheck },
    ];
  }

  // Always include Hackathon Round 2 Tab for presentation!
  const footerItems = [
    { id: 'hackathon-round2', label: 'Hackathon Round 2', icon: Award, special: true }
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role scope banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Authority Scope
        </div>
        <div className="flex items-center gap-2">
          {user.org_type === 'Healthcare' ? (
            <Stethoscope className="w-4 h-4 text-emerald-400" />
          ) : user.org_type === 'College' ? (
            <GraduationCap className="w-4 h-4 text-amber-400" />
          ) : (
            <Briefcase className="w-4 h-4 text-indigo-400" />
          )}
          <span className="font-semibold text-white text-xs truncate">
            {user.role_name || user.role_level}
          </span>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  isActive ? 'bg-indigo-700 text-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Navigation: Hackathon Documentation */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        {footerItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
