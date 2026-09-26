from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid
from typing import Dict, Any

class UserProfile(BaseModel):
    id: str = "demo-user-123"
    email: str = "student@studybuddy.edu"
    full_name: str = "Alex Chen"
    role: str = "student" # student | teacher | admin
    school_id: Optional[str] = None
    school_name: Optional[str] = None
    grade_level: int = 10
    academic_year_start: str = "2026-03-01"
    academic_year_end: str = "2027-01-31"
    avatar: str = "astronaut"
    xp: int = 1450
    level: int = 3
    level_name: str = "Knowledge Seeker"
    streak_days: int = 4
    total_study_minutes: int = 840
    sound_enabled: bool = True
    ai_provider: str = "builtin"
    custom_api_key: Optional[str] = None
    created_at: Optional[str] = None

class School(BaseModel):
    id: str
    name: str
    location_state: str
    community_type: Optional[str] = None
    contact_email: Optional[str] = None

class StudentChapter(BaseModel):
    id: str
    user_id: str
    subject: str # Maths, Science, English
    chapter_number: int
    chapter_title: str
    status: str = "not_started"
    is_active: bool = False

class BadgeMaster(BaseModel):
    id: str
    code: str
    title: str
    description: str
    icon: Optional[str] = None
    xp_value: int = 0
    category: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    hints: Optional[List[str]] = None
    problem_data: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    subject: str # Maths, Science, English
    chapter_title: Optional[str] = None
    chapter_number: Optional[int] = None
    grade_level: Optional[int] = 10
    school_name: Optional[str] = None
    academic_year_end: Optional[str] = None
    message: str
    chat_history: List[ChatMessage] = []
    mode: Optional[str] = "tutor"
    hint_level: Optional[int] = 0
    api_key: Optional[str] = None
    provider: Optional[str] = "builtin"

class ChatResponse(BaseModel):
    reply: str
    hints: List[str] = []
    follow_up_questions: List[str] = []
    xp_awarded: int = 0
    problem: Optional[Dict[str, Any]] = None

class EvaluationTestResult(BaseModel):
    id: str
    target_level: int
    subject: str
    score_percentage: float
    passed: bool
    taken_at: str

class XpRewardRequest(BaseModel):
    action: str
    subject: Optional[str] = None
    amount: Optional[int] = None

class XpRewardResponse(BaseModel):
    new_xp: int
    new_level: int
    level_name: str
    level_up: bool
    badge_unlocked: Optional[str] = None
    message: str

class SchoolCreate(BaseModel):
    name: str
    location_state: str
    community_type: Optional[str] = None
    contact_email: Optional[str] = None

class ProfileCreate(BaseModel):
    id: Optional[str] = None
    school_id: Optional[str] = None
    full_name: str
    role: str = "student"
    grade_level: int
    academic_year_start: str
    academic_year_end: str
    avatar: str = "astronaut"

class ChapterCreate(BaseModel):
    subject: str
    chapter_number: int
    chapter_title: str
    is_active: bool = False

class SubjectSession(BaseModel):
    subject: str
    target_minutes: int = 40
    completed_minutes: int = 0
    is_completed: bool = False
    active_topic: Optional[str] = None
    questions_solved: int = 0
    accuracy: float = 0.0

class DailyRoutineState(BaseModel):
    date: str
    is_sunday: bool = False
    total_target_minutes: int = 120
    total_completed_minutes: int = 0
    current_subject_index: int = 0
    sessions: List[SubjectSession] = []
    is_daily_goal_completed: bool = False
    rest_day_override: bool = False

class AnalyticsSummary(BaseModel):
    xp: int
    level: int
    level_name: str
    streak_days: int
    total_hours: float
    subject_stats: Dict[str, Any]
    weekly_progression: List[Dict[str, Any]]
    monthly_grades: List[Dict[str, Any]]
    badges: List[Dict[str, Any]]

class StudentProgressOverview(BaseModel):
    user_id: str
    full_name: str
    grade_level: int
    current_level: int
    total_xp: int
    days_remaining_in_year: int
    weekly_accuracy: float
    status_flag: str  # 'On Track', 'Needs Attention', 'Inactive'

class SchoolAdminDashboard(BaseModel):
    school_id: str
    school_name: str
    total_enrolled: int
    active_this_week: int
    average_school_xp: float
    at_risk_students: List[StudentProgressOverview]

class RecommendationRequest(BaseModel):
    user_id: str
    weekly_accuracy: float
    sessions_count: int
    weekly_xp: int
    monthly_accuracy: float
    completed_chapters: int
    total_chapters: int
    incorrect_quiz_logs: Optional[List[str]] = []
    subject: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommended_badges_to_award: List[str]
    strengths: List[str]
    areas_for_improvement: List[str]
    actionable_recommendations: List[str]

class AdminOversightSummary(BaseModel):
    school_id: str
    school_name: str
    total_students: int
    inactive_student_count: int
    math_avg: float
    science_avg: float
    english_avg: float
    operational_summary: str
    high_risk_students: List[str]
    classroom_recommendations: List[str]
