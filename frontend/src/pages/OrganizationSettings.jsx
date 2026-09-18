import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orgAPI } from '../services/api';
import { Settings, Building2, Sliders, CheckCircle2, Save, RefreshCw } from 'lucide-react';

export const OrganizationSettings = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Terminology state
  const [higherAuthTerm, setHigherAuthTerm] = useState('Chief Executive Officer');
  const [managerTerm, setManagerTerm] = useState('Project Lead');
  const [employeeTerm, setEmployeeTerm] = useState('Software Engineer');
  const [deptTerm, setDeptTerm] = useState('Engineering Unit');
  const [taskTerm, setTaskTerm] = useState('Sprint Task');
  const [autonomyLevel, setAutonomyLevel] = useState(1);

  const loadOrg = async () => {
    setLoading(true);
    try {
      const res = await orgAPI.getCurrent();
      setOrg(res.data);
      const terms = res.data.terminology_config || {};
      setHigherAuthTerm(terms.higher_authority || 'Chief Executive Officer');
      setManagerTerm(terms.manager || 'Project Lead');
      setEmployeeTerm(terms.employee || 'Software Engineer');
      setDeptTerm(terms.department || 'Department');
      setTaskTerm(terms.task || 'Task');
      setAutonomyLevel(res.data.settings_json?.autonomy_level || 1);
    } catch (err) {
      console.error('Failed to load organization settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrg();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await orgAPI.updateCurrent({
        terminology_config: {
          higher_authority: higherAuthTerm,
          manager: managerTerm,
          employee: employeeTerm,
          department: deptTerm,
          task: taskTerm,
        },
        settings_json: {
          autonomy_level: parseInt(autonomyLevel),
          auto_reschedule: true,
        },
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !org) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading organization settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Organization & AI Configuration</h1>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic role hierarchies, industry terminology, and AI autonomy configuration.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
          Tenant ID: {org.id}
        </span>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings and custom terminology updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">General Information</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Organization Name</label>
              <input
                type="text"
                disabled
                value={org.name}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Industry / Sector</label>
              <input
                type="text"
                disabled
                value={org.org_type}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Terminology Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Custom Organizational Terminology</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize system terminology dynamically to suit healthcare, higher education, corporate, or manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Higher Authority Title</label>
              <input
                type="text"
                value={higherAuthTerm}
                onChange={(e) => setHigherAuthTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                placeholder="e.g. CEO / MD / Principal / Hospital Director"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Manager / Department Head Title</label>
              <input
                type="text"
                value={managerTerm}
                onChange={(e) => setManagerTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                placeholder="e.g. Project Lead / HOD / Head Nurse / Supervisor"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Employee / Staff Title</label>
              <input
                type="text"
                value={employeeTerm}
                onChange={(e) => setEmployeeTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                placeholder="e.g. Engineer / Doctor / Faculty / Worker"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Department / Division Title</label>
              <input
                type="text"
                value={deptTerm}
                onChange={(e) => setDeptTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                placeholder="e.g. Unit / Ward / Academic Department"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Task / Assignment Title</label>
              <input
                type="text"
                value={taskTerm}
                onChange={(e) => setTaskTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                placeholder="e.g. Sprint Task / Clinical Duty / Exam Preparation"
              />
            </div>
          </div>
        </div>

        {/* AI Autonomy Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">AI Autonomy & Safety Level</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control the operational latitude of the AI orchestrator.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Autonomy Tier</span>
              <span className="font-bold text-indigo-400">Level {autonomyLevel}</span>
            </div>

            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={autonomyLevel}
              onChange={(e) => setAutonomyLevel(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {autonomyLevel == 1 && (
                <div>
                  <strong>Level 1 (Human-in-the-Loop):</strong> AI analyzes requirements and generates recommended assignments. Manager/Head approval is strictly required before tasks are allocated.
                </div>
              )}
              {autonomyLevel == 2 && (
                <div>
                  <strong>Level 2 (Routine Auto-Scheduling):</strong> AI automatically allocates low-to-medium priority routine tasks with &gt;90% match scores. Critical tasks still require manager approval.
                </div>
              )}
              {autonomyLevel == 3 && (
                <div>
                  <strong>Level 3 (Autonomous Rescheduling):</strong> In addition to Level 2, AI automatically executes reassignments when employees become unavailable or go on leave.
                </div>
              )}
              {autonomyLevel == 4 && (
                <div>
                  <strong>Level 4 (Full Coordination):</strong> Full autonomous scheduling, conflict detection, auto-rescheduling, and SLA escalation dispatch without human intervention.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
