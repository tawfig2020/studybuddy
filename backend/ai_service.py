import httpx
import json
import random
from typing import List, Dict, Any, Optional
from models import ChatMessage

SUBJECT_CURRICULUM = {
    "Mathematics": [
        {"id": "alg-1", "name": "Quadratic Equations & Factoring", "subtopics": ["Completing the Square", "Quadratic Formula", "Graphing Parabolas"]},
        {"id": "alg-2", "name": "Simultaneous Linear & Non-Linear Equations", "subtopics": ["Substitution", "Elimination", "Graphical Intersections"]},
        {"id": "geo-1", "name": "Trigonometry & Circle Theorems", "subtopics": ["Sine and Cosine Rules", "Angles in Semicircles", "Tangents and Radii"]},
        {"id": "geo-2", "name": "Coordinate Geometry & Vectors", "subtopics": ["Gradients & Perpendicular Lines", "Vector Arithmetic", "Magnitude"]},
        {"id": "calc-1", "name": "Introductory Differentiation & Kinematics", "subtopics": ["Power Rule", "Tangents and Normals", "Velocity & Acceleration"]},
        {"id": "prob-1", "name": "Probability Trees & Conditional Statistics", "subtopics": ["Venn Diagrams", "Independent vs Dependent", "Histograms & Box Plots"]}
    ],
    "Science": [
        {"id": "bio-1", "name": "Cellular Respiration & Photosynthesis", "subtopics": ["Aerobic vs Anaerobic", "Light Reactions", "Limiting Factors"]},
        {"id": "bio-2", "name": "Genetics, DNA & Natural Selection", "subtopics": ["Punnett Squares", "Mutations", "Evolution Mechanisms"]},
        {"id": "chem-1", "name": "Stoichiometry & Mole Calculations", "subtopics": ["Avogadro's Constant", "Limiting Reactants", "Percentage Yield"]},
        {"id": "chem-2", "name": "Bonding, Acids, Bases & Redox", "subtopics": ["Ionic vs Covalent vs Metallic", "Titrations & pH Scale", "Oxidation Numbers"]},
        {"id": "phys-1", "name": "Forces, Newton's Laws & Energy Conservation", "subtopics": ["F=ma", "Gravitational Potential & Kinetic", "Work Done & Power"]},
        {"id": "phys-2", "name": "Electricity, Circuits & Electromagnetism", "subtopics": ["Ohm's Law V=IR", "Series vs Parallel", "Transformers & Induction"]}
    ],
    "English": [
        {"id": "eng-1", "name": "Critical Reading & Textual Analysis", "subtopics": ["Metaphor, Simile & Tone Analysis", "Inference & Subtext", "PEEL Paragraph Structure"]},
        {"id": "eng-2", "name": "Persuasive & Argumentative Essay Writing", "subtopics": ["Rhetorical Devices (Ethos, Pathos, Logos)", "Counterarguments", "Thesis Statements"]},
        {"id": "eng-3", "name": "Advanced Grammar, Syntax & Vocabulary", "subtopics": ["Subordinate Clauses & Semicolons", "Active vs Passive Voice", "Sophisticated Vocabulary"]},
        {"id": "eng-4", "name": "Narrative & Descriptive Creative Writing", "subtopics": ["Sensory Imagery", "Pacing & Show Don't Tell", "Character Arcs"]}
    ]
}

