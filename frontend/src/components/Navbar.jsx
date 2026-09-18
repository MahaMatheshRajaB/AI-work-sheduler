import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, notificationAPI } from '../services/api';
import { 
  Bot, Bell, PlayCircle, LogOut, ChevronDown, Check, User, 
  Building2, Sparkles, CheckCheck, RefreshCw 
} from 'lucide-react';

export const Navbar = ({ onOpenAIActivity, onOpenSimulation }) => {
  const { user, logout, notifications, unreadCount, refreshNotifications } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const res = await authAPI.getDemoPersonas();
        setPersonas(res.data);
      } catch (err) {
        console.error('Failed to load demo personas', err);
      }
    };
    loadPersonas();
  }, []);

  const handleSwitchPersona = async (p) => {
    setShowPersonaMenu(false);
    try {
      const res = await authAPI.login({
        org_id: p.org_id,
        username: p.username,
        password: p.password,
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch persona', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand & Org Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">AI Work Scheduler</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3 h-3 text-slate-500" />
              <span className="text-slate-300 font-medium">{user.org_name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-[11px]">{user.org_type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Quick actions, Simulation, Personas, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Hackathon Simulation Button */}
        <button
          onClick={onOpenSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold shadow-xs transition"
          title="Open Hackathon Simulation Controls"
        >
          <PlayCircle className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Demo Mode</span>
        </button>

        {/* AI Agent Activity Stream Button */}
        <button
          onClick={onOpenAIActivity}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-semibold shadow-xs transition"
          title="Open AI Orchestrator Stream"
        >
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>AI Stream</span>
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>

        {/* Switch Persona Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <span>Switch Persona</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                1-Click Persona Switcher
              </div>
              <div className="max-h-80 overflow-y-auto py-1 space-y-1">
                {personas.map((p, idx) => {
                  const isCurrent = user.username === p.username && user.org_id === p.org_id;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSwitchPersona(p)}
                      className={`w-full text-left p-2 rounded-lg flex items-start justify-between transition ${
                        isCurrent ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {p.title}
                          {isCurrent && <span className="text-[10px] text-indigo-400 font-bold">(Active)</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.org_name}</div>
                        <div className="text-[10px] text-slate-500">{p.role_level}</div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs animate-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">No notifications</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border transition ${
                        n.is_read
                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                          : 'bg-indigo-950/20 border-indigo-800/40 text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-white text-xs flex items-center justify-between">
                        <span>{n.title}</span>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile & Reset */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{user.full_name}</div>
            <div className="text-[11px] text-indigo-400 font-medium">
              {user.role_name || user.role_level}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
            title="Reset to Default Workspace"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
