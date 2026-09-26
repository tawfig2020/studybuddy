import { LevelTier, BadgeItem } from '../types';

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, name: "Novice Scholar", xp_needed: 0, badge: "🌱", description: "Beginning your secondary study journey" },
  { level: 2, name: "Apprentice Learner", xp_needed: 500, badge: "📘", description: "Building consistent study foundations" },
  { level: 3, name: "Knowledge Seeker", xp_needed: 1200, badge: "🔍", description: "Mastering core principles across all 3 subjects" },
  { level: 4, name: "Focused Achiever", xp_needed: 2200, badge: "⚡", description: "Maintaining daily 2-hour study habits" },
  { level: 5, name: "Concept Master", xp_needed: 3500, badge: "💡", description: "Deep problem-solving and analytical reasoning" },
  { level: 6, name: "Academic Ace", xp_needed: 5000, badge: "🎯", description: "Top-tier accuracy in Maths, Science & English" },
  { level: 7, name: "Study Champion", xp_needed: 6800, badge: "🏆", description: "Flawless streak and dedication" },
  { level: 8, name: "Honors Scholar", xp_needed: 8800, badge: "🌟", description: "Excellence across Secondary & Exam syllabi" },
  { level: 9, name: "Master Polymath", xp_needed: 11000, badge: "👑", description: "Exceptional mastery of all subjects" },
  { level: 10, name: "Grandmaster of Learning", xp_needed: 14000, badge: "🌌", description: "Legendary discipline and supreme academic power" },
];

export const INITIAL_BADGES: BadgeItem[] = [
  { id: "b1", name: "First Step", description: "Completed your first 40-minute study session", icon: "🚀", unlocked: true, date: "2026-08-18", xp_value: 100 },
  { id: "b2", name: "Maths Magician", description: "Solved 10 algebra problems with >80% accuracy", icon: "📐", unlocked: true, date: "2026-08-20", xp_value: 150 },
  { id: "b3", name: "Streak Champion", description: "Maintained a 4-day daily routine streak", icon: "🔥", unlocked: true, date: "2026-08-22", xp_value: 200 },
  { id: "b4", name: "Science Whiz", description: "Completed Cellular Respiration and Forces modules", icon: "🔬", unlocked: false, date: null, xp_value: 250 },
  { id: "b5", name: "Master Orator", description: "Drafted 5 persuasive essay thesis frameworks", icon: "✍️", unlocked: false, date: null, xp_value: 250 },
  { id: "b6", name: "Century Club", description: "Earned over 5,000 XP (Level 6)", icon: "👑", unlocked: false, date: null, xp_value: 500 },
  { id: "b7", name: "Sunday Sage", description: "Respected Sunday rest & prepared for the new week", icon: "🧘", unlocked: false, date: null, xp_value: 150 },
  { id: "b8", name: "Hint Explorer", description: "Used progressive hints to solve a tough question", icon: "💡", unlocked: true, date: "2026-08-21", xp_value: 100 },
];

export const GRADE_OPTIONS = [
  "Year 7 / Grade 7 (Ages 11-12)",
  "Year 8 / Grade 8 (Ages 12-13)",
  "Year 9 / Grade 9 (Ages 13-14)",
  "Year 10 / Grade 10 (GCSE / IGCSE Year 1)",
  "Year 11 / Grade 11 (GCSE / IGCSE Exam Year)",
  "Year 12 / Grade 12 (A-Level / IB Prep)",
];

export const EXAM_BOARDS = [
  "GCSE / IGCSE (Edexcel, Cambridge CIE, AQA)",
  "US Common Core / High School",
  "IB Middle Years / Diploma",
  "National Secondary Curriculum",
  "General Secondary School",
];

export const AVATARS = [
  { id: "astronaut", emoji: "👨‍🚀", label: "Astro Scholar" },
  { id: "scientist", emoji: "👩‍🔬", label: "Dr. Curious" },
  { id: "wizard", emoji: "🧙‍♂️", label: "Math Wizard" },
  { id: "coder", emoji: "👩‍💻", label: "Tech Prodigy" },
  { id: "owl", emoji: "🦉", label: "Wisdom Owl" },
  { id: "lion", emoji: "🦁", label: "Brave Leader" },
];
