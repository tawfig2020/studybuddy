import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, SubjectType } from '../../types';
import { School as SchoolIcon, GraduationCap, Calendar, BookOpen, CheckCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { apiUrl } from '../../lib/api';

const SUBJECTS: SubjectType[] = ['Maths', 'Science', 'English'];
const GRADES = Array.from({ length: 10 }, (_, i) => i + 1);

const DEFAULT_CHAPTERS: Record<SubjectType, string> = {
  Maths: 'Quadratic Equations & Factoring, Trigonometry & Circle Theorems',
  Science: "Forces, Newton's Laws & Energy, Chemical Reactions",
  English: 'PEEL Paragraphs & Textual Analysis, Persuasive Writing',
};

export const OnboardingWizard: React.FC = () => {
  const { user, schools, setOnboardingComplete, saveChapter, updateProfile, setCurrentSubject } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(schools[0] || null);
  const [grade, setGrade] = useState<number>(user.grade_level || 7);
  const [yearStart, setYearStart] = useState(user.academic_year_start || '2026-03-01');
  const [yearEnd, setYearEnd] = useState(user.academic_year_end || '2027-01-31');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([...SUBJECTS]);
  const [chaptersText, setChaptersText] = useState<Record<SubjectType, string>>({ ...DEFAULT_CHAPTERS });
  const [savedSummary, setSavedSummary] = useState<{ chapters: number; daysRemaining: number } | null>(null);

  const toggleSubject = (subject: SubjectType) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const parseChapters = (subject: SubjectType) =>
    chaptersText[subject]
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title, i) => ({
        subject,
        chapter_number: i + 1,
        chapter_title: title,
        status: (i === 0 ? 'in_progress' : 'not_started') as 'in_progress' | 'not_started',
        is_active: i === 0,
      }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist profile locally + to backend
      updateProfile({
        school_id: selectedSchool?.id ?? null,
        school_name: selectedSchool?.name ?? null,
        grade_level: grade,
        academic_year_start: yearStart,
        academic_year_end: yearEnd,
      });
      await fetch(apiUrl('/api/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: user.full_name,
          school_id: selectedSchool?.id,
          grade_level: grade,
          academic_year_start: yearStart,
          academic_year_end: yearEnd,
        }),
      }).catch(() => null);

      // Persist chapters per selected subject
      let chapterCount = 0;
      for (const subject of selectedSubjects) {
        for (const ch of parseChapters(subject)) {
          await saveChapter(ch);
          chapterCount++;
          await fetch(apiUrl(`/api/chapters?user_id=${user.id}`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ch),
          }).catch(() => null);
        }
      }

      // Fetch computed academic year stats for the summary card
      let daysRemaining = 0;
      try {
        const res = await fetch(apiUrl(`/api/academic_year/${user.id}`));
        if (res.ok) {
          const data = await res.json();
          daysRemaining = data.days_remaining ?? 0;
        }
      } catch {
        daysRemaining = Math.max(0, Math.ceil((new Date(yearEnd).getTime() - Date.now()) / 86400000));
      }

      setSavedSummary({ chapters: chapterCount, daysRemaining });
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  const handleStart = () => {
    setOnboardingComplete(true);
    setCurrentSubject(selectedSubjects[0] || 'Maths');
  };

  const steps = ['School', 'Grade & Calendar', 'Subjects & Chapters', 'Summary'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Set Up Your Academic Year</h2>
          <span className="text-xs text-slate-400">Step {step + 1} of {steps.length}</span>
        </div>

        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-indigo-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Select your Alternative Learning Center / community school.</p>
            <label className="block text-sm text-slate-300">School Name</label>
            <select
              value={selectedSchool?.id ?? ''}
              onChange={(e) => setSelectedSchool(schools.find((s) => s.id === e.target.value) || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
            >
              {schools.length === 0 && <option value="">No schools loaded</option>}
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} — {school.location_state}
                </option>
              ))}
            </select>
            {selectedSchool && (
              <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                <SchoolIcon className="h-5 w-5 text-indigo-400" />
                <div className="text-sm text-slate-300">
                  {selectedSchool.name}
                  {selectedSchool.community_type ? ` • ${selectedSchool.community_type}` : ''}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Choose your grade and academic calendar.</p>
            <div className="space-y-3">
              <label className="block text-sm text-slate-300">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
              <label className="block text-sm text-slate-300">Academic Year Start</label>
              <input
                type="date"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
              />
              <label className="block text-sm text-slate-300">Academic Year End</label>
              <input
                type="date"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Select your subjects, then list current chapters (comma separated).</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-semibold transition ${
                    selectedSubjects.includes(subject)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="accent-indigo-500"
                  />
                  {subject}
                </label>
              ))}
            </div>
            <div className="space-y-3">
              {selectedSubjects.map((subject) => (
                <div key={subject} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    {subject} Chapters
                  </div>
                  <textarea
                    value={chaptersText[subject]}
                    onChange={(e) => setChaptersText((prev) => ({ ...prev, [subject]: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-100"
                    placeholder="Chapter 1, Chapter 2, Chapter 3..."
                  />
                  <div className="text-[11px] text-slate-500">Separate chapters with commas. First chapter becomes your active chapter.</div>
                </div>
              ))}
              {selectedSubjects.length === 0 && (
                <div className="text-sm text-slate-500">Select at least one subject to continue.</div>
              )}
            </div>
          </div>
        )}

        {step === 3 && savedSummary && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="h-5 w-5" /> Setup Saved
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900 rounded-xl p-3">
                  <div className="text-xs text-slate-400">School</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{selectedSchool?.name ?? '—'}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Grade</div>
                  <div className="font-semibold text-slate-100 mt-0.5">Grade {grade}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Academic Year</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{yearStart} → {yearEnd}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Days Remaining</div>
                  <div className="font-semibold text-indigo-400 mt-0.5">{savedSummary.daysRemaining} days</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Subjects</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{selectedSubjects.join(', ')}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Chapters Saved</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{savedSummary.chapters}</div>
                </div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Weekly target: 10 hours (2h/day, Mon–Sat). Sundays are rest days.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || step === 3}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 disabled:opacity-30 hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : step === 2 ? (
            <button
              onClick={handleSave}
              disabled={saving || selectedSubjects.length === 0}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <GraduationCap className="h-4 w-4" /> {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <CheckCircle className="h-4 w-4" /> Start Studying
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