SAMPLE_PRACTICE_PROBLEMS = {
    "Mathematics": [
        {
            "id": "math-p1",
            "topic": "Quadratic Equations",
            "question": "Solve for x: 2x² - 7x + 3 = 0. Use factoring or the quadratic formula.",
            "options": ["x = 3 or x = 1/2", "x = -3 or x = -1/2", "x = 2 or x = 3/2", "x = 1 or x = 3"],
            "correct_index": 0,
            "explanation": "Factoring: (2x - 1)(x - 3) = 0. Setting each factor to 0 gives 2x = 1 (x = 1/2) and x = 3.",
            "hints": [
                "💡 **Hint 1**: Look for two numbers that multiply to give a × c = 2 × 3 = 6, and add to give b = -7.",
                "📐 **Hint 2**: The two numbers are -6 and -1. Rewrite the middle term: 2x² - 6x - x + 3 = 0.",
                "🎯 **Hint 3**: Factor by grouping: 2x(x - 3) - 1(x - 3) = (2x - 1)(x - 3) = 0. Hence x = 1/2 or x = 3."
            ]
        },
        {
            "id": "math-p2",
            "topic": "Trigonometry",
            "question": "In a right-angled triangle, the adjacent side is 8 cm and the hypotenuse is 10 cm. Find the cosine of angle θ.",
            "options": ["cos(θ) = 0.8", "cos(θ) = 0.6", "cos(θ) = 1.25", "cos(θ) = 0.75"],
            "correct_index": 0,
            "explanation": "Cosine ratio is defined as Adjacent / Hypotenuse = 8 / 10 = 0.8.",
            "hints": [
                "💡 **Hint 1**: Remember SOH CAH TOA.",
                "📐 **Hint 2**: CAH stands for Cos(θ) = Adjacent / Hypotenuse.",
                "🎯 **Hint 3**: Divide 8 by 10 to get 0.8."
            ]
        },
        {
            "id": "math-p3",
            "topic": "Simultaneous Equations",
            "question": "Solve the system: \n3x + 2y = 16\nx - 2y = 0",
            "options": ["x = 4, y = 2", "x = 2, y = 4", "x = 3, y = 3.5", "x = 5, y = 1"],
            "correct_index": 0,
            "explanation": "Adding both equations: (3x + x) + (2y - 2y) = 16 + 0 => 4x = 16 => x = 4. Substitute into second equation: 4 - 2y = 0 => y = 2.",
            "hints": [
                "💡 **Hint 1**: Notice that +2y and -2y will cancel out if you add the two equations together.",
                "📐 **Hint 2**: 3x + x = 4x and 16 + 0 = 16. Solve for x first.",
                "🎯 **Hint 3**: 4x = 16 gives x = 4. Then substitute into x = 2y to find y."
            ]
        }
    ],
    "Science": [
        {
            "id": "sci-p1",
            "topic": "Forces & Newton's Laws",
            "question": "A net force of 45 N acts on an object with a mass of 9 kg. What is the acceleration produced?",
            "options": ["5 m/s²", "405 m/s²", "0.2 m/s²", "50 m/s²"],
            "correct_index": 0,
            "explanation": "Using Newton's Second Law: F = m × a. Rearranging gives a = F / m = 45 N / 9 kg = 5 m/s².",
            "hints": [
                "💡 **Hint 1**: What is Newton's 2nd Law equation relating Force, mass, and acceleration?",
                "📐 **Hint 2**: F = m · a. Rearrange for a: a = F / m.",
                "🎯 **Hint 3**: Calculate 45 divided by 9."
            ]
        },
        {
            "id": "sci-p2",
            "topic": "Cellular Biology",
            "question": "Which organelle is known as the 'powerhouse of the cell' responsible for generating ATP through aerobic respiration?",
            "options": ["Mitochondria", "Ribosome", "Chloroplast", "Golgi apparatus"],
            "correct_index": 0,
            "explanation": "Mitochondria convert glucose and oxygen into ATP energy during cellular respiration.",
            "hints": [
                "💡 **Hint 1**: It has a double membrane with folded inner cristae.",
                "📐 **Hint 2**: Chloroplasts are for photosynthesis in plants, ribosomes are for protein synthesis.",
                "🎯 **Hint 3**: The answer starts with 'Mito...'."
            ]
        },
        {
            "id": "sci-p3",
            "topic": "Stoichiometry & Chemistry",
            "question": "How many moles are present in 44 grams of Carbon Dioxide (CO₂)? (Relative atomic masses: C = 12, O = 16)",
            "options": ["1.0 mole", "2.0 moles", "0.5 moles", "44 moles"],
            "correct_index": 0,
            "explanation": "Molar mass of CO₂ = 12 + 2(16) = 44 g/mol. Moles = mass / molar mass = 44 g / 44 g/mol = 1.0 mol.",
            "hints": [
                "💡 **Hint 1**: Calculate the molecular mass of CO₂ first: C (12) + 2 × O (16).",
                "📐 **Hint 2**: Molar mass is 12 + 32 = 44 g/mol.",
                "🎯 **Hint 3**: Moles = Mass ÷ Molar Mass = 44 ÷ 44 = 1."
            ]
        }
    ],
    "English": [
        {
            "id": "eng-p1",
            "topic": "Literary Devices",
            "question": "Which literary device is used in the sentence: 'The wind whispered mournful secrets through the towering pines'?",
            "options": ["Personification", "Hyperbole", "Alliteration only", "Oxymoron"],
            "correct_index": 0,
            "explanation": "Giving human characteristics (whispering mournful secrets) to an inanimate object/nature (the wind) is personification.",
            "hints": [
                "💡 **Hint 1**: Can wind literally whisper secrets like a human does?",
                "📐 **Hint 2**: Attributing human traits, emotions, or intentions to non-human things has a specific term.",
                "🎯 **Hint 3**: Look at the word 'person' inside the term: Personification."
            ]
        },
        {
            "id": "eng-p2",
            "topic": "Grammar & Syntax",
            "question": "Identify the sentence that correctly uses a semicolon to connect two independent clauses:",
            "options": [
                "The storm disrupted the electricity; however, the emergency generators kicked in immediately.",
                "The storm disrupted the electricity; because the generators were ready.",
                "Although the storm was fierce; we felt safe indoors.",
                "We packed blankets; flashlights; and batteries."
            ]
            ,
            "correct_index": 0,
            "explanation": "A semicolon joins two full independent clauses. In option A, 'however' is a conjunctive adverb followed by a comma connecting two complete sentences.",
            "hints": [
                "💡 **Hint 1**: Semicolons connect two complete clauses that could each stand alone as full sentences.",
                "📐 **Hint 2**: 'Because the generators were ready' is a dependent clause and cannot follow a lone semicolon.",
                "🎯 **Hint 3**: Option A properly links two independent thoughts with '; however,'."
            ]
        }
    ]
}

