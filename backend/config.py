import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# App config
DAILY_STUDY_MINUTES = 120
SUBJECTS = ["Maths", "Science", "English"]
MINUTES_PER_SUBJECT = 40
XP_LEVELS = [
    {"level": 1, "name": "Novice Scholar", "xp_needed": 0, "badge": "🌱"},
    {"level": 2, "name": "Apprentice Learner", "xp_needed": 500, "badge": "📘"},
    {"level": 3, "name": "Knowledge Seeker", "xp_needed": 1200, "badge": "🔍"},
    {"level": 4, "name": "Focused Achiever", "xp_needed": 2200, "badge": "⚡"},
    {"level": 5, "name": "Concept Master", "xp_needed": 3500, "badge": "💡"},
    {"level": 6, "name": "Academic Ace", "xp_needed": 5000, "badge": "🎯"},
    {"level": 7, "name": "Study Champion", "xp_needed": 6800, "badge": "🏆"},
    {"level": 8, "name": "Honors Scholar", "xp_needed": 8800, "badge": "🌟"},
    {"level": 9, "name": "Master Polymath", "xp_needed": 11000, "badge": "👑"},
    {"level": 10, "name": "Grandmaster of Learning", "xp_needed": 14000, "badge": "🌌"},
]
