import React, { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';
import { ShieldCheck, Bot, Clock, RefreshCw, User, FileText, Zap } from 'lucide-react';

export const AuditLogsView = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'ai'
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiActivities, setAiActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [aRes, aiRes] = await Promise.all([
        auditAPI.getAuditLogs({ limit: 60 }),
        auditAPI.getAIActivities({ limit: 60 })
      ]);
      setAuditLogs(aRes.data);
      setAiActivities(aiRes.data);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Immutable Audit Trail & AI Traces</h1>
            <p className="text-xs text-slate-400 mt-1">
              Cryptographically timestamped record of administrative actions, human decisions, and AI orchestration.
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Organizational Audit Logs ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>AI Agent Operational Traces ({aiActivities.length})</span>
        </button>
      </div>

      {/* Logs Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading audit records...</div>
        ) : activeTab === 'audit' ? (
          auditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target</th>
                    <th className="p-3.5">Details & Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {log.actor_name}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium">
                        {log.target_type}: <span className="text-white font-mono">{log.target_id}</span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          aiActivities.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No AI Agent activities logged yet.</div>
          ) : (
            <div className="p-4 space-y-2.5">
              {aiActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-indigo-300">{act.agent_name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-semibold text-white">{act.action}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-mono">
                      {act.details}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
