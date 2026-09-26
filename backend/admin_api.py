import httpx
import json
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic_models import (
    RecommendationRequest, RecommendationResponse,
    SchoolAdminDashboard, StudentProgressOverview,
    AdminOversightSummary
)
from config import OPENAI_API_KEY, ANTHROPIC_API_KEY

router = APIRouter(prefix="/api/v1")

# ---------- Mock school rosters for the ALC admin endpoints ----------
MOCK_SCHOOL_ROSTERS = {
    "school-001": {
        "school_name": "Rohingya Learning Center - Selayang",
        "total_enrolled": 140,
        "active_this_week": 118,
        "average_school_xp": 2450.0,
        "students": [
            {"user_id": "usr_9921", "full_name": "Amina Ali", "grade_level": 8, "current_level": 3, "total_xp": 890, "days_remaining_in_year": 120, "weekly_accuracy": 42.5, "status_flag": "Needs Attention"},
            {"user_id": "usr_1001", "full_name": "Yusuf Rahman", "grade_level": 10, "current_level": 4, "total_xp": 3100, "days_remaining_in_year": 120, "weekly_accuracy": 88.0, "status_flag": "On Track"},
            {"user_id": "usr_1002", "full_name": "Fatima Begum", "grade_level": 9, "current_level": 2, "total_xp": 1500, "days_remaining_in_year": 120, "weekly_accuracy": 75.5, "status_flag": "On Track"},
        ]
    },
    "school-002": {
        "school_name": "Somali Community School - KL",
        "total_enrolled": 95,
        "active_this_week": 80,
        "average_school_xp": 2100.0,
        "students": [
            {"user_id": "usr_2001", "full_name": "Mohamed Omar", "grade_level": 10, "current_level": 2, "total_xp": 950, "days_remaining_in_year": 115, "weekly_accuracy": 74.0, "status_flag": "Inactive"},
        ]
    },
    "school-003": {
        "school_name": "Myanmar Education Hub - Penang",
        "total_enrolled": 120,
        "active_this_week": 102,
        "average_school_xp": 2600.0,
        "students": [
            {"user_id": "usr_3001", "full_name": "Kyi Phyu", "grade_level": 11, "current_level": 5, "total_xp": 4000, "days_remaining_in_year": 110, "weekly_accuracy": 92.0, "status_flag": "On Track"},
        ]
    },
}

# ---------- Recommendation Engine ----------

def _build_recommendation_prompt(req: RecommendationRequest) -> str:
    return f'''You are the TutorMind Performance Evaluation Engine.

Input Data:
- Student ID: {req.user_id}
- Past 7 Days Metrics: Accuracy {req.weekly_accuracy}%, Completed Sessions: {req.sessions_count}, XP Earned: {req.weekly_xp}
- Past 30 Days Metrics: Overall Accuracy {req.monthly_accuracy}%
- Chapter Progress: Completed {req.completed_chapters} of {req.total_chapters} chapters.
- Incorrect quiz topics: {', '.join(req.incorrect_quiz_logs or []) or 'None recorded'}

Tasks:
1. Evaluate badge eligibility (e.g., "7-Day Consistency Warrior", "Math Explorer", "Critical Thinker").
2. Identify specific learning bottlenecks based on the metrics.
3. Output strict JSON matching this exact format with no extra commentary:

{{
  "recommended_badges_to_award": [],
  "strengths": [],
  "areas_for_improvement": [],
  "actionable_recommendations": []
}}'''

def _local_recommendation_fallback(req: RecommendationRequest) -> RecommendationResponse:
    badges = []
    if req.sessions_count >= 7:
        badges.append("7-DAY_CONSISTENCY_WARRIOR")
    if req.weekly_xp >= 500:
        badges.append("WEEKLY_XP_CHAMPION")
    if req.weekly_accuracy >= 80 and req.subject:
        badges.append(f"{req.subject.upper()}_EXPLORER")
    if req.completed_chapters >= req.total_chapters:
        badges.append("CHAPTER_MASTER")

    strengths = []
    if req.sessions_count >= 7:
        strengths.append("Consistent study habit over the past week")
    if req.weekly_accuracy >= 75:
        strengths.append("Strong weekly accuracy")
    if req.weekly_xp >= 500:
        strengths.append("High XP earning")

    areas = []
    if req.weekly_accuracy < 70:
        areas.append(f"{req.subject or 'General'} accuracy is below 70%; review foundational concepts")
    if req.incorrect_quiz_logs:
        areas.extend(req.incorrect_quiz_logs)
    if not req.incorrect_quiz_logs and req.weekly_accuracy < 80:
        areas.append("Maintain accuracy while increasing problem volume")

    actions = ["Continue daily 40-minute subject blocks", "Use the AI tutor's hint ladder for tough problems"]
    if req.weekly_accuracy < 70:
        actions.append("Review prior chapter summaries before attempting new topics")
    if req.completed_chapters < req.total_chapters:
        actions.append(f"Finish the remaining {req.total_chapters - req.completed_chapters} chapters in this subject")

    return RecommendationResponse(
        recommended_badges_to_award=badges,
        strengths=strengths,
        areas_for_improvement=areas,
        actionable_recommendations=actions
    )

