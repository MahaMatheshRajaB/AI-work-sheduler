import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, taskAPI, escalationAPI } from '../services/api';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, Flame, Bot, 
  ArrowUpRight, Plus, RefreshCw, UserX, BarChart2, ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const HigherAuthorityDashboard = ({ onNavigate }) => {
  const { user, getTerm } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, eRes] = await Promise.all([
        analyticsAPI.getDashboardMetrics(),
        escalationAPI.getEscalations()
      ]);
      setMetrics(mRes.data);
      setEscalations(eRes.data);
    } catch (err) {
      console.error('Failed to load executive dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Synthesizing organizational metrics...</span>
        </div>
      </div>
    );
  }

  const { kpis, department_workload, employee_utilization, task_status_distribution } = metrics;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Executive Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {getTerm('higher_authority', 'Executive Lead')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global workforce capacity, autonomous task allocation, and active SLA monitoring for {user.org_name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create {getTerm('task', 'Task')}</span>
          </button>
          <button
            onClick={() => onNavigate('ai-scheduler')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>AI Scheduler</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Workforce */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Workforce</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.total_workforce}</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {kpis.active_workforce} Active on Duty
          </div>
        </div>

        {/* Active Tasks */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.active_tasks}</div>
          <div className="text-[11px] text-slate-400">
            {kpis.pending_tasks} Pending Dispatch
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{kpis.completed_tasks}</div>
          <div className="text-[11px] text-slate-400">Total verified closures</div>
        </div>

        {/* Delayed Tasks */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Delayed / At Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-bold ${kpis.delayed_tasks > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {kpis.delayed_tasks}
          </div>
          <div className="text-[11px] text-slate-400">Schedule SLA breaches</div>
        </div>

        {/* Escalated Tasks */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Escalated</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-2xl font-bold ${kpis.open_escalations > 0 ? 'text-purple-400' : 'text-slate-200'}`}>
            {kpis.open_escalations}
          </div>
          <div className="text-[11px] text-purple-400 font-medium">Requires Resolution</div>
        </div>

        {/* AI Scheduled Efficiency */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Dispatched</span>
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{kpis.ai_scheduled_count}</div>
          <div className="text-[11px] text-slate-400">{kpis.ai_events_processed} AI Events</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Workload Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Department Workforce Workload</h3>
              <p className="text-xs text-slate-400">Active assignments across organizational divisions</p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={department_workload}>
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="active_tasks" name="Active Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed_tasks" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Breakdown Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Status Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution across active states</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={task_status_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {task_status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Escalations & Personnel Availability Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Escalations List */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">High-Priority Escalations</h3>
            </div>
            <button
              onClick={() => onNavigate('escalations')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {escalations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No active escalations. System operational SLA at 100%.
              </div>
            ) : (
              escalations.slice(0, 4).map((esc) => (
                <div
                  key={esc.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                        Level {esc.level}
                      </span>
                      <span className="font-semibold text-white">[{esc.task_code}] {esc.task_title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{esc.reason}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    esc.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {esc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employee Utilization / Capacity Overview */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Key Personnel Capacity</h3>
            </div>
            <span className="text-xs text-slate-400">{kpis.on_leave_count} On Leave</span>
          </div>

          <div className="space-y-2.5">
            {employee_utilization.slice(0, 5).map((emp, i) => {
              const isOver = emp.workload >= 80;
              return (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{emp.name}</span>
                    <span className={`text-[11px] font-bold ${isOver ? 'text-rose-400' : 'text-slate-300'}`}>
                      {emp.workload}% load
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : emp.workload > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, emp.workload)}%` }}
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
