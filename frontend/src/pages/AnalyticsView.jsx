import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { 
  BarChart3, PieChart as PieChartIcon, TrendingUp, Users, 
  CheckCircle2, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

export const AnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getDashboardMetrics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Computing institutional analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, department_workload, employee_utilization, task_status_distribution } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Organization Workforce Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time resource utilization, SLA compliance, and autonomous allocation statistics.
          </p>
        </div>
        <button
          onClick={loadMetrics}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Total Workload Managed</div>
          <div className="text-2xl font-bold text-white mt-1">{kpis.total_tasks} Tasks</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">{kpis.completed_tasks} completed successfully</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">AI Scheduling Rate</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {kpis.total_tasks > 0 ? Math.round((kpis.ai_scheduled_count / kpis.total_tasks) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{kpis.ai_scheduled_count} automated allocations</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Active Workforce Capacity</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {kpis.total_workforce > 0 ? Math.round((kpis.active_workforce / kpis.total_workforce) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{kpis.active_workforce} of {kpis.total_workforce} staff available</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Schedule SLA Adherence</div>
          <div className="text-2xl font-bold text-white mt-1">
            {kpis.total_tasks > 0 ? Math.max(0, Math.round(((kpis.total_tasks - kpis.delayed_tasks) / kpis.total_tasks) * 100)) : 100}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{kpis.delayed_tasks} delayed variance</div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department workload chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Department Task Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={department_workload}>
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="active_tasks" name="Active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed_tasks" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task status distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Task Status Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={task_status_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {task_status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
