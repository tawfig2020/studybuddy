# StudyBuddy AI — Secondary School Daily 2-Hour Tutor

Interactive AI study tutor web application designed specifically for secondary school students (Grades 7–12 / GCSE / IGCSE / High School).

## Key Features

- **Structured 2-Hour Daily Routine Engine**:
  - Enforces 40-minute blocks across Mathematics, Science, and English (Monday–Saturday).
  - Sunday Rest & Lockout Day to prevent cognitive burnout and consolidate memory.
  - Interactive circular focus timer with audio cues, quick break triggers, and automated progression.
- **Socratic AI Tutoring Personas**:
  - **Prof. Archimedes** (Mathematics): Algebraic breakdown, geometric theorems, calculus foundations.
  - **Dr. Curie** (Science): Physics equations (Newton's laws, energy), chemistry stoichiometry, cellular biology.
  - **Mentor Athena** (English): PEEL essay frameworks, literary device analysis, rhetoric, and vocabulary enrichment.
  - Progressive Scaffolding Hint Buttons: Level 1 (Nudge), Level 2 (Core Rule/Formula), Level 3 (Full Step-by-Step).
  - Interactive practice problem generator with instant feedback and XP rewards.
- **Gamification Engine (Levels 1–10)**:
  - 10 distinct progression tiers (Novice Scholar to Grandmaster of Learning).
  - XP rewarded for problem solving (+50 XP), completing 40m blocks (+150 XP), full daily routine (+300 XP), and streaks.
  - Interactive badge system and celebratory animations.
- **Progressive Analytics & Grade Estimation**:
  - Weekly vs. Monthly progression charts powered by Recharts.
  - Subject accuracy breakdowns and predicted GCSE/Secondary school letter grades (A*, A, B).
- **Authentication & Settings**:
  - Supabase Auth integration (JWT & password reset) with instant local fallback mode.
  - Customizable grade level, target exam board, avatar selection, sound toggle, and AI provider selection (Built-in, OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq).

## Architecture

- **Frontend**: React 18 (TypeScript), Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti, Web Audio API Synthesizer.
- **Backend**: Python 3 (FastAPI), Pydantic schemas, Socratic tutoring logic, and REST integration.
- **Database / Auth**: Supabase PostgreSQL + Supabase Auth.