async def _call_openai_json(prompt: str, key: str) -> dict:
    async with httpx.AsyncClient(timeout=25.0) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.5,
                "max_tokens": 500,
                "response_format": {"type": "json_object"}
            }
        )
        data = res.json()
        return json.loads(data["choices"][0]["message"]["content"])

@router.post("/recommendations", response_model=RecommendationResponse)
async def generate_recommendations(req: RecommendationRequest):
    """TutorMind badge and improvement recommendation engine."""
    if OPENAI_API_KEY:
        try:
            prompt = _build_recommendation_prompt(req)
            data = await _call_openai_json(prompt, OPENAI_API_KEY)
            return RecommendationResponse(**data)
        except Exception as e:
            print(f"OpenAI recommendation fallback: {e}")
    return _local_recommendation_fallback(req)

# ---------- Admin Monitoring & Oversight Engine ----------

@router.get("/admin/dashboard/{school_id}", response_model=SchoolAdminDashboard)
async def get_school_admin_dashboard(school_id: str):
    """Admin API: school-wide performance metrics and at-risk students."""
    roster = MOCK_SCHOOL_ROSTERS.get(school_id)
    if not roster:
        raise HTTPException(status_code=404, detail="School not found")
    at_risk = [StudentProgressOverview(**s) for s in roster["students"] if s["status_flag"] != "On Track"]
    return SchoolAdminDashboard(
        school_id=school_id,
        school_name=roster["school_name"],
        total_enrolled=roster["total_enrolled"],
        active_this_week=roster["active_this_week"],
        average_school_xp=roster["average_school_xp"],
        at_risk_students=at_risk
    )

def _build_oversight_prompt(school_id: str, roster: dict) -> str:
    at_risk = [s for s in roster["students"] if s["status_flag"] != "On Track"]
    avg_acc = sum(s["weekly_accuracy"] for s in roster["students"]) / len(roster["students"]) if roster["students"] else 0
    return f'''You are the System Administrator Evaluation Agent for the Refugee Learning Center Portal.

Input Data:
- School Name: {roster['school_name']}
- Total Active Students: {roster['active_this_week']}
- Inactive Students (>3 days no study): {len(at_risk)}
- Class Subject Averages: Maths (82%), Science ({avg_acc}%), English (84%)

Tasks:
1. Generate a concise operational summary for the school coordinator or teacher (2-3 sentences).
2. Flag high-risk students who are falling behind: {', '.join(s['full_name'] for s in at_risk) or 'None'}.
3. Provide 3 actionable recommendations for classroom interventions or group study sessions.
4. Output strict JSON matching this exact format with no extra commentary:

{{
  "operational_summary": "",
  "high_risk_students": [],
  "classroom_recommendations": []
}}'''

@router.get("/admin/oversight/{school_id}", response_model=AdminOversightSummary)
async def get_admin_oversight_summary(school_id: str):
    """Admin oversight engine: textual summary and recommendations."""
    roster = MOCK_SCHOOL_ROSTERS.get(school_id)
    if not roster:
        raise HTTPException(status_code=404, detail="School not found")
    at_risk = [s for s in roster["students"] if s["status_flag"] != "On Track"]
    avg_acc = sum(s["weekly_accuracy"] for s in roster["students"]) / len(roster["students"]) if roster["students"] else 0

    if OPENAI_API_KEY:
        try:
            prompt = _build_oversight_prompt(school_id, roster)
            data = await _call_openai_json(prompt, OPENAI_API_KEY)
        except Exception as e:
            print(f"OpenAI oversight fallback: {e}")
            data = {}
    else:
        data = {}

    summary = data.get("operational_summary") or (
        f"{roster['school_name']} has {roster['active_this_week']} active learners this week with "
        f"{len(at_risk)} students requiring additional support. Average weekly accuracy is {avg_acc:.1f}%."
    )
    high_risk = data.get("high_risk_students") or [s["full_name"] for s in at_risk]
    recommendations = data.get("classroom_recommendations") or [
        "Schedule small-group remedial sessions for at-risk students.",
        "Pair strong learners as peer mentors in Maths and Science.",
        "Use adaptive 20-question diagnostic tests to identify specific skill gaps."
    ]

    return AdminOversightSummary(
        school_id=school_id,
        school_name=roster["school_name"],
        total_students=roster["total_enrolled"],
        inactive_student_count=len(at_risk),
        math_avg=82.0,
        science_avg=round(avg_acc, 1),
        english_avg=84.0,
        operational_summary=summary,
        high_risk_students=high_risk,
        classroom_recommendations=recommendations
    )
