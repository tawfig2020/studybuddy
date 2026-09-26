from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import datetime
import uuid

from config import XP_LEVELS, SUBJECTS, MINUTES_PER_SUBJECT, DAILY_STUDY_MINUTES
from pydantic_models import (
    UserProfile, ChatRequest, ChatResponse, SubjectSession,
    DailyRoutineState, XpRewardRequest, XpRewardResponse, AnalyticsSummary,
    School, ProfileCreate, StudentChapter, SchoolCreate, ChapterCreate
)
from ai_service_alc import generate_ai_response
from database import USE_MOCK_DB, supabase
from admin_api import router as admin_router

app = FastAPI(
    title="StudyBuddy AI Tutor API — Refugee ALC Edition",
    description="Backend API for multi-tenant secondary school / ALC AI tutor with daily routines, gamification, and chapter-aware tutoring.",
    version="2.0.0"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
] + ([FRONTEND_URL] if FRONTEND_URL else ["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)

# ---------- Mock Multi-Tenant Data (Replaces DB when no Supabase) ----------
MOCK_SCHOOLS: List[Dict[str, Any]] = [
    {"id": "school-001", "name": "Rohingya Learning Center - Selayang", "location_state": "Selangor", "community_type": "Rohingya"},
    {"id": "school-002", "name": "Somali Community School - KL", "location_state": "Kuala Lumpur", "community_type": "Somali"},
    {"id": "school-003", "name": "Myanmar Education Hub - Penang", "location_state": "Penang", "community_type": "Myanmar"},
]

MOCK_PROFILE: Dict[str, Any] = {
    "id": "user-secondary-01",
    "email": "student@secondary.edu",
    "full_name": "Ayesha Begum",
    "role": "student",
    "school_id": "school-001",
    "school_name": "Rohingya Learning Center - Selayang",
    "grade_level": 10,
    "academic_year_start": "2026-03-01",
    "academic_year_end": "2027-01-31",
    "avatar": "astronaut",
    "xp": 1450,
    "level": 3,
    "level_name": "Knowledge Seeker",
    "streak_days": 4,
    "total_study_minutes": 840,
    "sound_enabled": True,
    "ai_provider": "builtin",
    "custom_api_key": None,
}

MOCK_CHAPTERS: List[Dict[str, Any]] = [
    {"id": "ch-1", "user_id": "user-secondary-01", "subject": "Maths", "chapter_number": 1, "chapter_title": "Quadratic Equations & Factoring", "status": "completed", "is_active": False},
    {"id": "ch-2", "user_id": "user-secondary-01", "subject": "Maths", "chapter_number": 2, "chapter_title": "Trigonometry & Circle Theorems", "status": "in_progress", "is_active": True},
    {"id": "ch-3", "user_id": "user-secondary-01", "subject": "Science", "chapter_number": 1, "chapter_title": "Forces, Newton's Laws & Energy", "status": "in_progress", "is_active": True},
    {"id": "ch-4", "user_id": "user-secondary-01", "subject": "English", "chapter_number": 1, "chapter_title": "PEEL Paragraphs & Textual Analysis", "status": "not_started", "is_active": True},
]

MOCK_BADGES: List[Dict[str, Any]] = [
    {"id": "b1", "name": "First Step", "description": "Completed first study session", "icon": "🚀", "unlocked": True, "date": "2026-08-18"},
    {"id": "b2", "name": "Maths Magician", "description": "Solved 10 algebra problems", "icon": "📐", "unlocked": True, "date": "2026-08-20"},
    {"id": "b3", "name": "Streak Champion", "description": "Maintained a 4-day daily routine streak", "icon": "🔥", "unlocked": True, "date": "2026-08-22"},
    {"id": "b4", "name": "Science Whiz", "description": "Completed Forces & Newton's Laws", "icon": "🔬", "unlocked": False, "date": None},
    {"id": "b5", "name": "Master Orator", "description": "Drafted 5 persuasive essay theses", "icon": "✍️", "unlocked": False, "date": None},
    {"id": "b6", "name": "Century Club", "description": "Earned over 5,000 XP", "icon": "👑", "unlocked": False, "date": None},
]

def calculate_level(xp: int) -> tuple[int, str]:
    current_lvl = XP_LEVELS[0]["level"]
    current_name = XP_LEVELS[0]["name"]
    for tier in XP_LEVELS:
        if xp >= tier["xp_needed"]:
            current_lvl = tier["level"]
            current_name = tier["name"]
    return current_lvl, current_name

def _active_chapter(subject: str) -> Dict[str, Any]:
    for ch in MOCK_CHAPTERS:
        if ch["subject"] == subject and ch["is_active"]:
            return ch
    return {"chapter_title": None, "chapter_number": None}

# ---------- Health ----------
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": "StudyBuddy AI Tutor API — Refugee ALC Edition",
        "version": "2.0.0",
        "daily_target_minutes": DAILY_STUDY_MINUTES,
        "subjects": SUBJECTS,
        "db_mode": "mock" if USE_MOCK_DB else "supabase",
        "supabase_connected": supabase is not None
    }

# ---------- Schools (Multi-Tenant) ----------
@app.get("/api/schools")
def get_schools():
    return {"schools": MOCK_SCHOOLS}

@app.post("/api/schools")
def create_school(payload: SchoolCreate):
    new_id = f"school-{str(uuid.uuid4())[:8]}"
    new_school = {
        "id": new_id,
        "name": payload.name,
        "location_state": payload.location_state,
        "community_type": payload.community_type,
        "contact_email": payload.contact_email,
    }
    MOCK_SCHOOLS.append(new_school)
    return new_school

# ---------- Profiles ----------
@app.get("/api/profile")
def get_profile():
    return MOCK_PROFILE

@app.put("/api/profile")
def update_profile(payload: ProfileCreate):
    global MOCK_PROFILE
    MOCK_PROFILE.update(payload.dict(exclude_unset=True))
    lvl, name = calculate_level(MOCK_PROFILE["xp"])
    MOCK_PROFILE["level"] = lvl
    MOCK_PROFILE["level_name"] = name
    return MOCK_PROFILE

# ---------- Academic Year Tracking (Phase 2) ----------
@app.get("/api/academic_year/{user_id}")
def get_academic_year(user_id: str):
    """Return the student's academic year info with progress tracking.

    Calculates days remaining, weeks completed, progress percentage,
    weekly study targets (10h/week, 2h/day Mon-Sat), and monthly milestones.
    """
    start_str = MOCK_PROFILE.get("academic_year_start")
    end_str = MOCK_PROFILE.get("academic_year_end")
    if not start_str or not end_str:
        raise HTTPException(status_code=404, detail="Academic year not configured for this user")

    try:
        start = datetime.date.fromisoformat(start_str)
        end = datetime.date.fromisoformat(end_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid academic year dates in profile")

    today = datetime.date.today()
    days_total = max((end - start).days, 1)
    days_elapsed = min(max((today - start).days, 0), days_total)
    days_remaining = max((end - today).days, 0)
    progress_pct = round(days_elapsed / days_total * 100, 1)

    weeks_total = days_total // 7
    weeks_completed = days_elapsed // 7
    weeks_remaining = max(weeks_total - weeks_completed, 0)

    # Monthly milestones: first of each month boundary within the year
    milestones = []
    cursor = datetime.date(start.year, start.month, 1)
    while cursor <= end:
        month_end = (cursor.replace(day=28) + datetime.timedelta(days=4)).replace(day=1) - datetime.timedelta(days=1)
        milestone_date = min(month_end, end)
        milestones.append({
            "month": cursor.strftime("%B %Y"),
            "date": milestone_date.isoformat(),
            "status": "completed" if today > milestone_date else ("current" if today >= cursor else "upcoming"),
        })
        cursor = (cursor.replace(day=28) + datetime.timedelta(days=4)).replace(day=1)

    return {
        "user_id": user_id,
        "school_name": MOCK_PROFILE.get("school_name"),
        "grade_level": MOCK_PROFILE.get("grade_level"),
        "academic_year": f"{start.year}/{end.year}",
        "start_date": start_str,
        "end_date": end_str,
        "days_total": days_total,
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
        "weeks_total": weeks_total,
        "weeks_completed": weeks_completed,
        "weeks_remaining": weeks_remaining,
        "progress_percentage": progress_pct,
        "weekly_target_hours": 10,
        "daily_target_hours": 2,
        "study_days_per_week": 6,
        "rest_day": "Sunday",
        "monthly_milestones": milestones,
    }

# ---------- Student Chapters / Curriculum ----------
@app.get("/api/chapters")
def get_chapters(user_id: str = Query(default="user-secondary-01")):
    return {"chapters": [c for c in MOCK_CHAPTERS if c["user_id"] == user_id]}

@app.post("/api/chapters")
def create_chapter(payload: ChapterCreate, user_id: str = Query(default="user-secondary-01")):
    new_id = f"ch-{str(uuid.uuid4())[:8]}"
    new_chapter = {
        "id": new_id,
        "user_id": user_id,
        "subject": payload.subject,
        "chapter_number": payload.chapter_number,
        "chapter_title": payload.chapter_title,
        "status": "not_started",
        "is_active": payload.is_active,
    }
    MOCK_CHAPTERS.append(new_chapter)
    return new_chapter

@app.patch("/api/chapters/{chapter_id}")
def update_chapter(chapter_id: str, payload: ChapterCreate):
    for ch in MOCK_CHAPTERS:
        if ch["id"] == chapter_id:
            ch.update({k: v for k, v in payload.dict().items() if v is not None})
            return ch
    raise HTTPException(status_code=404, detail="Chapter not found")

# ---------- AI Tutor (Chapter-Aware) ----------
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_tutor(req: ChatRequest):
    active = _active_chapter(req.subject)
    res = await generate_ai_response(
        subject=req.subject,
        message=req.message,
        chat_history=req.chat_history,
        chapter_title=req.chapter_title or active.get("chapter_title"),
        chapter_number=req.chapter_number or active.get("chapter_number"),
        grade_level=req.grade_level or MOCK_PROFILE["grade_level"],
        school_name=req.school_name or MOCK_PROFILE.get("school_name"),
        academic_year_end=req.academic_year_end or MOCK_PROFILE.get("academic_year_end"),
        hint_level=req.hint_level or 0,
        api_key=req.api_key or MOCK_PROFILE.get("custom_api_key"),
        provider=req.provider or MOCK_PROFILE.get("ai_provider", "builtin")
    )
    return ChatResponse(
        reply=res["reply"],
        hints=res.get("hints", []),
        follow_up_questions=res.get("follow_up_questions", []),
        xp_awarded=res.get("xp_awarded", 15),
        problem=res.get("problem")
    )

# ---------- XP & Leveling ----------
@app.post("/api/xp/reward", response_model=XpRewardResponse)
def reward_xp(req: XpRewardRequest):
    amount = req.amount or 50
    if req.action == "quiz_correct":
        amount = 50
        msg = f"+50 XP for a correct {req.subject or ''} answer!"
    elif req.action == "session_complete":
        amount = 150
        msg = f"+150 XP for completing a 40-minute {req.subject or ''} session!"
    elif req.action == "daily_routine_complete":
        amount = 300
        msg = "🎉 +300 XP for completing all 2 hours today!"
    elif req.action == "streak_bonus":
        amount = 100
        msg = "🔥 +100 XP Streak Bonus!"
    elif req.action == "evaluation_passed":
        amount = 500
        msg = "🏆 +500 XP for passing a diagnostic evaluation!"
    else:
        msg = f"+{amount} XP rewarded!"

    old_lvl = MOCK_PROFILE["level"]
    MOCK_PROFILE["xp"] += amount
    new_lvl, new_name = calculate_level(MOCK_PROFILE["xp"])
    MOCK_PROFILE["level"] = new_lvl
    MOCK_PROFILE["level_name"] = new_name
    level_up = new_lvl > old_lvl
    badge_unlocked = f"Reached Level {new_lvl}: {new_name}!" if level_up else None

    return XpRewardResponse(
        new_xp=MOCK_PROFILE["xp"],
        new_level=new_lvl,
        level_name=new_name,
        level_up=level_up,
        badge_unlocked=badge_unlocked,
        message=msg
    )

# ---------- Daily 2-Hour Routine ----------
@app.get("/api/routine/today", response_model=DailyRoutineState)
def get_daily_routine():
    now = datetime.datetime.now()
    is_sunday = (now.weekday() == 6)
    active_maths = _active_chapter("Maths")["chapter_title"]
    active_science = _active_chapter("Science")["chapter_title"]
    active_english = _active_chapter("English")["chapter_title"]

    sessions = [
        SubjectSession(subject="Maths", target_minutes=40, completed_minutes=40, is_completed=True, active_topic=active_maths or "Quadratic Equations", questions_solved=6, accuracy=88.5),
        SubjectSession(subject="Science", target_minutes=40, completed_minutes=25, is_completed=False, active_topic=active_science or "Forces & Newton's Laws", questions_solved=4, accuracy=82.0),
        SubjectSession(subject="English", target_minutes=40, completed_minutes=0, is_completed=False, active_topic=active_english or "PEEL Paragraphs", questions_solved=0, accuracy=0.0),
    ]
    total_completed = sum(s.completed_minutes for s in sessions)

    return DailyRoutineState(
        date=now.strftime("%Y-%m-%d"),
        is_sunday=is_sunday,
        total_target_minutes=120,
        total_completed_minutes=total_completed,
        current_subject_index=1,
        sessions=sessions,
        is_daily_goal_completed=(total_completed >= 120),
        rest_day_override=False
    )

# ---------- Evaluation / Diagnostic Tests ----------
@app.post("/api/evaluation/generate")
def generate_evaluation(subject: str, level: int, user_id: str = Query(default="user-secondary-01")):
    """Generates a 20-question adaptive diagnostic evaluation for a given subject and target level."""
    sample = {
        "test_id": f"eval-{str(uuid.uuid4())[:8]}",
        "subject": subject,
        "target_level": level,
        "total_questions": 20,
        "pass_percentage": 70,
        "time_limit_minutes": 40,
        "questions": [
            {"id": i, "question": f"{subject} diagnostic Q{i+1}", "options": ["A", "B", "C", "D"], "correct_index": 0}
            for i in range(20)
        ]
    }
    return sample

@app.post("/api/evaluation/submit")
def submit_evaluation(test_id: str, answers: List[int], user_id: str = Query(default="user-secondary-01")):
    correct = sum(1 for i in range(20) if answers[i] == 0)
    percentage = (correct / 20) * 100
    passed = percentage >= 70
    return {
        "test_id": test_id,
        "score_percentage": round(percentage, 2),
        "correct_count": correct,
        "passed": passed,
        "xp_awarded": 500 if passed else 50,
        "message": "Evaluation passed! Ready for the next level!" if passed else "Review weak areas and try again."
    }

# ---------- Teacher / Admin Dashboard Data ----------
@app.get("/api/schools/{school_id}/students")
def get_school_students(school_id: str, role: str = Query(default="teacher")):
    """Teacher/Admin: view all students in a school with progress metrics."""
    if role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers or admins can view school data")
    return {
        "school_id": school_id,
        "students": [
            {
                "id": "user-secondary-01",
                "name": "Ayesha Begum",
                "grade": 10,
                "xp": MOCK_PROFILE["xp"],
                "level": MOCK_PROFILE["level"],
                "streak_days": MOCK_PROFILE["streak_days"],
                "weekly_hours": 10.5,
                "consistency_pct": 96,
                "accuracy": 88.5,
                "inactive_flag": False,
            },
            {
                "id": "user-secondary-02",
                "name": "Mohamed Omar",
                "grade": 10,
                "xp": 950,
                "level": 2,
                "streak_days": 2,
                "weekly_hours": 5.0,
                "consistency_pct": 62,
                "accuracy": 74.0,
                "inactive_flag": True,
            }
        ]
    }

# ---------- Analytics ----------
@app.get("/api/analytics", response_model=AnalyticsSummary)
def get_analytics():
    weekly_data = [
        {"day": "Mon", "maths": 85, "science": 78, "english": 90, "hours": 2.0, "xp": 450},
        {"day": "Tue", "maths": 88, "science": 82, "english": 86, "hours": 2.0, "xp": 500},
        {"day": "Wed", "maths": 92, "science": 85, "english": 88, "hours": 2.1, "xp": 520},
        {"day": "Thu", "maths": 80, "science": 88, "english": 92, "hours": 1.9, "xp": 480},
        {"day": "Fri", "maths": 95, "science": 90, "english": 94, "hours": 2.0, "xp": 600},
        {"day": "Sat", "maths": 90, "science": 86, "english": 91, "hours": 2.0, "xp": 510},
        {"day": "Sun", "maths": 0, "science": 0, "english": 0, "hours": 0.0, "xp": 0, "is_rest": True},
    ]
    monthly_grades = [
        {"month": "May", "predicted_grade": "B", "avg_score": 76, "hours": 42},
        {"month": "Jun", "predicted_grade": "B+", "avg_score": 81, "hours": 48},
        {"month": "Jul", "predicted_grade": "A", "avg_score": 87, "hours": 50},
        {"month": "Aug", "predicted_grade": "A*", "avg_score": 92, "hours": 52},
    ]
    subject_stats = {
        "Maths": {"accuracy": 89.2, "hours_completed": 34.5, "problems_solved": 142, "current_grade": "A*", "mastery": 88},
        "Science": {"accuracy": 84.8, "hours_completed": 31.0, "problems_solved": 118, "current_grade": "A", "mastery": 84},
        "English": {"accuracy": 91.5, "hours_completed": 32.5, "problems_solved": 95, "current_grade": "A*", "mastery": 92},
    }
    return AnalyticsSummary(
        xp=MOCK_PROFILE["xp"],
        level=MOCK_PROFILE["level"],
        level_name=MOCK_PROFILE["level_name"],
        streak_days=MOCK_PROFILE["streak_days"],
        total_hours=round(MOCK_PROFILE["total_study_minutes"] / 60.0, 1),
        subject_stats=subject_stats,
        weekly_progression=weekly_data,
        monthly_grades=monthly_grades,
        badges=MOCK_BADGES
    )
