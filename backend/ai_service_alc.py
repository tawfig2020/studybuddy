import httpx
import random
import datetime
from typing import List, Dict, Any, Optional
from pydantic_models import ChatMessage

SAMPLE_PRACTICE_PROBLEMS = {
    "Maths": [
        {
            "id": "math-p1",
            "topic": "Quadratic Equations",
            "question": "Solve for x: 2x² - 7x + 3 = 0.",
            "options": ["x = 3 or x = 1/2", "x = -3 or x = -1/2", "x = 2 or x = 3/2", "x = 1 or x = 3"],
            "correct_index": 0,
            "explanation": "Factoring: (2x - 1)(x - 3) = 0. Setting each factor to 0 gives x = 1/2 or x = 3.",
            "hints": ["Look for two numbers that multiply to 2×3=6 and add to -7.", "The numbers are -6 and -1.", "Factor by grouping: (2x - 1)(x - 3) = 0."]
        },
        {
            "id": "math-p2",
            "topic": "Trigonometry",
            "question": "In a right triangle, the adjacent side is 8 cm and hypotenuse is 10 cm. Find cos(θ).",
            "options": ["0.8", "0.6", "1.25", "0.75"],
            "correct_index": 0,
            "explanation": "cos(θ) = Adjacent / Hypotenuse = 8 / 10 = 0.8.",
            "hints": ["SOH CAH TOA.", "CAH: Cos(θ) = Adjacent / Hypotenuse.", "Divide 8 by 10."]
        }
    ],
    "Science": [
        {
            "id": "sci-p1",
            "topic": "Newton's 2nd Law",
            "question": "A net force of 45 N acts on a 9 kg mass. What is the acceleration?",
            "options": ["5 m/s²", "405 m/s²", "0.2 m/s²", "50 m/s²"],
            "correct_index": 0,
            "explanation": "F = m × a. a = F / m = 45 / 9 = 5 m/s².",
            "hints": ["Newton's 2nd Law relates Force, mass, and acceleration.", "Rearrange F=ma for a.", "Divide 45 by 9."]
        },
        {
            "id": "sci-p2",
            "topic": "Cellular Biology",
            "question": "Which organelle generates ATP through aerobic respiration?",
            "options": ["Mitochondria", "Ribosome", "Chloroplast", "Golgi apparatus"],
            "correct_index": 0,
            "explanation": "Mitochondria produce ATP during cellular respiration.",
            "hints": ["It has a double membrane with inner cristae.", "Not ribosomes (protein synthesis).", "Mitochondria."]
        }
    ],
    "English": [
        {
            "id": "eng-p1",
            "topic": "Literary Devices",
            "question": "Which literary device is in: 'The wind whispered mournful secrets through the pines'?",
            "options": ["Personification", "Hyperbole", "Alliteration only", "Oxymoron"],
            "correct_index": 0,
            "explanation": "Giving human characteristics (whispering secrets) to wind is personification.",
            "hints": ["Can wind literally whisper like a human?", "Attributing human traits to non-human things.", "Personification."]
        },
        {
            "id": "eng-p2",
            "topic": "Semicolon Usage",
            "question": "Which sentence uses a semicolon correctly to connect two independent clauses?",
            "options": [
                "The storm disrupted electricity; however, the generators kicked in immediately.",
                "The storm disrupted electricity; because the generators were ready.",
                "Although the storm was fierce; we felt safe indoors.",
                "We packed blankets; flashlights; and batteries."
            ],
            "correct_index": 0,
            "explanation": "A semicolon joins two independent clauses. 'however' with a comma is properly placed.",
            "hints": ["Semicolons connect two full clauses.", "'Because the generators were ready' is dependent.", "Option A uses '; however,' correctly."]
        }
    ]
}

def _days_left(end_date: Optional[str]) -> int:
    if not end_date:
        return 180
    try:
        end = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
        return max(1, (end - datetime.date.today()).days)
    except Exception:
        return 180

