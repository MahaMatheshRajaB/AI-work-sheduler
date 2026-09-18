import React, { useState, useEffect } from 'react';
import { simulationAPI, userAPI, taskAPI } from '../services/api';
import { PlayCircle, AlertTriangle, UserX, Clock, Activity, CheckCircle, RefreshCw, X } from 'lucide-react';

export const SimulationModal = ({ isOpen, onClose, onActionCompleted }) => {
  const [activeTab, setActiveTab] = useState('leave'); // 'leave' | 'delay' | 'overload'
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [leaveReason, setLeaveReason] = useState('Emergency Family Medical Leave');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setResultMessage(null);
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        userAPI.getUsers(),
        taskAPI.getTasks()
      ]);
      setUsers(uRes.data);
      if (uRes.data.length > 0) setSelectedUserId(uRes.data[0].id);

      setTasks(tRes.data);
      if (tRes.data.length > 0) setSelectedTaskId(tRes.data[0].id);
    } catch (err) {
      console.error('Failed to fetch data for simulation', err);
    }
  };

  const handleSimulateLeave = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await simulationAPI.simulateLeave({
        user_id: selectedUserId,
        reason: leaveReason
      });
      setResultMessage({
        type: 'success',
        title: 'Leave Simulation Executed',
        detail: res.data.message,
        affected: res.data.affected_tasks
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setResultMessage({
        type: 'error',
        title: 'Simulation Failed',
        detail: err.response?.data?.detail || 'Execution error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDelay = async () => {
    if (!selectedTaskId) return;
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await simulationAPI.simulateDelay({ task_id: selectedTaskId });
      setResultMessage({
        type: 'success',
        title: 'Task Delay & Escalation Triggered',
        detail: res.data.message,
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setResultMessage({
        type: 'error',
        title: 'Simulation Failed',
        detail: err.response?.data?.detail || 'Execution error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateOverload = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await simulationAPI.simulateOverload({ user_id: selectedUserId });
      setResultMessage({
        type: 'success',
        title: 'Workload Overload Simulated',
        detail: res.data.message,
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setResultMessage({
        type: 'error',
        title: 'Simulation Failed',
        detail: err.response?.data?.detail || 'Execution error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Hackathon Presentation Simulation</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">Trigger real-time autonomous agent workflows for presentation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('leave'); setResultMessage(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'leave'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-4 h-4" />
            Simulate Leave
          </button>
          <button
            onClick={() => { setActiveTab('delay'); setResultMessage(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'delay'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Simulate Delay
          </button>
          <button
            onClick={() => { setActiveTab('overload'); setResultMessage(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'overload'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Simulate Overload
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
                💡 <strong className="text-white">What this demonstrates:</strong> Instantly sets chosen personnel to <span className="text-amber-300 font-mono">ON_LEAVE</span>. The <strong>AI Conflict Detection Agent</strong> immediately identifies all affected assigned tasks, searches the candidate pool for qualified replacements, and auto-reschedules the assignments.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Personnel</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role_name} - {u.department_name || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Leave Reason</label>
                <input
                  type="text"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSimulateLeave}
                disabled={loading || !selectedUserId}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Trigger AI Conflict & Auto-Reschedule
              </button>
            </div>
          )}

          {activeTab === 'delay' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 leading-relaxed">
                💡 <strong className="text-white">What this demonstrates:</strong> Simulates an overdue task where time has expired with low completion. The <strong>AI Monitoring & Escalation Agent</strong> detects this SLA breach and routes an automated Level 2 Escalation to Department Leadership.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Active Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-rose-500"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.task_code}] {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSimulateDelay}
                disabled={loading || !selectedTaskId}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Trigger Overdue Delay & Escalation
              </button>
            </div>
          )}

          {activeTab === 'overload' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                💡 <strong className="text-white">What this demonstrates:</strong> Injects a heavy simulated assignment (36 hours) onto an employee to raise their capacity to &gt;90%. Subsequent AI scheduling queries will automatically deprioritize this employee in favor of balanced capacity utilization.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Employee to Overload</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} (Current Workload: {u.current_workload_percent}%)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSimulateOverload}
                disabled={loading || !selectedUserId}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                Inject Heavy Workload (Simulate 90% Load)
              </button>
            </div>
          )}

          {/* Feedback message */}
          {resultMessage && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                {resultMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                {resultMessage.title}
              </div>
              <p>{resultMessage.detail}</p>
              {resultMessage.affected && resultMessage.affected.length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-800/40 space-y-1">
                  <div className="font-semibold text-white">Reallocated Tasks:</div>
                  {resultMessage.affected.map((aff, i) => (
                    <div key={i} className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <strong>{aff.task_code}</strong>: Reassigned to <span className="text-emerald-300 font-bold">{aff.new_assignee}</span> ({aff.match_score}% match).
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
