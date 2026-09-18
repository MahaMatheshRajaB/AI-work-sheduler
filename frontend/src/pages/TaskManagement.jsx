import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, orgAPI } from '../services/api';
import { 
  CheckSquare, Plus, Search, Filter, Sparkles, Clock, 
  Calendar, AlertTriangle, CheckCircle2, ChevronRight, X, RefreshCw 
} from 'lucide-react';

export const TaskManagement = ({ onLaunchScheduler }) => {
  const { user, getTerm } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deptId, setDeptId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState(4.0);
  const [deadlineDays, setDeadlineDays] = useState(2);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [autoDecompose, setAutoDecompose] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, dRes, sRes] = await Promise.all([
        taskAPI.getTasks(),
        orgAPI.getDepartments(),
        orgAPI.getSkills()
      ]);
      setTasks(tRes.data);
      setDepartments(dRes.data);
      setSkills(sRes.data);
      if (dRes.data.length > 0) setDeptId(dRes.data[0].id);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + parseInt(deadlineDays));

      await taskAPI.createTask({
        title,
        description,
        department_id: deptId ? parseInt(deptId) : null,
        priority,
        estimated_duration_hours: parseFloat(estimatedHours),
        deadline: deadlineDate.toISOString(),
        skill_ids: selectedSkillIds,
        auto_decompose: autoDecompose
      });

      setShowCreateModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedSkillIds([]);
      await loadData();
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (id) => {
    if (selectedSkillIds.includes(id)) {
      setSelectedSkillIds(selectedSkillIds.filter((s) => s !== id));
    } else {
      setSelectedSkillIds([...selectedSkillIds, id]);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.task_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {getTerm('task', 'Task')} Management & Orchestration Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, decompose with AI, monitor progress, and review assignment allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New {getTerm('task', 'Task')}</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'DELAYED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          No tasks found matching criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {t.task_code}
                  </span>
                  <h3 className="font-bold text-white text-sm">{t.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.priority === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : t.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : t.status === 'DELAYED'
                        ? 'bg-rose-500/20 text-rose-300'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{t.description}</p>

                {/* Subtasks from AI Decomposition */}
                {t.subtasks_json && t.subtasks_json.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI Decomposed Subtasks ({t.subtasks_json.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.subtasks_json.map((st, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                          {st.title} ({st.estimated_hours}h)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Dept: <strong className="text-slate-200">{t.department_name || 'General'}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-slate-200">{t.estimated_duration_hours}h</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong className="text-slate-200">{new Date(t.deadline).toLocaleDateString()}</strong></span>
                  {t.current_assignment && (
                    <>
                      <span>•</span>
                      <span>Assignee: <strong className="text-emerald-400">{t.current_assignment.employee_name} ({t.current_assignment.progress_percent}%)</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 shrink-0">
                {(t.status === 'PENDING' || t.status === 'SCHEDULED') && (
                  <button
                    onClick={() => onLaunchScheduler && onLaunchScheduler(t.id)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Scheduler</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create New {getTerm('task', 'Task')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  placeholder="e.g. Prepare annual departmental report"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  placeholder="Detailed requirements, expected deliverables, and special instructions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline (Days from now)</label>
                  <input
                    type="number"
                    min="1"
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Skills selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Required Skills</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {skills.map((s) => {
                    const isSelected = selectedSkillIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSkill(s.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Decomposition Toggle */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Task Decomposition</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Automatically partition complex requirements into structured subtasks.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoDecompose}
                  onChange={(e) => setAutoDecompose(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Create Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
