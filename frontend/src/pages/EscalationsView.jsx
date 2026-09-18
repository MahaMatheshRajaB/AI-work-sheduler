import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { escalationAPI } from '../services/api';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, 
  ArrowUpRight, Clock, ShieldCheck, Check 
} from 'lucide-react';

export const EscalationsView = () => {
  const { user } = useAuth();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const loadEscalations = async () => {
    setLoading(true);
    try {
      const res = await escalationAPI.getEscalations();
      setEscalations(res.data);
    } catch (err) {
      console.error('Failed to load escalations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscalations();
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await escalationAPI.resolveEscalation(id);
      await loadEscalations();
    } catch (err) {
      console.error('Failed to resolve escalation', err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Hierarchical Escalations Center</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Multi-Level SLA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous escalation hierarchy: Level 1 (Manager) → Level 2 (Department Head) → Level 3 (Higher Authority).
            </p>
          </div>
        </div>

        <button
          onClick={loadEscalations}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Escalation Level Matrix Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400">Level 1 Escalation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">Operational</span>
          </div>
          <div className="text-xs text-slate-300 font-medium">Employee → Team Leader / Project Lead</div>
          <p className="text-[11px] text-slate-500">Initial progress bottlenecks and slight milestone variances.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400">Level 2 Escalation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Departmental</span>
          </div>
          <div className="text-xs text-slate-300 font-medium">Manager → Department Head / Director</div>
          <p className="text-[11px] text-slate-500">Unresolved staff unavailabilities without qualified local replacements.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-400">Level 3 Escalation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">Executive</span>
          </div>
          <div className="text-xs text-slate-300 font-medium">Department Head → Higher Authority</div>
          <p className="text-[11px] text-slate-500">Critical overdue SLA breaches threatening institutional delivery.</p>
        </div>
      </div>

      {/* Escalation records list */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading escalations...</div>
        ) : escalations.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No active escalations. System operational parameters running smoothly.
          </div>
        ) : (
          escalations.map((esc) => {
            const isResolved = esc.status === 'RESOLVED';
            const isL3 = esc.level === 3;
            const isL2 = esc.level === 2;

            return (
              <div
                key={esc.id}
                className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isResolved
                    ? 'bg-slate-900/60 border-slate-800/60 opacity-80'
                    : isL3
                    ? 'bg-rose-950/20 border-rose-800/50 shadow-lg shadow-rose-950/20'
                    : isL2
                    ? 'bg-purple-950/20 border-purple-800/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        isL3
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isL2
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      Level {esc.level} Escalation
                    </span>
                    <span className="font-mono text-xs font-bold text-white">[{esc.task_code}]</span>
                    <h3 className="font-bold text-white text-sm">{esc.task_title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {esc.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>Target Authority: <strong className="text-slate-200">{esc.to_user_name}</strong></span>
                    <span>•</span>
                    <span>Triggered: <strong className="text-slate-200">{new Date(esc.created_at).toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isResolved ? (
                    <button
                      onClick={() => handleResolve(esc.id)}
                      disabled={resolvingId === esc.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                    >
                      {resolvingId === esc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Resolve Escalation</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