SYSTEM_PROMPTS = {
    "Mathematics": """You are Professor Archimedes, an encouraging, step-by-step secondary school Mathematics AI Tutor.
Your goal is to guide students (Grades 7–12 / GCSE / IGCSE) using the Socratic method:
- Never give the final answer immediately unless the student has tried or explicitly asked for the full solution.
- Break down complex algebraic expressions, geometry proofs, and calculus steps into simple digestible parts.
- Format equations clearly using clean markdown and standard math notations.
- Provide positive reinforcement (+XP compliments) when they make progress!
- Always offer a relevant follow-up check or practice step.""",

    "Science": """You are Dr. Curie, an enthusiastic, inquisitive secondary school Science AI Tutor (Biology, Chemistry, Physics).
Your goal is to explain natural phenomena and scientific principles clearly for secondary school students:
- Connect scientific theories to real-world examples (e.g. rollercoasters for conservation of energy, baking for chemical reactions).
- Use clear headings, bullet points, and chemical/physical formulas where appropriate.
- Guide students to hypothesize, test assumptions, and identify dependent/independent variables.
- Keep explanations inspiring, rigorous, yet accessible.""",

    "English": """You are Mentor Athena, an articulate, supportive secondary school English & Literature AI Tutor.
Your goal is to help students master reading analysis, essay structuring (PEEL/TEAL), rhetoric, and grammar:
- Provide high-impact feedback on writing, thesis statements, and vocabulary enrichment.
- Break down figurative language (metaphor, imagery, foreshadowing, symbolism).
- Suggest stronger synonyms and sentence variety to elevate student writing.
- Always provide illustrative examples."""
}

async def generate_ai_response(
    subject: str,
    message: str,
    chat_history: List[ChatMessage],
    topic: Optional[str] = None,
    grade_level: str = "Year 10 / Grade 10",
    hint_level: int = 0,
    api_key: Optional[str] = None,
    provider: str = "builtin"
) -> Dict[str, Any]:
    """Generates intelligent tutoring response using either external LLM or rich secondary school rules engine."""
    
    # If student requested an external provider and provided key
    if provider == "openai" and api_key:
        try:
            return await _call_openai(subject, message, chat_history, topic, grade_level, hint_level, api_key)
        except Exception as e:
            print(f"OpenAI fallback triggered due to error: {e}")
    
    if provider == "anthropic" and api_key:
        try:
            return await _call_anthropic(subject, message, chat_history, topic, grade_level, hint_level, api_key)
        except Exception as e:
            print(f"Anthropic fallback triggered due to error: {e}")

    # Built-in Intelligent Secondary School Socratic Engine
    return _generate_local_socratic_response(subject, message, chat_history, topic, grade_level, hint_level)

