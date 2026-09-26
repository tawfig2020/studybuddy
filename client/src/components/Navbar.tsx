import React from 'react';
import { 
  Sparkles, Flame, Trophy, Volume2, VolumeX, 
  Settings, User, GraduationCap, Clock, Award,
  LogIn, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATARS } from '../constants/levels';

export const Navbar: React.FC = () => {
  const { 
    user, 
    currentLevelTier, 
    nextLevelTier, 
    levelProgressPercent,
    recentXpGained,
    updateProfile,
    setIsProfileModalOpen,
    setIsLevelModalOpen,
    setIsBadgesModalOpen,
    setIsAuthModalOpen,
    isAuthenticated,
    signOut,
    routine
  } = useApp();

  const currentAvatar = AVATARS.find(a => a.id === user.avatar) || AVATARS[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">StudyBuddy</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                AI Secondary
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Daily 2-Hour Structured Secondary Routine
            </p>
          </div>
        </div>

        {/* Central Gamification & XP Progress */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          {/* Level & XP Widget */}
          <button
            onClick={() => setIsLevelModalOpen(true)}
            className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl px-3 py-1.5 transition group cursor-pointer shadow-sm"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base font-bold shadow-inner text-white">
              {currentLevelTier.badge}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-amber-400 group-hover:text-amber-300">
                  Lvl {user.level}
                </span>
                <span className="text-xs text-slate-300 font-semibold hidden md:inline truncate max-w-[110px]">
                  {user.level_name}
                </span>
              </div>
              <div className="w-24 sm:w-28 bg-slate-700/80 h-2 rounded-full mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-400/90 hidden lg:block">
              {user.xp.toLocaleString()} XP
            </div>
          </button>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl px-2.5 py-1.5 font-bold text-xs shadow-sm" title="Active Study Streak">
            <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
            <span>{user.streak_days}d Streak</span>
          </div>

          {/* Badges Button */}
          <button
            onClick={() => setIsBadgesModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl px-3 py-1.5 text-xs font-semibold transition"
          >
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>Badges</span>
          </button>
        </div>

        {/* Right side controls (Sound, Profile, Auth) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sound Toggle */}
          <button
            onClick={() => updateProfile({ sound_enabled: !user.sound_enabled })}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            title={user.sound_enabled ? "Sound Effects Enabled" : "Sound Effects Muted"}
          >
            {user.sound_enabled ? (
              <Volume2 className="h-4 w-4 text-indigo-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* Settings / Profile Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 transition text-left"
          >
            <span className="text-xl leading-none">{currentAvatar.emoji}</span>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[90px]">
                {user.full_name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Settings
              </div>
            </div>
            <Settings className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-xl transition"
              title={`Signed in as ${user.email}`}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition shadow-sm shadow-indigo-600/30"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>

      {/* Real-time XP Gain Notification Floating Toast */}
      {recentXpGained && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-300">
          <Sparkles className="h-5 w-5 text-slate-950" />
          <div>
            <div className="text-sm">+{recentXpGained.amount} XP</div>
            <div className="text-xs font-medium text-slate-900/90">{recentXpGained.reason}</div>
          </div>
        </div>
      )}
    </header>
  );
};
