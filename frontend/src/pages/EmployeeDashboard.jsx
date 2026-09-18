import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, userAPI } from '../services/api';
import { 
  CheckSquare, Clock, CheckCircle2, Play, Pause, AlertCircle, 
  Calendar, UserCheck, RefreshCw, Send, Sliders 
} from 'lucide-react';

export const EmployeeDashboard = ({ onNavigate }) => {
  const { user, getTerm } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState('ON_LEAVE');
  const [leaveReason, setLeaveReason] = useState('Personal Emergency');
  const [actionLoading, setActionLoading] = useState(false);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        taskAPI.getTasks(),
        userAPI.getProfile()
      ]);
      setTasks(tRes.data);
      setProfile(pRes.data);
    } catch (err) {
      console.error('Failed to load employee data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus, currentProgress) => {
    setActionLoading(true);
    try {
      let progress = currentProgress;
      if (newStatus === 'COMPLETED') progress = 100;
      if (newStatus === 'IN_PROGRESS' && progress === 0) progress = 25;

      await taskAPI.updateStatus(taskId, {
        status: newStatus,
        progress_percent: progress
      });
      await loadEmployeeData();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProgressChange = async (taskId, newPercent, currentStatus) => {
    try {
      await taskAPI.updateStatus(taskId, {
        status: currentStatus,
        progress_percent: newPercent
      });
      // Update local state smoothly
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId && t.current_assignment) {
            return {
              ...t,
              current_assignment: { ...t.current_assignment, progress_percent: newPercent }
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userAPI.updateAvailability({
        status: leaveStatus,
        reason: leaveReason
      });
      setShowLeaveModal(false);
      await loadEmployeeData();
    } catch (err) {
      console.error('Failed to submit leave', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Retrieving assigned workspace...</span>
        </div>
      </div>
    );
  }

  const activeAssigned = tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED');
  const completedAssigned = tasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Employee Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              My Personal Workstation
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {profile.role_name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong>{profile.full_name}</strong> • Department: {profile.department_name || 'Core'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-600/30 transition"
          >
            <Clock className="w-4 h-4" />
            <span>Apply Leave / Availability</span>
          </button>
          <button
            onClick={loadEmployeeData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Workload and Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>My Current Workload</span>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{profile.current_workload_percent}%</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                profile.current_workload_percent > 80 ? 'bg-rose-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${profile.current_workload_percent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Tasks in Progress</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{activeAssigned.length}</div>
          <div className="text-[11px] text-slate-400">Scheduled for execution</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Availability Status</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                profile.current_availability_status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {profile.current_availability_status}
          </div>
          <div className="text-[11px] text-slate-400">Shift: {profile.current_shift}</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Assigned {getTerm('task', 'Tasks')}</h2>
          <span className="text-xs text-slate-400">{tasks.length} total</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No active tasks currently assigned to you.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const assign = task.current_assignment;
              const isCompleted = task.status === 'COMPLETED';
              const isInProgress = task.status === 'IN_PROGRESS';
              const progressVal = assign?.progress_percent || 0;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition space-y-4 ${
                    isCompleted
                      ? 'bg-slate-900/60 border-slate-800/60 opacity-80'
                      : 'bg-slate-900 border-slate-800 shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {task.task_code}
                        </span>
                        <h3 className="font-bold text-white text-sm">{task.title}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isCompleted && (
                        <>
                          {task.status !== 'IN_PROGRESS' ? (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS', progressVal)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Start Task</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'PAUSED', progressVal)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleUpdateStatus(task.id, 'COMPLETED', 100)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Complete</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Task Completed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress slider and stats */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Task Progress</span>
                      <span className="font-bold text-white">{progressVal}%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressVal}
                      disabled={isCompleted}
                      onChange={(e) => handleProgressChange(task.id, parseInt(e.target.value), task.status)}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Deadline: <strong className="text-slate-200">{new Date(task.deadline).toLocaleString()}</strong></span>
                      <span>Estimated Duration: <strong className="text-slate-200">{task.estimated_duration_hours} hrs</strong></span>
                      <span>Status: <strong className="text-indigo-400">{task.status}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Update Availability / Request Leave</h3>
            <p className="text-xs text-slate-400">
              When set to On Leave or Unavailable, the AI Conflict Detection Agent will immediately search replacements for your assigned tasks.
            </p>

            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={leaveStatus}
                  onChange={(e) => setLeaveStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                  <option value="AVAILABLE">Back to Available</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                  placeholder="e.g. Medical emergency or personal leave"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
