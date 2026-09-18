import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { scheduleAPI } from '../services/api';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ScheduleCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getCalendar();
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Workforce Schedule & Calendar</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Live Shifts & Deadlines
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Timeline visualization for tasks, operational duties, and staff assignments.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {['day', 'week', 'month'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[11px] transition ${
                  viewMode === m
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={loadCalendarEvents}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-white text-sm">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: viewMode === 'day' ? 'numeric' : undefined })}
          </span>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Delayed</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid / Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No scheduled events or assignments in this period.
          </div>
        ) : (
          events.map((ev) => {
            const isCompleted = ev.status === 'COMPLETED';
            const isDelayed = ev.status === 'DELAYED';
            const isInProgress = ev.status === 'IN_PROGRESS' || ev.status === 'ASSIGNED';

            return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition space-y-2.5 ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : isDelayed
                    ? 'bg-rose-950/20 border-rose-800/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-white text-xs line-clamp-1">{ev.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isDelayed
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 font-medium">Assignee: {ev.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deadline: {ev.end ? new Date(ev.end).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>Dept: {ev.department}</span>
                  <span className="font-semibold text-amber-400">{ev.priority}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
