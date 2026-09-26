import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield, Users, TrendingUp, AlertTriangle, School as SchoolIcon,
  ClipboardList, CheckCircle, RefreshCw, Lock, BookOpen, BarChart3
} from 'lucide-react';
import { apiUrl } from '../../lib/api';

interface StudentProgressOverview {
  user_id: string;
  full_name: string;
  grade_level: number;
  current_level: number;
  total_xp: number;
  days_remaining_in_year: number;
  weekly_accuracy: number;
  status_flag: string;
}

interface SchoolAdminDashboard {
  school_id: string;
  school_name: string;
  total_enrolled: number;
  active_this_week: number;
  average_school_xp: number;
  at_risk_students: StudentProgressOverview[];
}

interface AdminOversightSummary {
  school_id: string;
  school_name: string;
  total_students: number;
  inactive_student_count: number;
  math_avg: number;
  science_avg: number;
  english_avg: number;
  operational_summary: string;
  high_risk_students: string[];
  classroom_recommendations: string[];
}

const ROLE_RIGHTS: { right: string; student: boolean; teacher: boolean; admin: boolean }[] = [
  { right: 'Personal study engine & AI tutor', student: true, teacher: false, admin: false },
  { right: 'Own progress analytics & badges', student: true, teacher: true, admin: true },
  { right: 'Class roster & student monitoring', student: false, teacher: true, admin: true },
  { right: 'Badge & improvement recommendations', student: false, teacher: true, admin: true },
  { right: 'School-wide metrics dashboard', student: false, teacher: false, admin: true },
  { right: 'Oversight summary & interventions', student: false, teacher: false, admin: true },
  { right: 'Manage school, teachers & students', student: false, teacher: false, admin: true },
];

const RightIcon: React.FC<{ allowed: boolean }> = ({ allowed }) =>
  allowed ? (
    <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
  ) : (
    <Lock className="h-4 w-4 text-slate-600 mx-auto" />
  );

export const AdminDashboard: React.FC = () => {
  const { user } = useApp();
  const schoolId = user.school_id || 'school-001';

  const [dashboard, setDashboard] = useState<SchoolAdminDashboard | null>(null);
  const [oversight, setOversight] = useState<AdminOversightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, overRes] = await Promise.all([
        fetch(apiUrl(`/api/v1/admin/dashboard/${schoolId}`)),
        fetch(apiUrl(`/api/v1/admin/oversight/${schoolId}`)),
      ]);
      if (dashRes.ok) setDashboard(await dashRes.json());
      else setError(`Dashboard request failed (${dashRes.status})`);
      if (overRes.ok) setOversight(await overRes.json());
    } catch (e) {
      setError('Backend unreachable — showing cached data only.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [schoolId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-400" />
            Administrator Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            School-wide oversight for {dashboard?.school_name || user.school_name || schoolId} — signed in as {user.full_name} ({user.role})
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/30 border border-rose-800/50 text-rose-300 text-sm rounded-2xl p-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* School Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <SchoolIcon className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{dashboard?.total_enrolled ?? '—'}</div>
          <div className="text-xs text-slate-400">Total Enrolled</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <Users className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-emerald-400">{dashboard?.active_this_week ?? '—'}</div>
          <div className="text-xs text-slate-400">Active This Week</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <TrendingUp className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-amber-400">{dashboard ? dashboard.average_school_xp.toLocaleString() : '—'}</div>
          <div className="text-xs text-slate-400">Avg School XP</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-rose-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-rose-400">{oversight?.inactive_student_count ?? dashboard?.at_risk_students.length ?? '—'}</div>
          <div className="text-xs text-slate-400">At Risk / Inactive</div>
        </div>
      </div>

      {/* Subject Averages */}
      {oversight && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" /> Class Subject Averages
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Maths', value: oversight.math_avg, color: 'bg-blue-500' },
              { label: 'Science', value: oversight.science_avg, color: 'bg-emerald-500' },
              { label: 'English', value: oversight.english_avg, color: 'bg-purple-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">{s.label}</span>
                  <span className="font-bold text-white">{s.value}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${s.color} h-full rounded-full`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Oversight Summary + Recommendations */}
      {oversight && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-rose-400" /> Operational Summary
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{oversight.operational_summary}</p>
            {oversight.high_risk_students.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-rose-400 mb-2">High-Risk Students</div>
                <div className="flex flex-wrap gap-2">
                  {oversight.high_risk_students.map((name) => (
                    <span key={name} className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-full font-semibold">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-400" /> Recommended Interventions
            </h3>
            <ul className="space-y-2.5">
              {oversight.classroom_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* At-Risk Student Roster */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-200">Flagged Students Requiring Attention</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading oversight data...</div>
        ) : !dashboard || dashboard.at_risk_students.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No at-risk students flagged for this school.</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-300">
              <tr>
                <th className="p-4 font-semibold">Student</th>
                <th className="p-4 font-semibold">Grade</th>
                <th className="p-4 font-semibold">Level</th>
                <th className="p-4 font-semibold">XP</th>
                <th className="p-4 font-semibold">Weekly Accuracy</th>
                <th className="p-4 font-semibold">Days Left in Year</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dashboard.at_risk_students.map((s) => (
                <tr key={s.user_id} className="bg-rose-950/10">
                  <td className="p-4 text-slate-100 font-medium">{s.full_name}</td>
                  <td className="p-4 text-slate-400">{s.grade_level}</td>
                  <td className="p-4 text-indigo-300">{s.current_level}</td>
                  <td className="p-4 text-slate-300">{s.total_xp.toLocaleString()}</td>
                  <td className="p-4 text-slate-300">{s.weekly_accuracy}%</td>
                  <td className="p-4 text-slate-300">{s.days_remaining_in_year}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                      s.status_flag === 'Inactive' ? 'text-slate-400' : 'text-rose-400'
                    }`}>
                      <AlertTriangle className="h-3 w-3" /> {s.status_flag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Roles & Rights Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-400" /> Role Permissions Matrix
        </h3>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-slate-800">
              <th className="text-left py-2.5 pr-4 font-semibold">Permission</th>
              <th className="text-center py-2.5 px-4 font-semibold">Student</th>
              <th className="text-center py-2.5 px-4 font-semibold">Teacher</th>
              <th className="text-center py-2.5 px-4 font-semibold text-rose-300">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {ROLE_RIGHTS.map((r) => (
              <tr key={r.right}>
                <td className="py-2.5 pr-4 text-slate-300">{r.right}</td>
                <td className="py-2.5 px-4 text-center"><RightIcon allowed={r.student} /></td>
                <td className="py-2.5 px-4 text-center"><RightIcon allowed={r.teacher} /></td>
                <td className="py-2.5 px-4 text-center"><RightIcon allowed={r.admin} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