async def _call_openai(subject: str, message: str, history: List[ChatMessage], topic: Optional[str], grade: str, hint_level: int, key: str) -> Dict[str, Any]:
    sys_prompt = SYSTEM_PROMPTS.get(subject, SYSTEM_PROMPTS["Mathematics"])
    sys_prompt += f"\nTarget Student Grade: {grade}. Current Active Topic: {topic or 'General secondary syllabus'}."
    if hint_level > 0:
        sys_prompt += f"\nThe student requested Hint Level {hint_level}/3. Provide progressive scaffolding without giving away everything."

    messages = [{"role": "system", "content": sys_prompt}]
    for h in history[-8:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=25.0) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 800
            }
        )
        data = res.json()
        reply = data["choices"][0]["message"]["content"]
        
        return {
            "reply": reply,
            "hints": [
                f"Hint: Consider how this applies to {topic or subject} principles.",
                "Try writing down the known variables and the target unknown."
            ],
            "follow_up_questions": [
                "Would you like to try a practice problem on this topic?",
                "Do you want me to explain the previous step in more detail?"
            ],
            "xp_awarded": 15
        }

async def _call_anthropic(subject: str, message: str, history: List[ChatMessage], topic: Optional[str], grade: str, hint_level: int, key: str) -> Dict[str, Any]:
    sys_prompt = SYSTEM_PROMPTS.get(subject, SYSTEM_PROMPTS["Mathematics"])
    sys_prompt += f"\nTarget Student Grade: {grade}. Current Active Topic: {topic or 'General secondary syllabus'}."

    messages = []
    for h in history[-6:]:
        if h.role in ["user", "assistant"]:
            messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=25.0) as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "system": sys_prompt,
                "messages": messages,
                "max_tokens": 800
            }
        )
        data = res.json()
        reply = data["content"][0]["text"]
        
        return {
            "reply": reply,
            "hints": ["Review key formula components.", "Check unit conversions and sign rules."],
            "follow_up_questions": ["Shall we solve another variation together?"],
            "xp_awarded": 15
        }

