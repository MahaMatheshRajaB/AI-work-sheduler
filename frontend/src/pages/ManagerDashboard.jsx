import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, userAPI, scheduleAPI } from '../services/api';
import { 
  CheckSquare, Users, Bot, AlertTriangle, Clock, CheckCircle2, 
  ArrowRight, Sparkles, RefreshCw, ChevronRight, UserCheck, Play 
} from 'lucide-react';

export const ManagerDashboard = ({ onNavigate, onSelectTaskForSchedule }) => {
  const { user, getTerm } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([
        taskAPI.getTasks(),
        userAPI.getTeam()
      ]);
      setTasks(tRes.data);
      setTeam(uRes.data);
    } catch (err) {
      console.error('Failed to load manager dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'SCHEDULED');
  const activeTasks = tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');
  const delayedTasks = tasks.filter((t) => t.status === 'DELAYED');

  const handleLaunchScheduler = (taskId) => {
    if (onSelectTaskForSchedule) {
      onSelectTaskForSchedule(taskId);
    }
    onNavigate('ai-scheduler');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Synchronizing team queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {getTerm('manager', 'Project Lead')} Operation Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Department: {user.department_name || 'General'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervise team allocations, review AI scheduling recommendations, and resolve bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <CheckSquare className="w-4 h-4" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <span>Team Calendar</span>
          </button>
          <button
            onClick={loadManagerData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Pending AI Allocation</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{pendingTasks.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Active in Sprint</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{activeTasks.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Team Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{team.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Delayed Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${delayedTasks.length > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {delayedTasks.length}
          </div>
        </div>
      </div>

      {/* Main Grid: Incoming Task Queue & Team Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incoming Tasks needing AI Scheduling */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Tasks Awaiting AI Allocation</h2>
              <p className="text-xs text-slate-400">Run AI candidate scoring or review generated assignments</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {pendingTasks.length} tasks
            </span>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                All department tasks have been scheduled and allocated.
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {t.task_code}
                      </span>
                      <span className="font-bold text-white text-sm">{t.title}</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Priority: <strong className="text-slate-300">{t.priority}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong className="text-slate-300">{t.estimated_duration_hours}h</strong></span>
                      <span>•</span>
                      <span>Deadline: <strong className="text-slate-300">{new Date(t.deadline).toLocaleDateString()}</strong></span>
                      {t.requirements.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400">{t.requirements.length} Required Skills</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleLaunchScheduler(t.id)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Schedule</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Active Tasks in Progress */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-bold text-white">Active Tasks in Progress</h3>
            <div className="space-y-2">
              {activeTasks.slice(0, 4).map((t) => {
                const assign = t.current_assignment;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">[{t.task_code}] {t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Assigned to: <strong className="text-indigo-300">{assign?.employee_name || 'Staff'}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-400">{assign?.progress_percent || 0}% Done</span>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${assign?.progress_percent || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Team Members & Real-time Availability */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Team Availability & Load</h2>
            <span className="text-xs text-slate-400">{team.length} members</span>
          </div>

          <div className="space-y-3">
            {team.map((m) => {
              const isLeave = m.current_availability_status !== 'AVAILABLE';
              const isOverloaded = m.current_workload_percent >= 80;
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isLeave
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : isOverloaded
                      ? 'bg-rose-950/20 border-rose-800/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{m.full_name}</span>
                        {isLeave && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                            On Leave
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.role_name}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${isOverloaded ? 'text-rose-400' : 'text-slate-300'}`}>
                        {m.current_workload_percent}%
                      </span>
                      <div className="text-[10px] text-slate-500">workload</div>
                    </div>
                  </div>

                  {/* Skills pills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                      >
                        {s.skill_name}
                      </span>
                    ))}
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLeave ? 'bg-amber-500' : isOverloaded ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, m.current_workload_percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
