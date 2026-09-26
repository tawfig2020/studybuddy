import React from 'react';
import { X, Award, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BadgesModal: React.FC = () => {
  const { isBadgesModalOpen, setIsBadgesModalOpen, badges } = useApp();

  if (!isBadgesModalOpen) return null;

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-yellow-500/20">
              🏅
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Study Badges & Achievements</h3>
              <p className="text-xs text-slate-400">
                {unlockedCount} of {badges.length} Badges Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBadgesModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'bg-slate-800/80 border-slate-700/80 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl border shrink-0 ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/40'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}>
                {badge.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-white truncate">{badge.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    +{badge.xp_value} XP
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{badge.description}</p>
                <div className="mt-2 text-[11px] font-semibold">
                  {badge.unlocked ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Unlocked {badge.date ? `(${badge.date})` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> In Progress
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