def _get_persona(subject: str, chapter_title: Optional[str], chapter_number: Optional[int], grade_level: int, school_name: Optional[str], academic_year_end: Optional[str]) -> str:
    days_left = _days_left(academic_year_end)
    return f'''You are "TutorMind", an AI mentor helping refugee students in Malaysia learn effectively.

Context:
- Student Grade: Grade {grade_level}
- Subject: {subject}
- School/Curriculum Context: {school_name or 'Alternative Learning Center'}
- Current Active Chapter: Chapter {chapter_number or 'N/A'} - "{chapter_title or 'General review'}"
- Academic Progress Window: {days_left} days remaining in their school year.

Instructions:
1. Deliver guidance strictly aligned with the student's active chapter: "{chapter_title or 'General review'}".
2. Adapt language complexity to secondary school ESL learners (clear, simple English, avoiding overly dense academic jargon).
3. Follow the Socratic Method: Never state the final answer. Ask 1 scaffolding question at a time to lead the student to the concept.
4. Relate concepts to practical, real-world examples when helpful.
5. Grant between 10 and 30 XP when the student correctly reasons through a step.

Keep the response concise and mobile-friendly for low-bandwidth contexts.'''


async def generate_ai_response(
    subject: str,
    message: str,
    chat_history: List[ChatMessage],
    chapter_title: Optional[str] = None,
    chapter_number: Optional[int] = None,
    grade_level: int = 10,
    school_name: Optional[str] = None,
    academic_year_end: Optional[str] = None,
    hint_level: int = 0,
    api_key: Optional[str] = None,
    provider: str = "builtin"
) -> Dict[str, Any]:
    if provider == "openai" and api_key:
        try:
            return await _call_openai(subject, message, chat_history, chapter_title, chapter_number, grade_level, school_name, academic_year_end, hint_level, api_key)
        except Exception as e:
            print(f"OpenAI fallback: {e}")
    if provider == "anthropic" and api_key:
        try:
            return await _call_anthropic(subject, message, chat_history, chapter_title, chapter_number, grade_level, school_name, academic_year_end, hint_level, api_key)
        except Exception as e:
            print(f"Anthropic fallback: {e}")
    return _generate_local_socratic_response(subject, message, chat_history, chapter_title, chapter_number, grade_level, school_name, academic_year_end, hint_level)

async def _call_openai(subject, message, history, chapter_title, chapter_number, grade, school_name, academic_year_end, hint_level, key):
    sys_prompt = _get_persona(subject, chapter_title, chapter_number, grade, school_name, academic_year_end)
    if hint_level > 0:
        sys_prompt += f"\nProvide Hint Level {hint_level}/3 without giving the full answer. Ask one short scaffolding question."
    messages = [{"role": "system", "content": sys_prompt}]
    for h in history[-8:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})
    async with httpx.AsyncClient(timeout=25.0) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7, "max_tokens": 700}
        )
        data = res.json()
        return {
            "reply": data["choices"][0]["message"]["content"],
            "hints": ["Re-read the chapter concept carefully.", "Try identifying what is given vs. what is asked."],
            "follow_up_questions": ["Try a practice problem?", "Explain the previous step?"],
            "xp_awarded": 15
        }

async def _call_anthropic(subject, message, history, chapter_title, chapter_number, grade, school_name, academic_year_end, hint_level, key):
    sys_prompt = _get_persona(subject, chapter_title, chapter_number, grade, school_name, academic_year_end)
    if hint_level > 0:
        sys_prompt += f"\nProvide Hint Level {hint_level}/3 without giving the full answer. Ask one short scaffolding question."
    messages = []
    for h in history[-6:]:
        if h.role in ["user", "assistant"]:
            messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})
    async with httpx.AsyncClient(timeout=25.0) as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json"},
            json={"model": "claude-3-5-sonnet-20241022", "system": sys_prompt, "messages": messages, "max_tokens": 700}
        )
        data = res.json()
        return {
            "reply": data["content"][0]["text"],
            "hints": ["Review the key concept for this chapter.", "Break the problem into smaller steps."],
            "follow_up_questions": ["Solve another variation?"],
            "xp_awarded": 15
        }

