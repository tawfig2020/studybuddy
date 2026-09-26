import React, { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Award, Clock, Target, Calendar, 
  CheckCircle2, Sparkles, BarChart3, ChevronRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProgressDashboard: React.FC = () => {
  const { user, routine } = useApp();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const weeklyData = [
    { day: 'Mon', Maths: 85, Science: 78, English: 90, hours: 2.0, xp: 450 },
    { day: 'Tue', Maths: 88, Science: 82, English: 86, hours: 2.0, xp: 500 },
    { day: 'Wed', Maths: 92, Science: 85, English: 88, hours: 2.1, xp: 520 },
    { day: 'Thu', Maths: 80, Science: 88, English: 92, hours: 1.9, xp: 480 },
    { day: 'Fri', Maths: 95, Science: 90, English: 94, hours: 2.0, xp: 600 },
    { day: 'Sat', Maths: 90, Science: 86, English: 91, hours: 2.0, xp: 510 },
    { day: 'Sun', Maths: 0, Science: 0, English: 0, hours: 0.0, xp: 0, is_rest: true },
  ];

  const monthlyGrades = [
    { month: 'May', score: 76, grade: 'B', hours: 42 },
    { month: 'Jun', score: 81, grade: 'B+', hours: 48 },
    { month: 'Jul', score: 87, grade: 'A', hours: 50 },
    { month: 'Aug (Current)', score: 92, grade: 'A*', hours: 54 },
  ];

  const subjectStats = [
    {
      subject: 'Maths',
      accuracy: 89.2,
      hours: 34.5,
      solved: 142,
      grade: 'A*',
      color: '#3b82f6',
      topics: 'Quadratic Equations, Trigonometry, Simultaneous Systems',
    },
    {
      subject: 'Science',
      accuracy: 84.8,
      hours: 31.0,
      solved: 118,
      grade: 'A',
      color: '#10b981',
      topics: 'Forces & Energy, Stoichiometry, Cellular Respiration',
    },
    {
      subject: 'English',
      accuracy: 91.5,
      hours: 32.5,
      solved: 95,
      grade: 'A*',
      color: '#8b5cf6',
      topics: 'PEEL Paragraphs, Metaphors & Imagery, Argumentative Essays',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* Top Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white">
              Academic Progression & Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Secondary School Grade Projections & 2-Hour Daily Habit Tracking
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              timeframe === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Progression
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              timeframe === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Predicted Grades
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-400" />
            Predicted Grade
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">A* (Distinction)</div>
          <div className="text-[11px] text-emerald-400 font-medium">Top 5% of secondary cohort</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-400" />
            Total Study Hours
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {(user.total_study_minutes / 60).toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-slate-400 font-medium">2.0 hrs/day target</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Target className="h-4 w-4 text-emerald-400" />
            Overall Accuracy
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">88.5%</div>
          <div className="text-[11px] text-slate-400 font-medium">355 practice problems</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-orange-400" />
            Routine Adherence
          </div>
          <div className="text-2xl font-extrabold text-orange-400 mt-1">96%</div>
          <div className="text-[11px] text-slate-400 font-medium">Mon–Sat strict compliance</div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-200">
            {timeframe === 'weekly' ? 'Weekly Subject Performance Breakdown (%)' : 'Monthly Grade & Score Trajectory'}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {timeframe === 'weekly' ? 'Sunday is designated Rest Day' : 'Target: Grade A* on GCSE Finals'}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {timeframe === 'weekly' ? (
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="Maths" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Science" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="English" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={monthlyGrades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value: any, name: any, item: any) => [`${value}% (Grade ${item.payload.grade})`, 'Average Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Mastery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {subjectStats.map((stat) => (
          <div
            key={stat.subject}
            className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">{stat.subject}</span>
                <span 
                  className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${stat.color}20`, color: stat.color, border: `1px solid ${stat.color}40` }}
                >
                  Grade {stat.grade}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{stat.topics}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Accuracy</span>
                <span style={{ color: stat.color }}>{stat.accuracy}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.accuracy}%`, backgroundColor: stat.color }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                <span>{stat.solved} Problems Solved</span>
                <span>{stat.hours}h Studied</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
