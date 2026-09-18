import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Building2, Lock, User, ArrowRight, ShieldCheck, 
  Cpu, HeartPulse, GraduationCap, Check, AlertCircle 
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [orgId, setOrgId] = useState('ORG-TECH');
  const [username, setUsername] = useState('alex.ceo');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(orgId, username, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoPersona = (presetOrg, presetUser, presetPass = 'password123') => {
    setOrgId(presetOrg);
    setUsername(presetUser);
    setPassword(presetPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-400 shadow-xl shadow-indigo-500/20 text-white mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Work Scheduler</h2>
        <p className="mt-2 text-sm text-slate-400">
          Intelligent Multi-Organization Workforce Coordination Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organization ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                  placeholder="e.g. ORG-TECH"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">User ID / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                  placeholder="e.g. alex.ceo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas Selector */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Quick Demo Switcher
              </span>
              <span className="text-[11px] text-indigo-400">1-Click Login</span>
            </div>

            {/* Org 1: Tech */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>TechNova Solutions (IT Enterprise)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-TECH', 'alex.ceo')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'alex.ceo' && orgId === 'ORG-TECH'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  CEO
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-TECH', 'sarah.lead')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'sarah.lead' && orgId === 'ORG-TECH'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Lead
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-TECH', 'david.dev')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'david.dev' && orgId === 'ORG-TECH'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Dev
                </button>
              </div>
            </div>

            {/* Org 2: Hospital */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>St. Jude Memorial (Hospital)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-HOSP', 'dr.reynolds')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'dr.reynolds' && orgId === 'ORG-HOSP'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Director
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-HOSP', 'dr.patel')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'dr.patel' && orgId === 'ORG-HOSP'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ER Head
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-HOSP', 'dr.james')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'dr.james' && orgId === 'ORG-HOSP'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Doctor
                </button>
              </div>
            </div>

            {/* Org 3: College */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Apex Institute of Tech (College)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-COLL', 'prof.sharma')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'prof.sharma' && orgId === 'ORG-COLL'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-COLL', 'dr.gupta')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'dr.gupta' && orgId === 'ORG-COLL'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  HOD
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoPersona('ORG-COLL', 'arun.fac')}
                  className={`p-1.5 rounded-lg border text-center transition ${
                    username === 'arun.fac' && orgId === 'ORG-COLL'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Faculty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
