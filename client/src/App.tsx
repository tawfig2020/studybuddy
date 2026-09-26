import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, BookOpen, BarChart3, 
  MessageSquare, Sparkles, CheckCircle, Flame, Layers, Shield 
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DailyRoutinePanel } from './components/DailyRoutine/DailyRoutinePanel';
import { AITutorPanel } from './components/Tutor/AITutorPanel';
import { ProgressDashboard } from './components/Analytics/ProgressDashboard';
import { TeacherDashboard } from './components/Analytics/TeacherDashboard';
import { AdminDashboard } from './components/Analytics/AdminDashboard';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { LevelRoadmapModal } from './components/Gamification/LevelRoadmapModal';
import { BadgesModal } from './components/Gamification/BadgesModal';
import { AuthModal } from './components/Auth/AuthModal';
import { ProfileSettingsModal } from './components/Profile/ProfileSettingsModal';

const MainLayout: React.FC = () => {
  const { currentSubject, user, routine, onboardingComplete } = useApp();
  const isTeacher = user.role === 'teacher';
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<'study' | 'analytics' | 'teacher' | 'admin'>(
    isAdmin ? 'admin' : isTeacher ? 'teacher' : 'study'
  );

  // Keep the visible tab aligned when the role changes via profile settings
  useEffect(() => {
    if (isAdmin) setActiveTab('admin');
    else if (isTeacher) setActiveTab('teacher');
    else setActiveTab('study');
  }, [user.role]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs (Study Engine vs Detailed Analytics) */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {!isTeacher && (
              <button
                onClick={() => setActiveTab('study')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'study'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>2-Hour Study Engine</span>
              </button>
            )}
            {!isTeacher && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Progress</span>
              </button>
            )}
            {isTeacher && (
              <button
                onClick={() => setActiveTab('teacher')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Teacher Dashboard</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secondary School Schedule: 120m Daily Routine</span>
          </div>
        </div>

        {/* Tab 1: 2-Hour Study Engine & AI Tutor */}
        {activeTab === 'study' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 2-Hour Routine Engine & Timer */}
            <div className="lg:col-span-5 space-y-6">
              <DailyRoutinePanel />

              {/* Quick Secondary Curriculum Highlights */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Secondary School Daily Schedule
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
                    <span className="font-semibold text-blue-400">1. Maths (40 mins)</span>
                    <span className="text-slate-400">Algebra, Geometry & Calc</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
                    <span className="font-semibold text-emerald-400">2. Science (40 mins)</span>
                    <span className="text-slate-400">Physics, Chem & Biology</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
                    <span className="font-semibold text-purple-400">3. English (40 mins)</span>
                    <span className="text-slate-400">PEEL, Analysis & Grammar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive AI Socratic Tutor */}
            <div className="lg:col-span-7">
              <AITutorPanel />
            </div>
          </div>
        )}

        {/* Tab 2: Progressive Visual Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <ProgressDashboard />
          </div>
        )}

        {/* Tab 3: Teacher ALC Dashboard */}
        {activeTab === 'teacher' && (
          <div className="space-y-6">
            <TeacherDashboard />
          </div>
        )}

        {/* Tab 4: Admin Oversight Dashboard */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <AdminDashboard />
          </div>
        )}

        {/* Student Onboarding Wizard */}
        {!isTeacher && !isAdmin && !onboardingComplete && <OnboardingWizard />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>StudyBuddy AI Secondary • Enforcing 2-Hour Daily Habits (Mon–Sat, Sunday Rest)</div>
          <div className="flex items-center gap-4">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>Supabase Auth & PostgreSQL</span>
            <span>•</span>
            <span>React + Recharts</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LevelRoadmapModal />
      <BadgesModal />
      <AuthModal />
      <ProfileSettingsModal />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