def _generate_local_socratic_response(subject, message, history, chapter_title, chapter_number, grade, school_name, academic_year_end, hint_level):
    msg_lower = message.lower()
    if any(q in msg_lower for q in ["quiz", "practice", "test me", "give me a problem", "question"]):
        problems = SAMPLE_PRACTICE_PROBLEMS.get(subject, SAMPLE_PRACTICE_PROBLEMS["Maths"])
        selected_problem = random.choice(problems)
        reply = f"### 🎯 Practice Challenge: {selected_problem['topic']}\n\n**Problem:** {selected_problem['question']}\n\nSelect the correct option below. **+50 XP** for the right answer!"
        return {
            "reply": reply,
            "hints": selected_problem["hints"],
            "follow_up_questions": ["Need a hint?", "Explain the formula first?"],
            "xp_awarded": 20,
            "problem": selected_problem
        }

    if hint_level > 0 or "hint" in msg_lower:
        hints = {
            "Maths": [
                "💡 **Step 1**: Identify the known variables and the unknown.",
                "📐 **Step 2**: Choose or rearrange the relevant formula.",
                "🎯 **Step 3**: Substitute values and verify your answer."
            ],
            "Science": [
                "💡 **Step 1**: Identify the concept or law being tested.",
                "🔬 **Step 2**: Check units and constants carefully.",
                "🎯 **Step 3**: Connect the cause and effect relationship."
            ],
            "English": [
                "💡 **Step 1**: Identify the main idea or author purpose.",
                "✍️ **Step 2**: Find specific evidence from the text.",
                "🎯 **Step 3**: Analyze how the evidence supports the point."
            ]
        }
        level = min(max(hint_level, 1), 3) - 1
        hints_list = hints.get(subject, hints["Maths"])
        chosen_hint = hints_list[level]
        return {
            "reply": f"### 💡 Hint Level {level+1}/3\n\n{chosen_hint}\n\nRevisit the question with this clue. What is your next step?",
            "hints": hints_list,
            "follow_up_questions": ["Is the next step clearer?", "Try answering now?"],
            "xp_awarded": 5
        }

    if subject == "Maths":
        reply = (
            f"### 📐 Socratic Guidance: {chapter_title or 'Mathematics'}\n\n"
            f"Let's work through this step-by-step:\n\n"
            f"1. **Identify the mathematical form**: Is it linear, quadratic, trigonometric, or geometric?\n"
            f"2. **Rewrite clearly**: Align variables and constants on each side.\n"
            f"3. **Choose a strategy**: Factor, substitute, or apply a known rule.\n\n"
            f"What is the first operation you would try?"
        )
        follow_ups = ["What if we move all constants to the right?", "Can we generate an example?"]
    elif subject == "Science":
        reply = (
            f"### 🔬 Scientific Inquiry: {chapter_title or 'Science'}\n\n"
            f"Let's investigate together:\n\n"
            f"• **Principle**: What law or system is involved?\n"
            f"• **Variables**: What changes and what is measured?\n"
            f"• **Connection**: How does this happen in real life?\n\n"
            f"What do you think is the main cause in this question?"
        )
        follow_ups = ["What might be a limiting factor?", "Would you like a quick 4-option quiz?"]
    else:
        reply = (
            f"### ✍️ Athena's Analysis: {chapter_title or 'English'}\n\n"
            f"For this text or writing task:\n\n"
            f"• **PEEL Structure**: Point, Evidence, Explanation, Link.\n"
            f"• **Word Choice**: Look for vivid verbs and adjectives.\n"
            f"• **Tone & Purpose**: How does the writer affect the reader?\n\n"
            f"What is your main point or thesis?"
        )
        follow_ups = ["Want vocabulary suggestions?", "Shall we draft a PEEL paragraph?"]

    return {
        "reply": reply,
        "hints": ["Think about the core definition for this chapter.", "Break the task into two smaller steps."],
        "follow_up_questions": follow_ups,
        "xp_awarded": 15
    }
