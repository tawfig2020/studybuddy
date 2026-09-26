import urllib.request
import json
import sys

print("=== 1. TESTING FRONTEND VITE SERVER ===")
try:
    with urllib.request.urlopen("http://localhost:5173") as resp:
        html = resp.read().decode("utf-8")
        print(f"PASS [HTTP {resp.status}] Frontend server online | Length: {len(html)} bytes")
        if "id=\"root\"" in html or "root" in html:
            print("PASS React entry container verified!")
except Exception as e:
    print("Frontend check error:", e)

print("\n=== 2. TESTING BACKEND FASTAPI & SUPABASE INTEGRATION ===")
BASE = "http://127.0.0.1:8000"

def test_endpoint(name, method, path, data=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            print(f"PASS [HTTP {resp.status}] {name}")
            return True, res_data
    except Exception as e:
        print(f"FAIL {name}: {e}")
        return False, None

results = [
    test_endpoint("Health & Supabase Status", "GET", "/"),
    test_endpoint("Get Community Schools", "GET", "/api/schools"),
    test_endpoint("Get Student Profile", "GET", "/api/profile"),
    test_endpoint("Update Student Profile", "PUT", "/api/profile", {
        "full_name": "Ayesha Begum",
        "grade_level": 10,
        "academic_year_start": "2026-03-01",
        "academic_year_end": "2027-01-31"
    }),
    test_endpoint("Academic Year Days & Milestones", "GET", "/api/academic_year/user-secondary-01"),
    test_endpoint("Get Student Chapters", "GET", "/api/chapters?user_id=user-secondary-01"),
    test_endpoint("Create Custom Chapter", "POST", "/api/chapters?user_id=user-secondary-01", {
        "subject": "Maths",
        "chapter_number": 3,
        "chapter_title": "Trigonometry & Circle Theorems",
        "is_active": True
    }),
    test_endpoint("Socratic AI Tutor Chat", "POST", "/api/chat", {
        "subject": "Maths",
        "chapter_title": "Trigonometry & Circle Theorems",
        "chapter_number": 3,
        "grade_level": 10,
        "school_name": "Rohingya Learning Center - Selayang",
        "academic_year_end": "2027-01-31",
        "message": "Can you explain the sine rule step by step?",
        "chat_history": [],
        "mode": "tutor",
        "hint_level": 0
    }),
    test_endpoint("Daily 2-Hour Routine", "GET", "/api/routine/today"),
    test_endpoint("XP & Gamification Progression", "POST", "/api/xp/reward", {
        "action": "study_session_completed",
        "amount": 100,
        "description": "40-minute Maths focus session"
    }),
    test_endpoint("20-Question Diagnostic Generator", "POST", "/api/evaluation/generate?subject=Maths&level=3"),
    test_endpoint("Diagnostic Assessment Submit", "POST", "/api/evaluation/submit?test_id=eval-test-1", [0]*20),
    test_endpoint("Teacher Class Roster Metrics", "GET", "/api/schools/school-001/students?role=teacher"),
    test_endpoint("Weekly Analytics Dashboard", "GET", "/api/analytics"),
    test_endpoint("Badge & Improvement Recommendation Engine", "POST", "/api/v1/recommendations", {
        "user_id": "user-secondary-01",
        "weekly_accuracy": 85.0,
        "sessions_count": 7,
        "weekly_xp": 650,
        "monthly_accuracy": 82.0,
        "completed_chapters": 4,
        "total_chapters": 12,
        "incorrect_quiz_logs": ["Quadratic formula factoring"],
        "subject": "Maths"
    }),
    test_endpoint("Admin Dashboard Summary", "GET", "/api/v1/admin/dashboard/school-001"),
    test_endpoint("Admin Oversight Interventions", "GET", "/api/v1/admin/oversight/school-001")
]

total = len(results)
passed = sum(1 for r, _ in results if r)
print("\n========================================")
print(f"FINAL INTEGRATION RESULTS: {passed}/{total} Passed ({(passed/total)*100:.1f}%)")
print("========================================")
