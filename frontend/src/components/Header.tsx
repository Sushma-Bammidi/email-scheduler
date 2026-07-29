import React from 'react';
import { NavLink } from 'react-router-dom';
import { Send, Clock, CheckCheck, Mail, Sparkles } from 'lucide-react';
import { StatsResponse } from '../types/email';

interface HeaderProps {
  stats?: StatsResponse | null;
}

export const Header: React.FC<HeaderProps> = ({ stats }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* App Title & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-white tracking-tight">
                  Email<span className="text-indigo-400">Scheduler</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">Automated Dispatch Engine</p>
            </div>
          </div>

          {/* Quick Stats Pills */}
          {stats && (
            <div className="hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">Scheduled:</span>
                <span className="font-bold text-white">{stats.scheduled}</span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Sent:</span>
                <span className="font-bold text-white">{stats.sent}</span>
              </div>
              {stats.failed > 0 && (
                <>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-medium text-rose-400">Failed:</span>
                    <span className="font-bold text-rose-300">{stats.failed}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Send className="w-3.5 h-3.5" />
              Compose
            </NavLink>
            <NavLink
              to="/scheduled"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Clock className="w-3.5 h-3.5" />
              Scheduled
            </NavLink>
            <NavLink
              to="/sent"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Sent
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
