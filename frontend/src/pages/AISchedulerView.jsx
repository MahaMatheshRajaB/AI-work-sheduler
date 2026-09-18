import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, scheduleAPI } from '../services/api';
import { 
  Bot, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, 
  ArrowRight, Users, Check, RefreshCw, UserCheck, HelpCircle, 
  Sliders, Award, Zap 
} from 'lucide-react';

export const AISchedulerView = ({ initialTaskId, onTaskAssigned }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      const found = tasks.find((t) => t.id === selectedTaskId);
      setSelectedTask(found || null);
      setAiResult(null);
      setSuccessNotice(null);
    }
  }, [selectedTaskId, tasks]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await taskAPI.getTasks();
      setTasks(res.data);
      if (!selectedTaskId && res.data.length > 0) {
        setSelectedTaskId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load tasks for scheduler', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleGenerateAISchedule = async () => {
    if (!selectedTaskId) return;
    setGenerating(true);
    setSuccessNotice(null);
    try {
      const res = await scheduleAPI.generateSchedule(selectedTaskId);
      setAiResult(res.data);
    } catch (err) {
      console.error('AI Scheduling generation error', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAssignment = async (employeeId) => {
    if (!selectedTaskId) return;
    setApproving(true);
    try {
      await scheduleAPI.approveSchedule({
        task_id: selectedTaskId,
        employee_id: employeeId,
        notes: 'Approved via AI Scheduling Command Suite'
      });
      setSuccessNotice(`Assignment successfully approved and dispatched!`);
      await loadTasks();
      if (onTaskAssigned) onTaskAssigned();
    } catch (err) {
      console.error('Failed to approve assignment', err);
    } finally {
      setApproving(false);
    }
  };

  if (loadingTasks) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading tasks into AI Scheduling matrix...</span>
        </div>
      </div>
    );
  }

  const rec = aiResult?.recommended_employee;
  const alternatives = aiResult?.alternative_employees || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Scheduling & Allocation Engine</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Level 1 Autonomy
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic scoring formula: Skill (30%) + Department (20%) + Availability (20%) + Experience (10%) + Workload (10%) + Schedule (10%)
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateAISchedule}
          disabled={generating || !selectedTaskId}
          className="px-4 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{generating ? 'Orchestrating Agents...' : 'Generate AI Schedule'}</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 3-Column Advanced Scheduling Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task Selector & Requirements (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Select Task for Allocation</span>
              <span className="text-xs font-normal text-slate-400">{tasks.length} available</span>
            </h2>

            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.task_code}] {t.title} ({t.status})
                </option>
              ))}
            </select>

            {selectedTask && (
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Task Code & Title</div>
                  <div className="font-bold text-white mt-0.5">[{selectedTask.task_code}] {selectedTask.title}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Department</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{selectedTask.department_name || 'General'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Priority</span>
                    <div className="font-semibold text-amber-400 mt-0.5">{selectedTask.priority}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Duration</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{selectedTask.estimated_duration_hours} hrs</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Shift</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{selectedTask.shift}</div>
                  </div>
                </div>

                {/* Constraint Skills */}
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1.5">Required Skills Taxonomy</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.requirements.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No specific skill constraints required</span>
                    ) : (
                      selectedTask.requirements.map((r, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold">
                          {r.skill_name} (Min Lvl {r.min_proficiency})
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Deadline */}
                <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-800/30 text-[11px] text-indigo-200">
                  📅 Target Deadline: <strong>{new Date(selectedTask.deadline).toLocaleString()}</strong>
                </div>

                {selectedTask.current_assignment && (
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                    Currently Assigned To: <strong className="text-emerald-400">{selectedTask.current_assignment.employee_name}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center & Right Columns: AI Recommendation & Candidate Ranking (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!aiResult && !generating && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Ready for AI Optimization</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Generate AI Schedule" to trigger autonomous evaluation of skill overlap, current workloads, shift alignments, and candidate suitability.
              </p>
              <button
                onClick={handleGenerateAISchedule}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition inline-flex items-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Candidate Scoring Engine</span>
              </button>
            </div>
          )}

          {generating && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                <Bot className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="font-bold text-white text-base">Multi-Agent Lifecycle Active</h3>
              <div className="space-y-1 text-xs text-slate-400 font-mono">
                <div>[1/4] Task Requirements & Decomposition Analysis...</div>
                <div>[2/4] Filtering active personnel & shift constraints...</div>
                <div>[3/4] Calculating weighted multi-criteria fitness matrix...</div>
                <div>[4/4] Formulating explainable recommendation rationale...</div>
              </div>
            </div>
          )}

          {aiResult && rec && (
            <div className="space-y-4">
              {/* Primary AI Recommendation Banner */}
              <div className="bg-linear-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase flex items-center gap-1">
                        <Check className="w-3 h-3" /> Top AI Recommendation
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {rec.user_code}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mt-1.5">{rec.full_name}</h3>
                    <p className="text-xs text-indigo-300 font-medium">
                      {rec.role_name} • {rec.department_name} ({rec.experience_years} yrs exp)
                    </p>
                  </div>

                  {/* Match Score Badge */}
                  <div className="text-right sm:text-center p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 shrink-0">
                    <div className="text-3xl font-black text-indigo-400">{rec.match_score}%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Match</div>
                  </div>
                </div>

                {/* Explainability Justification Box */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Explainable AI Decision Justification</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {rec.reason}
                  </p>
                </div>

                {/* Transparent Weight Breakdown Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Skill (30%)</div>
                    <div className="font-bold text-white mt-0.5">{rec.breakdown.skill_match}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Dept (20%)</div>
                    <div className="font-bold text-white mt-0.5">{rec.breakdown.department_match}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Avail (20%)</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{rec.breakdown.availability_match}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Exp (10%)</div>
                    <div className="font-bold text-white mt-0.5">{rec.breakdown.experience_match}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Workload (10%)</div>
                    <div className="font-bold text-white mt-0.5">{rec.current_workload}% load</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Fit (10%)</div>
                    <div className="font-bold text-white mt-0.5">{rec.breakdown.schedule_fit}%</div>
                  </div>
                </div>

                {/* Approve Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleApproveAssignment(rec.user_id)}
                    disabled={approving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                  >
                    {approving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Approve & Assign to {rec.full_name.split(' ')[0]}</span>
                  </button>
                </div>
              </div>

              {/* Alternative Candidates Pool */}
              {alternatives.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Alternative Qualified Candidates
                  </h4>
                  <div className="space-y-2">
                    {alternatives.map((alt) => (
                      <div
                        key={alt.user_id}
                        className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{alt.full_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{alt.role_name}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{alt.reason}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-bold text-indigo-400 text-sm">{alt.match_score}%</span>
                            <div className="text-[10px] text-slate-500">{alt.current_workload}% load</div>
                          </div>
                          <button
                            onClick={() => handleApproveAssignment(alt.user_id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
