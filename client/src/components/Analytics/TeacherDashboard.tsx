import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, TrendingUp, BookOpen, Award, AlertCircle, Calendar } from 'lucide-react';
import { apiUrl } from '../../lib/api';

interface StudentSummary {
  id: string;
  name: string;
  grade: number;
  xp: number;
  level: number;
  streak_days: number;
  weekly_hours: number;
  consistency_pct: number;
  accuracy: number;
  inactive_flag: boolean;
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useApp();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.school_id) return;
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/api/schools/${user.school_id}/students?role=${user.role}`));
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (e) {
        console.warn('Could not fetch school roster:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.school_id, user.role]);

  const average = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const totalStudents = students.length;
  const atRisk = students.filter((s) => s.inactive_flag).length;
  const avgConsistency = Math.round(average(students.map((s) => s.consistency_pct)));
  const avgAccuracy = Math.round(average(students.map((s) => s.accuracy)));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          {user.school_name || 'School'} Teacher Dashboard
        </h2>
        <p className="text-sm text-slate-400 mt-1">Welcome, {user.full_name}. Manage your ALC class and monitor student progress.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalStudents}</div>
          <div className="text-xs text-slate-400">Students</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{atRisk}</div>
          <div className="text-xs text-slate-400">At Risk</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{avgConsistency}%</div>
          <div className="text-xs text-slate-400">Avg Consistency</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{avgAccuracy}%</div>
          <div className="text-xs text-slate-400">Avg Accuracy</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading class data...</div>
      ) : students.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400">
          No students found for this school. Add students through the admin panel.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-300">
              <tr>
                <th className="p-4 font-semibold">Student</th>
                <th className="p-4 font-semibold">Grade</th>
                <th className="p-4 font-semibold">Level</th>
                <th className="p-4 font-semibold">XP</th>
                <th className="p-4 font-semibold">Streak</th>
                <th className="p-4 font-semibold">Weekly Hrs</th>
                <th className="p-4 font-semibold">Consistency</th>
                <th className="p-4 font-semibold">Accuracy</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className={s.inactive_flag ? 'bg-rose-950/10' : ''}>
                  <td className="p-4 text-slate-100 font-medium">{s.name}</td>
                  <td className="p-4 text-slate-400">{s.grade}</td>
                  <td className="p-4 text-indigo-300">{s.level}</td>
                  <td className="p-4 text-slate-300">{s.xp}</td>
                  <td className="p-4 text-slate-300">{s.streak_days}d</td>
                  <td className="p-4 text-slate-300">{s.weekly_hours}</td>
                  <td className="p-4 text-slate-300">{s.consistency_pct}%</td>
                  <td className="p-4 text-slate-300">{s.accuracy}%</td>
                  <td className="p-4">
                    {s.inactive_flag ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-bold"><AlertCircle className="h-3 w-3" /> At Risk</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold"><TrendingUp className="h-3 w-3" /> On Track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
