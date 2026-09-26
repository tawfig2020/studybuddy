export type SubjectType = 'Maths' | 'Science' | 'English';

export interface School {
  id: string;
  name: string;
  location_state: string;
  community_type?: string | null;
  contact_email?: string | null;
}

export interface StudentChapter {
  id: string;
  user_id: string;
  subject: SubjectType;
  chapter_number: number;
  chapter_title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  school_id?: string | null;
  school_name?: string | null;
  grade_level: number;
  academic_year_start: string;
  academic_year_end: string;
  target_exam?: string;
  avatar: string;
  xp: number;
  level: number;
  level_name: string;
  streak_days: number;
  total_study_minutes: number;
  sound_enabled: boolean;
  ai_provider: 'builtin' | 'openai' | 'anthropic' | 'groq';
  custom_api_key?: string;
  created_at: string;
}

export interface PracticeProblem {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  hints: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  hints?: string[];
  problem_data?: PracticeProblem;
  follow_ups?: string[];
  xp_awarded?: number;
}

export interface SubjectSession {
  subject: SubjectType;
  target_minutes: number;
  completed_minutes: number;
  is_completed: boolean;
  active_topic: string;
  questions_solved: number;
  accuracy: number;
}

export interface DailyRoutineState {
  date: string;
  is_sunday: boolean;
  total_target_minutes: number;
  total_completed_minutes: number;
  current_subject_index: number;
  sessions: SubjectSession[];
  is_daily_goal_completed: boolean;
  rest_day_override: boolean;
}

export interface LevelTier {
  level: number;
  name: string;
  xp_needed: number;
  badge: string;
  description: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string | null;
  xp_value: number;
}

export interface WeeklyDataPoint {
  day: string;
  maths: number;
  science: number;
  english: number;
  hours: number;
  xp: number;
  is_rest?: boolean;
}

export interface MonthlyGradePoint {
  month: string;
  predicted_grade: string;
  avg_score: number;
  hours: number;
}

export interface SubjectAnalytics {
  accuracy: number;
  hours_completed: number;
  problems_solved: number;
  current_grade: string;
  mastery: number;
}