def _generate_local_socratic_response(
    subject: str,
    message: str,
    history: List[ChatMessage],
    topic: Optional[str],
    grade_level: str,
    hint_level: int
) -> Dict[str, Any]:
    msg_lower = message.lower()
    
    # Check if student is asking for a quiz/practice question
    if any(q in msg_lower for q in ["quiz", "practice", "test me", "give me a problem", "question", "problem"]):
        problems = SAMPLE_PRACTICE_PROBLEMS.get(subject, SAMPLE_PRACTICE_PROBLEMS["Mathematics"])
        selected_problem = random.choice(problems)
        
        reply = f"### 🎯 Practice Challenge: {selected_problem['topic']}\n\n"
        reply += f"**Problem:** {selected_problem['question']}\n\n"
        reply += "Select an option below or type your reasoning step-by-step. Remember, you earn **+50 XP** for solving it correctly!"
        
        return {
            "reply": reply,
            "hints": selected_problem["hints"],
            "follow_up_questions": [
                "Need a hint? Click 'Request Hint' below!",
                "Would you like to review the formula first?"
            ],
            "xp_awarded": 20,
            "problem": selected_problem
        }
    
    # Check if hint requested
    if hint_level > 0 or "hint" in msg_lower:
        subject_hints = {
            "Mathematics": [
                "💡 **Step 1 Focus**: Identify the variables given in the question and write down the relevant equation (e.g. $y = mx + c$ or $ax^2 + bx + c = 0$).",
                "📐 **Step 2 Focus**: Isolate the target unknown on one side by performing the same operation to both sides.",
                "🎯 **Step 3 Focus**: Substitute your values back into the original expression to verify both sides balance!"
            ],
            "Science": [
                "💡 **Step 1 Focus**: Identify the physical/chemical system: What is being conserved (energy, mass, charge)?",
                "🔬 **Step 2 Focus**: Check the units carefully (e.g., convert $km/h$ to $m/s$, grams to moles).",
                "🎯 **Step 3 Focus**: State the cause-and-effect relationship using clear scientific keywords."
            ],
            "English": [
                "💡 **Step 1 Focus**: Formulate your Point: What is the main argument or impression the author conveys?",
                "✍️ **Step 2 Focus**: Embed precise Evidence (a 2-4 word quotation) directly inside your sentence.",
                "🎯 **Step 3 Focus**: Analyze the effect on the reader: How do specific word choices create tone and subtext?"
            ]
        }
        level = min(max(hint_level, 1), 3) - 1
        hints_list = subject_hints.get(subject, subject_hints["Mathematics"])
        chosen_hint = hints_list[level]
        
        return {
            "reply": f"### 💡 Hint Level {level + 1}/3\n\n{chosen_hint}\n\nTake another look at the problem with this clue. What do you think your next step should be?",
            "hints": hints_list,
            "follow_up_questions": [
                "Does this hint make the next step clear?",
                "Ready to see the next hint level, or do you want to try an answer?"
            ],
            "xp_awarded": 5
        }

    # Subject-specific contextual Socratic response
    if subject == "Mathematics":
        reply = (
            f"### 📐 Socratic Guidance: Mathematics ({grade_level})\n\n"
            f"Great inquiry! When working through `{message}`, let's break it down methodically:\n\n"
            f"1. **Identify the Core Structure**: What type of mathematical object are we dealing with (linear, quadratic, trigonometric, or geometric)?\n"
            f"2. **Standard Form**: Can we rearrange the terms so all variables are aligned on one side?\n"
            f"3. **Select Strategy**: Would factoring, substitution, or applying a known theorem be the most direct pathway?\n\n"
            f"**Let's try this together**: What is the first operation you think we should perform?"
        )
        follow_ups = [
            "What happens if we move all constants to the right-hand side?",
            "Would you like me to generate an example problem first?",
            "Do you want to see the algebraic formula breakdown?"
        ]
    elif subject == "Science":
        reply = (
            f"### 🔬 Scientific Inquiry: Science ({grade_level})\n\n"
            f"Fascinating topic! In scientific analysis regarding `{message}`:\n\n"
            f"• **The Underlying Principle**: Notice how energy and matter interact according to fundamental conservation laws.\n"
            f"• **Key Variables**: What is our independent variable (what we change) versus dependent variable (what we observe/measure)?\n"
            f"• **Real-World Connection**: Think of how this mechanism operates in everyday phenomena.\n\n"
            f"What hypothesis would you formulate based on your current understanding?"
        )
        follow_ups = [
            "What factors might act as limiting factors in this system?",
            "Would you like to test this with a quick 4-option quiz?",
            "Shall we review the related lab experiment concepts?"
        ]
    else: # English
        reply = (
            f"### ✍️ Athena's Analysis: English ({grade_level})\n\n"
            f"Excellent focus! For `{message}`, let's sharpen our critical analysis:\n\n"
            f"• **PEEL Structure**: Always anchor your argument with a decisive **Point**, targeted **Evidence** (quotes), detailed **Explanation** of literary devices, and a **Link** to the overall theme.\n"
            f"• **Vocabulary Elevation**: Consider replacing common adjectives with vivid tier-2 vocabulary (e.g. replace *sad* with *melancholic*, *happy* with *exuberant*).\n"
            f"• **Tone & Context**: How does the author's diction shape the reader's emotional response?\n\n"
            f"How would you express your thesis statement in a single powerful sentence?"
        )
        follow_ups = [
            "Would you like suggestions for elevated vocabulary words?",
            "Shall we draft a model PEEL paragraph together?",
            "Do you want to review persuasive rhetoric (Ethos, Pathos, Logos)?"
        ]

    return {
        "reply": reply,
        "hints": [
            f"Think about the foundational definition in {subject}.",
            "Try breaking the problem into 2 smaller mini-steps."
        ],
        "follow_up_questions": follow_ups,
        "xp_awarded": 15
    }
