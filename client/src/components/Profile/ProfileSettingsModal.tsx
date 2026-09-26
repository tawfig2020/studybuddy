import React, { useState } from 'react';
import { X, Settings, Key, Volume2, Sparkles, Check, GraduationCap, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EXAM_BOARDS, AVATARS } from '../../constants/levels';

export const ProfileSettingsModal: React.FC = () => {
  const { isProfileModalOpen, setIsProfileModalOpen, user, updateProfile } = useApp();

  const [fullName, setFullName] = useState(user.full_name);
  const [gradeLevel, setGradeLevel] = useState(user.grade_level);
  const [targetExam, setTargetExam] = useState(user.target_exam);
  const [avatar, setAvatar] = useState(user.avatar);
  const [soundEnabled, setSoundEnabled] = useState(user.sound_enabled);
  const [aiProvider, setAiProvider] = useState(user.ai_provider);
  const [customApiKey, setCustomApiKey] = useState(user.custom_api_key || '');
  const [role, setRole] = useState(user.role);
  const [schoolId, setSchoolId] = useState(user.school_id || 'school-001');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isProfileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      grade_level: gradeLevel,
      target_exam: targetExam,
      avatar,
      sound_enabled: soundEnabled,
      ai_provider: aiProvider,
      custom_api_key: customApiKey,
      role,
      school_id: schoolId,
      school_name: role === 'admin' ? 'Rohingya Learning Center - Selayang' : user.school_name,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Student Profile & AI Settings</h3>
              <p className="text-xs text-slate-400">Configure secondary grade syllabus, avatar, and AI model</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Student Avatar</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.id)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    avatar === av.id
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[10px] font-semibold truncate max-w-full">{av.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Grade Level (7-12)</label>
            <input
              type="number"
              min={7}
              max={12}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(parseInt(e.target.value) || 10)}
              className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Target Exam Board */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Exam Board</label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {EXAM_BOARDS.map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
              ))}
            </select>
          </div>

          {/* Role Selector */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-rose-400" />
              <span>Account Role</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'teacher', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition ${
                    role === r
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {role !== 'student' && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Assigned School</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="school-001" className="bg-slate-900">Rohingya Learning Center - Selayang</option>
                  <option value="school-002" className="bg-slate-900">Somali Community School - KL</option>
                  <option value="school-003" className="bg-slate-900">Myanmar Education Hub - Penang</option>
                </select>
              </div>
            )}
          </div>

          {/* AI Provider Config */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">AI Tutor Engine</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAiProvider('builtin')}
                className={`p-3 rounded-xl border text-left transition ${
                  aiProvider === 'builtin'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 font-medium'
                }`}
              >
                <div className="text-xs">Built-in Secondary Tutor</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">Instant Socratic heuristics</div>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('openai')}
                className={`p-3 rounded-xl border text-left transition ${
                  aiProvider === 'openai'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 font-medium'
                }`}
              >
                <div className="text-xs">OpenAI GPT-4o</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">Connect custom API key</div>
              </button>
            </div>

            {aiProvider !== 'builtin' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Custom {aiProvider.toUpperCase()} API Key</span>
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder={`sk-... (${aiProvider} API key)`}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">Gamification Sound Effects</div>
              <div className="text-[11px] text-slate-400">Play audio cues on XP gain, level up, and timer bells</div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {savedSuccess ? <Check className="h-5 w-5 text-emerald-300" /> : <Sparkles className="h-5 w-5" />}
            <span>{savedSuccess ? 'Changes Saved!' : 'Save Profile Preferences'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
