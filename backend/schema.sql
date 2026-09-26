-- StudyBuddy AI: Multi-Tenant Refugee ALC Database Schema
-- Designed for 120+ Alternative Learning Centers across Malaysia

-- 1. Community Schools (Multi-Tenant Support)
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location_state TEXT NOT NULL,
  community_type TEXT, -- e.g., 'Rohingya', 'Somali', 'Myanmar', 'Mixed'
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enhanced Student/Teacher/Admin Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  grade_level INT NOT NULL,
  academic_year_start DATE NOT NULL,
  academic_year_end DATE NOT NULL,
  avatar TEXT DEFAULT 'astronaut',
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  sound_enabled BOOLEAN DEFAULT TRUE,
  ai_provider TEXT DEFAULT 'builtin',
  custom_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Custom Curriculum & Chapters
CREATE TABLE IF NOT EXISTS student_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT CHECK (subject IN ('Maths', 'Science', 'English')) NOT NULL,
  chapter_number INT NOT NULL,
  chapter_title TEXT NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Achievement Badges Master Table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  xp_value INT DEFAULT 0,
  category TEXT -- 'streak', 'mastery', 'consistency', 'evaluation'
);

-- 5. Student Earned Badges
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 6. Evaluation Tests & Diagnostic Results
CREATE TABLE IF NOT EXISTS evaluation_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_level INT NOT NULL,
  subject TEXT NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Study Sessions (for teacher monitoring and analytics)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter_id UUID REFERENCES student_chapters(id) ON DELETE SET NULL,
  duration_minutes INT DEFAULT 0,
  questions_solved INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Teacher Class Roster / Class Groups
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  grade_level INT NOT NULL,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(class_id, student_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_school ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_chapters_user ON student_chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON student_chapters(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON study_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_eval_user ON evaluation_tests(user_id);

-- ===================== Phase 1: Expanded Schema =====================

-- 9. Academic Years (per school)
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  year_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Subjects (custom per school)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Chapters (custom per subject)
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  chapter_number INT,
  chapter_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Daily Grades
CREATE TABLE IF NOT EXISTS daily_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  date DATE NOT NULL,
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  points_earned INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Weekly Progress
CREATE TABLE IF NOT EXISTS weekly_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  week_start DATE,
  week_end DATE,
  total_minutes INT,
  days_completed INT,
  average_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tests & Evaluations
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  level INT NOT NULL,
  title TEXT NOT NULL,
  questions JSONB,
  passing_score INT DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  test_id UUID REFERENCES tests(id) NOT NULL,
  score INT,
  passed BOOLEAN,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT,
  category TEXT CHECK (category IN ('Improvement', 'Motivation', 'Challenge', 'Review')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- 16. Admin Roles
CREATE TABLE IF NOT EXISTS admins (
  id UUID REFERENCES auth.users PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  role TEXT CHECK (role IN ('SuperAdmin', 'SchoolAdmin', 'Teacher')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_academic_years_school ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_fk ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_daily_grades_user ON daily_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_user ON weekly_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
