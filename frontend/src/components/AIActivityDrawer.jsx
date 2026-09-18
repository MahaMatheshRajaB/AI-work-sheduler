import React, { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';
import { Bot, RefreshCw, X, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

export const AIActivityDrawer = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getAIActivities({ limit: 40 });
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to load AI activity feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
      const interval = setInterval(fetchActivities, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI Agent Activity Stream</h3>
              <p className="text-xs text-slate-400">Autonomous multi-agent lifecycle events</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live indicator banner */}
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Active Agents: 7 Orchestrated</span>
          </div>
          <span className="text-slate-400">Auto-polling 5s</span>
        </div>

        {/* Feed list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No AI Agent activities logged yet.
            </div>
          ) : (
            activities.map((act) => {
              const timeStr = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-indigo-300">{act.agent_name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>

                  <div className="text-slate-200 font-medium">{act.action}</div>
                  <p className="text-slate-400 leading-relaxed text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800/50">
                    {act.details}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
