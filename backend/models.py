from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserProfile(BaseModel):
    id: str = "demo-user-123"
    email: str = "student@studybuddy.edu"
    full_name: str = "Alex Chen"
    grade_level: str = "Year 10 / Grade 10"
    target_exam: str = "GCSE / IGCSE"
    avatar: str = "astronaut"
    xp: int = 1450
    level: int = 3
    level_name: str = "Knowledge Seeker"
    streak_days: int = 4
    total_study_minutes: int = 840
    sound_enabled: bool = True
    ai_provider: str = "builtin" # "builtin", "openai", "anthropic", "groq"
    custom_api_key: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ChatMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    hints: Optional[List[str]] = None
    problem_data: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    subject: str # "Mathematics", "Science", "English"
    topic: Optional[str] = None
    grade_level: Optional[str] = "Year 10 / Grade 10"
    message: str
    chat_history: List[ChatMessage] = []
    mode: Optional[str] = "tutor" # "tutor", "quiz", "hint", "explain_step"
    hint_level: Optional[int] = 0 # 1, 2, 3
    api_key: Optional[str] = None
    provider: Optional[str] = "builtin"

class ChatResponse(BaseModel):
    reply: str
    hints: List[str] = []
    follow_up_questions: List[str] = []
    xp_awarded: int = 0
    problem: Optional[Dict[str, Any]] = None

class SubjectSession(BaseModel):
    subject: str # "Mathematics", "Science", "English"
    target_minutes: int = 40
    completed_minutes: int = 0
    is_completed: bool = False
    active_topic: Optional[str] = None
    questions_solved: int = 0
    accuracy: float = 85.0

class DailyRoutineState(BaseModel):
    date: str
    is_sunday: bool = False
    total_target_minutes: int = 120
    total_completed_minutes: int = 0
    current_subject_index: int = 0
    sessions: List[SubjectSession] = []
    is_daily_goal_completed: bool = False
    rest_day_override: bool = False

class XpRewardRequest(BaseModel):
    action: str # "quiz_correct", "session_complete", "streak_bonus", "hint_used"
    subject: Optional[str] = None
    amount: Optional[int] = None

class XpRewardResponse(BaseModel):
    new_xp: int
    new_level: int
    level_name: str
    level_up: bool
    badge_unlocked: Optional[str] = None
    message: str

class AnalyticsSummary(BaseModel):
    xp: int
    level: int
    level_name: str
    streak_days: int
    total_hours: float
    subject_stats: Dict[str, Dict[str, Any]]
    weekly_progression: List[Dict[str, Any]]
    monthly_grades: List[Dict[str, Any]]
    badges: List[Dict[str, Any]]
