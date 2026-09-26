import React from 'react';
import { X, Trophy, CheckCircle, Lock, Sparkles, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LevelRoadmapModal: React.FC = () => {
  const { isLevelModalOpen, setIsLevelModalOpen, levelTiers, user, levelProgressPercent } = useApp();

  if (!isLevelModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              🏆
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Gamification Progression: Levels 1–10</h3>
              <p className="text-xs text-slate-400">Earn XP through 2-hour daily routines, correct problem solving, and streaks</p>
            </div>
          </div>
          <button
            onClick={() => setIsLevelModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Current Rank</div>
              <div className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Level {user.level}: {user.level_name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400">Total XP</div>
              <div className="text-lg font-mono font-bold text-amber-400">{user.xp.toLocaleString()} XP</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1.5">
            <span>Progress to Next Tier</span>
            <span>{levelProgressPercent}% Completed</span>
          </div>
        </div>

        {/* Level List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {levelTiers.map((tier) => {
            const isUnlocked = user.xp >= tier.xp_needed;
            const isCurrent = user.level === tier.level;

            return (
              <div
                key={tier.level}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : isUnlocked
                    ? 'bg-slate-800/60 border-slate-700/60'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl font-bold border ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-400'
                      : isUnlocked
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                    {tier.badge}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        Level {tier.level}: {tier.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-300">
                    {tier.xp_needed.toLocaleString()} XP
                  </div>
                  <div className="mt-1">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Lock className="h-3.5 w-3.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
