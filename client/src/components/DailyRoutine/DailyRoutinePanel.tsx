import React, { useState } from 'react';
import { 
  Play, Pause, RotateCcw, CheckCircle2, ChevronRight, 
  Calendar, Moon, ShieldCheck, Sparkles, BookOpen, 
  Calculator, FlaskConical, PenTool, Coffee, ArrowRight, Trophy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubjectType } from '../../types';

export const DailyRoutinePanel: React.FC = () => {
  const {
    currentSubject,
    setCurrentSubject,
    routine,
    timerSecondsRemaining,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    completeCurrentSubjectSession,
    skipToNextSubject,
    toggleRestDayOverride,
    user,
    badges
  } = useApp();

  const [sundayMode, setSundayMode] = useState<'rest' | 'review' | 'showcase'>('rest');

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSession = routine.sessions.find(s => s.subject === currentSubject) || routine.sessions[0];
  const progressRatio = Math.max(0, Math.min(1, 1 - timerSecondsRemaining / (40 * 60)));
  const circleRadius = 78;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const subjectIcons: Record<SubjectType, React.ReactNode> = {
    Maths: <Calculator className="h-5 w-5 text-blue-400" />,
    Science: <FlaskConical className="h-5 w-5 text-emerald-400" />,
    English: <PenTool className="h-5 w-5 text-purple-400" />,
  };

  const subjectThemes: Record<SubjectType, { border: string; bg: string; text: string; glow: string; badge: string }> = {
    Maths: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/30',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/10',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    Science: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    English: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/30',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/10',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  };

  const activeTheme = subjectThemes[currentSubject];

  // Sunday Lockout Mode Screen (if it's Sunday and student hasn't overridden)
  if (routine.is_sunday && !routine.rest_day_override) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto py-4">
          <div className="text-center mb-6">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
              <Moon className="h-10 w-10 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Sunday Rest & Recovery Day
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Secondary school mastery requires dedicated brain recovery. Switch between rest, review, and achievement showcase to prepare for Monday.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[
              { key: 'rest', label: 'Rest', icon: Moon },
              { key: 'review', label: 'Review', icon: BookOpen },
              { key: 'showcase', label: 'Showcase', icon: Trophy },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSundayMode(tab.key as typeof sundayMode)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  sundayMode === tab.key
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rest Mode */}
          {sundayMode === 'rest' && (
            <div className="text-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400">Weekly Target</div>
                  <div className="text-lg font-bold text-white mt-1">12 Hours / 6 Days</div>
                  <div className="text-xs text-emerald-400 font-medium mt-0.5">✓ 100% On Track</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400">Active Streak</div>
                  <div className="text-lg font-bold text-orange-400 mt-1">Streak Frozen ❄️</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Protected from reset</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400">Next Session</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">Monday 4:00 PM</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Maths • Science • English</div>
                </div>
              </div>
              <button
                onClick={toggleRestDayOverride}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition"
              >
                Override Sunday Lockout (Self-Paced Study)
              </button>
            </div>
          )}

          {/* Review Mode */}
          {sundayMode === 'review' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-center">
                  <div className="text-xs text-slate-400 font-semibold">Total XP</div>
                  <div className="text-2xl font-extrabold text-white mt-1">{user?.xp ?? 0}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-center">
                  <div className="text-xs text-slate-400 font-semibold">Level</div>
                  <div className="text-2xl font-extrabold text-indigo-400 mt-1">{user?.level ?? 1}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-center">
                  <div className="text-xs text-slate-400 font-semibold">Streak</div>
                  <div className="text-2xl font-extrabold text-orange-400 mt-1">{user?.streak_days ?? 0}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-center">
                  <div className="text-xs text-slate-400 font-semibold">Study Hours</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{Math.round((user?.total_study_minutes ?? 0) / 60)}</div>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" /> This Week's Sessions
                </h3>
                <div className="space-y-2">
                  {routine.sessions.length === 0 ? (
                    <p className="text-sm text-slate-400">No sessions recorded yet.</p>
                  ) : (
                    routine.sessions.map((sess) => (
                      <div key={sess.subject} className="flex items-center justify-between bg-slate-900/50 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          {subjectIcons[sess.subject as SubjectType]}
                          <span className="text-sm font-semibold text-slate-200">{sess.subject}</span>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-slate-300">{sess.completed_minutes} / {sess.target_minutes} min</div>
                          <div className="text-slate-400">Accuracy: {sess.accuracy}%</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-sm text-indigo-200">
                <Sparkles className="h-4 w-4 inline mr-1.5 text-indigo-400" />
                Rest days protect your streak and help long-term memory. Great job studying consistently this week!
              </div>
            </div>
          )}

          {/* Achievement Showcase */}
          {sundayMode === 'showcase' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" /> Your Achievement Showcase
                </h3>
                <p className="text-xs text-slate-400 mt-1">Unlocked {badges.filter((b) => b.unlocked).length} of {badges.length} badges</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.length === 0 ? (
                  <p className="text-sm text-slate-400 col-span-full text-center">No badges loaded yet.</p>
                ) : (
                  badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                        badge.unlocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{badge.name}</div>
                        <div className="text-xs opacity-80 truncate">{badge.description}</div>
                        {badge.unlocked && badge.date && (
                          <div className="text-[10px] text-amber-300 mt-0.5">Unlocked {badge.date}</div>
                        )}
                      </div>
                      <div className="text-xs font-bold">+{badge.xp_value} XP</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 border ${activeTheme.border} rounded-3xl p-5 sm:p-7 shadow-xl transition-all relative overflow-hidden`}>
      
      {/* Top Header & Daily Routine Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Structured 2-Hour Routine
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Mon–Sat Schedule
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Secondary School Focus Block
          </h2>
        </div>

        {/* 2-Hour Daily Completion Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 min-w-[220px]">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300">Total Today</span>
            <span className="text-indigo-400">{routine.total_completed_minutes} / 120 mins</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (routine.total_completed_minutes / 120) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Subject Blocks (40 Min each) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {routine.sessions.map((sess) => {
          const isActive = sess.subject === currentSubject;
          const theme = subjectThemes[sess.subject];

          return (
            <button
              key={sess.subject}
              onClick={() => setCurrentSubject(sess.subject)}
              className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                isActive 
                  ? `${theme.border} ${theme.bg} ring-2 ring-indigo-500/30 shadow-lg` 
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {subjectIcons[sess.subject]}
                  <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {sess.subject}
                  </span>
                </div>
                {sess.is_completed ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {sess.completed_minutes} / 40m
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {sess.active_topic}
              </div>
            </button>
          );
        })}
      </div>

      {/* Center Interactive Countdown Timer & Controls */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Circular SVG Timer */}
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-48 -rotate-90 transform">
            <circle
              cx="96"
              cy="96"
              r={circleRadius}
              className="text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r={circleRadius}
              className={`${activeTheme.text} transition-all duration-500`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-wider">
              {formatTime(timerSecondsRemaining)}
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${activeTheme.text}`}>
              {currentSubject} Focus
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              40 Min Session
            </div>
          </div>
        </div>

        {/* Action Controls & Topic info */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400 font-semibold mb-1">Active Syllabus Focus</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{currentSession.active_topic}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isTimerRunning ? (
              <button
                onClick={pauseTimer}
                className="flex-1 min-w-[120px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
              >
                <Pause className="h-4 w-4 fill-current" />
                Pause Focus
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
              >
                <Play className="h-4 w-4 fill-current" />
                Start 40m Block
              </button>
            )}

            <button
              onClick={resetTimer}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
              title="Reset 40 min timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={completeCurrentSubjectSession}
              className="flex-1 min-w-[130px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finish (+150 XP)
            </button>

            <button
              onClick={skipToNextSubject}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
              title="Next Subject Block"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Earn +150 XP upon block completion
            </span>
            <span>Routine: Maths → Science → English</span>
          </div>
        </div>

      </div>

    </div>
  );
};
