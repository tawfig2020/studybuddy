import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, SubjectType, DailyRoutineState, LevelTier, BadgeItem, ChatMessage, PracticeProblem, School, StudentChapter } from '../types';
import { LEVEL_TIERS, INITIAL_BADGES } from '../constants/levels';
import { soundFx } from '../lib/sound';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { apiUrl } from '../lib/api';

interface AppContextType {
  user: UserProfile;
  currentSubject: SubjectType;
  setCurrentSubject: (sub: SubjectType) => void;
  routine: DailyRoutineState;
  // Multi-Tenant / ALC
  schools: School[];
  chapters: StudentChapter[];
  activeChapter: StudentChapter | null;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveChapter: (chapter: Partial<StudentChapter>) => Promise<void>;
  // Timer controls
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  completeCurrentSubjectSession: () => void;
  skipToNextSubject: () => void;
  toggleRestDayOverride: () => void;
  // XP & Gamification
  addXp: (amount: number, reason: string) => void;
  levelTiers: LevelTier[];
  currentLevelTier: LevelTier;
  nextLevelTier: LevelTier | null;
  levelProgressPercent: number;
  badges: BadgeItem[];
  recentXpGained: { amount: number; reason: string; id: number } | null;
  // Chat & Tutor
  chatHistories: Record<SubjectType, ChatMessage[]>;
  sendMessageToTutor: (message: string, hintLevel?: number) => Promise<void>;
  requestHint: (hintLevel: number) => Promise<void>;
  requestPracticeProblem: () => Promise<void>;
  submitQuizAnswer: (problemId: string, selectedIdx: number) => void;
  isAiLoading: boolean;
  // Profile & Settings
  isAuthenticated: boolean;
  authSession: Session | null;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isLevelModalOpen: boolean;
  setIsLevelModalOpen: (open: boolean) => void;
  isBadgesModalOpen: boolean;
  setIsBadgesModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'studybuddy_user_v1';
const STORAGE_KEY_ROUTINE = 'studybuddy_routine_v1';
const STORAGE_KEY_BADGES = 'studybuddy_badges_v1';
const STORAGE_KEY_CHAT = 'studybuddy_chat_v1';

const DEFAULT_USER: UserProfile = {
  id: 'user-secondary-01',
  email: 'student@studybuddy.edu',
  full_name: 'Ayesha Begum',
  role: 'student',
  school_id: 'school-001',
  school_name: 'Rohingya Learning Center - Selayang',
  grade_level: 10,
  academic_year_start: '2026-03-01',
  academic_year_end: '2027-01-31',
  target_exam: 'GCSE / IGCSE (Edexcel, Cambridge CIE, AQA)',
  avatar: 'astronaut',
  xp: 1450,
  level: 3,
  level_name: 'Knowledge Seeker',
  streak_days: 4,
  total_study_minutes: 840,
  sound_enabled: true,
  ai_provider: 'builtin',
  created_at: new Date().toISOString(),
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial User
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USER;
  });

  const [currentSubject, setCurrentSubject] = useState<SubjectType>('Maths');
  const [chapters, setChapters] = useState<StudentChapter[]>(() => {
    try { const saved = localStorage.getItem('studybuddy_chapters_v1'); if (saved) return JSON.parse(saved); } catch (e) { console.error(e); }
    return [];
  });
  const [schools, setSchools] = useState<School[]>(() => {
    try { const saved = localStorage.getItem('studybuddy_schools_v1'); if (saved) return JSON.parse(saved); } catch (e) { console.error(e); }
    return [];
  });
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    try { return localStorage.getItem('studybuddy_onboarding_v1') === 'complete'; } catch { return false; }
  });
  const [authSession, setAuthSession] = useState<Session | null>(null);

  // ---------- Supabase Auth: restore session + subscribe to auth changes ----------
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Restore any existing session on first load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setAuthSession(data.session);
        setUser((prev) => ({
          ...prev,
          id: data.session!.user.id,
          email: data.session!.user.email || prev.email,
          full_name: data.session!.user.user_metadata?.full_name || prev.full_name,
        }));
      }
    });

    // Keep app user in sync with Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthSession(session);
      if (session?.user) {
        setUser((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email || prev.email,
          full_name: session.user.user_metadata?.full_name || prev.full_name,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setAuthSession(null);
    setUser((prev) => ({ ...DEFAULT_USER, sound_enabled: prev.sound_enabled }));
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const activeChapter = useMemo(
    () => chapters.find((ch) => ch.subject === currentSubject && ch.is_active) || null,
    [chapters, currentSubject]
  );

  // Offline-first: persist and load from localStorage
  useEffect(() => { localStorage.setItem('studybuddy_chapters_v1', JSON.stringify(chapters)); }, [chapters]);
  useEffect(() => { localStorage.setItem('studybuddy_schools_v1', JSON.stringify(schools)); }, [schools]);
  useEffect(() => { localStorage.setItem('studybuddy_onboarding_v1', onboardingComplete ? 'complete' : 'incomplete'); }, [onboardingComplete]);

  // Backward sync to backend
  useEffect(() => {
    const load = async () => {
      try {
        const [schoolsRes, chaptersRes] = await Promise.all([
          fetch(apiUrl('/api/schools')),
          fetch(apiUrl(`/api/chapters?user_id=${user.id}`))
        ]);
        if (schoolsRes.ok) {
          const data = await schoolsRes.json();
          setSchools(data.schools || []);
        }
        if (chaptersRes.ok) {
          const data = await chaptersRes.json();
          setChapters(data.chapters || []);
        }
      } catch (e) {
        console.warn('Backend unavailable; using cached offline data.');
      }
    };
    load();
  }, []);

  const saveChapter = async (chapter: Partial<StudentChapter>) => {
    const existing = chapters.find((c) => c.id === chapter.id);
    if (existing) {
      setChapters((prev) => prev.map((c) => (c.id === chapter.id ? { ...c, ...chapter } as StudentChapter : c)));
    } else if (chapter.subject && chapter.chapter_number !== undefined && chapter.chapter_title) {
      const newChapter: StudentChapter = {
        id: `ch-${Date.now()}`,
        user_id: user.id,
        subject: chapter.subject as SubjectType,
        chapter_number: chapter.chapter_number,
        chapter_title: chapter.chapter_title,
        status: (chapter.status as any) || 'not_started',
        is_active: chapter.is_active ?? false,
      };
      setChapters((prev) => [...prev, newChapter]);
    }
  };

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BADGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BADGES;
  });

  // Daily Routine State (Monday-Saturday 2 hours, Sunday Rest)
  const [routine, setRoutine] = useState<DailyRoutineState>(() => {
    const today = new Date();
    const isSunday = today.getDay() === 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUTINE);
      if (saved) {
        const parsed: DailyRoutineState = JSON.parse(saved);
        if (parsed.date === today.toISOString().split('T')[0]) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      date: today.toISOString().split('T')[0],
      is_sunday: isSunday,
      total_target_minutes: 120,
      total_completed_minutes: 40,
      current_subject_index: 0,
      sessions: [
        { subject: 'Maths', target_minutes: 40, completed_minutes: 40, is_completed: true, active_topic: 'Quadratic Equations & Factoring', questions_solved: 6, accuracy: 88.5 },
        { subject: 'Science', target_minutes: 40, completed_minutes: 25, is_completed: false, active_topic: 'Forces & Newton\'s Laws', questions_solved: 4, accuracy: 82.0 },
        { subject: 'English', target_minutes: 40, completed_minutes: 0, is_completed: false, active_topic: 'Critical Reading & Textual Analysis', questions_solved: 0, accuracy: 0.0 },
      ],
      is_daily_goal_completed: false,
      rest_day_override: false,
    };
  });

  // Timer State for current subject session (40 minutes = 2400 seconds default, or current remaining)
  const currentSession = routine.sessions[routine.current_subject_index] || routine.sessions[0];
  const initialSeconds = Math.max(0, (currentSession.target_minutes - currentSession.completed_minutes) * 60);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(initialSeconds > 0 ? initialSeconds : 40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Chat History per subject
  const [chatHistories, setChatHistories] = useState<Record<SubjectType, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      Maths: [
        {
          id: 'm1',
          role: 'assistant',
          content: 'Hello Ayesha! I am Professor Archimedes, your Maths Tutor for the Rohingya Learning Center. Our active chapter is **Quadratic Equations & Factoring**.\n\nNeed help with quadratic formulas, factoring by grouping, or graphing parabolas? Ask a question or click **Practice Problem** below!',
          timestamp: new Date().toISOString(),
          follow_ups: ['How do I factor 2x² - 7x + 3 = 0?', 'Explain completing the square step-by-step.', 'Give me a practice problem!']
        }
      ],
      Science: [
        {
          id: 's1',
          role: 'assistant',
          content: 'Greetings, young scientist! Dr. Curie here. In our 40-minute Science session, we are exploring **Forces, Newton\'s Laws & Energy Conservation**.\n\nWhat scientific concept would you like to investigate today?',
          timestamp: new Date().toISOString(),
          follow_ups: ['How do I calculate acceleration with F=ma?', 'What is the difference between kinetic and potential energy?', 'Test me with a Science Quiz!']
        }
      ],
      English: [
        {
          id: 'e1',
          role: 'assistant',
          content: 'Welcome, scholar! I am Mentor Athena. Today we will refine your **Critical Reading, Textual Analysis & Essay Writing**.\n\nReady to analyze literary devices, sharpen your thesis statement, or draft a PEEL paragraph?',
          timestamp: new Date().toISOString(),
          follow_ups: ['How do I structure a top-grade PEEL paragraph?', 'What are good examples of personification & metaphors?', 'Generate an English reading challenge!']
        }
      ]
    };
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [recentXpGained, setRecentXpGained] = useState<{ amount: number; reason: string; id: number } | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROUTINE, JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Sync sound setting
  useEffect(() => {
    soundFx.setEnabled(user.sound_enabled);
  }, [user.sound_enabled]);

  // Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setTimerSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSessionCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSecondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsRemaining]);

  // Update timer seconds when current subject changes
  const switchSubject = (sub: SubjectType) => {
    setCurrentSubject(sub);
    const subIdx = routine.sessions.findIndex((s) => s.subject === sub);
    if (subIdx !== -1) {
      const sess = routine.sessions[subIdx];
      const leftMinutes = Math.max(0, sess.target_minutes - sess.completed_minutes);
      setTimerSecondsRemaining(leftMinutes * 60);
      setRoutine((prev) => ({ ...prev, current_subject_index: subIdx }));
    }
  };

  const startTimer = () => {
    soundFx.playClick();
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    soundFx.playClick();
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    soundFx.playClick();
    setIsTimerRunning(false);
    setTimerSecondsRemaining(40 * 60);
  };

  const handleSessionCompleted = () => {
    setIsTimerRunning(false);
    soundFx.playTimerBell();
    addXp(150, `Completed 40m ${currentSubject} session!`);

    // Update routine
    setRoutine((prev) => {
      const updatedSessions = prev.sessions.map((s, idx) => {
        if (idx === prev.current_subject_index) {
          return { ...s, completed_minutes: 40, is_completed: true };
        }
        return s;
      });
      const totalMins = updatedSessions.reduce((acc, curr) => acc + curr.completed_minutes, 0);
      const isGoalMet = totalMins >= 120;
      if (isGoalMet && !prev.is_daily_goal_completed) {
        // Daily goal completed bonus
        setTimeout(() => {
          addXp(300, '🌟 Completed Full 2-Hour Daily Routine!');
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }, 600);
      }
      return {
        ...prev,
        sessions: updatedSessions,
        total_completed_minutes: totalMins,
        is_daily_goal_completed: isGoalMet,
      };
    });
  };

  const completeCurrentSubjectSession = () => {
    handleSessionCompleted();
  };

  const skipToNextSubject = () => {
    soundFx.playClick();
    const nextIdx = (routine.current_subject_index + 1) % 3;
    const nextSub = routine.sessions[nextIdx].subject;
    switchSubject(nextSub);
  };

  const toggleRestDayOverride = () => {
    soundFx.playClick();
    setRoutine((prev) => ({ ...prev, rest_day_override: !prev.rest_day_override }));
  };

  // Gamification & Level Calculations
  const calculateLevelTier = (xp: number) => {
    let current = LEVEL_TIERS[0];
    let next: LevelTier | null = LEVEL_TIERS[1];
    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      if (xp >= LEVEL_TIERS[i].xp_needed) {
        current = LEVEL_TIERS[i];
        next = LEVEL_TIERS[i + 1] || null;
      }
    }
    return { current, next };
  };

  const { current: currentLevelTier, next: nextLevelTier } = calculateLevelTier(user.xp);

  const levelProgressPercent = nextLevelTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(((user.xp - currentLevelTier.xp_needed) / (nextLevelTier.xp_needed - currentLevelTier.xp_needed)) * 100)
        )
      )
    : 100;

  const addXp = (amount: number, reason: string) => {
    soundFx.playXpGain();
    const newXp = user.xp + amount;
    const { current: oldTier } = calculateLevelTier(user.xp);
    const { current: newTier } = calculateLevelTier(newXp);

    setRecentXpGained({ amount, reason, id: Date.now() });
    setTimeout(() => {
      setRecentXpGained(null);
    }, 3500);

    const levelUp = newTier.level > oldTier.level;
    if (levelUp) {
      soundFx.playLevelUp();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }

    setUser((prev) => ({
      ...prev,
      xp: newXp,
      level: newTier.level,
      level_name: newTier.name,
      total_study_minutes: prev.total_study_minutes + (reason.includes('40m') ? 40 : 5),
    }));
  };

  // AI Chat & Tutor interaction
  const sendMessageToTutor = async (text: string, hintLevel: number = 0) => {
    if (!text.trim()) return;
    soundFx.playClick();

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setChatHistories((prev) => ({
      ...prev,
      [currentSubject]: [...prev[currentSubject], userMsg],
    }));

    setIsAiLoading(true);

    try {
      const currentSess = routine.sessions.find((s) => s.subject === currentSubject);
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject,
          chapter_title: activeChapter?.chapter_title || currentSess?.active_topic,
          chapter_number: activeChapter?.chapter_number,
          grade_level: user.grade_level,
          school_name: user.school_name,
          academic_year_end: user.academic_year_end,
          message: text,
          chat_history: chatHistories[currentSubject].slice(-6),
          hint_level: hintLevel,
          api_key: user.custom_api_key,
          provider: user.ai_provider,
        }),
      });

      if (!res.ok) throw new Error('Failed to connect to backend');
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        hints: data.hints,
        follow_ups: data.follow_up_questions,
        problem_data: data.problem,
        xp_awarded: data.xp_awarded || 15,
      };

      setChatHistories((prev) => ({
        ...prev,
        [currentSubject]: [...prev[currentSubject], assistantMsg],
      }));

      addXp(data.xp_awarded || 15, `Active learning in ${currentSubject}`);
    } catch (err) {
      console.warn('Using client-side Socratic fallback:', err);
      // Fallback local tutor reply
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `### 💡 Socratic Guidance: ${currentSubject}\n\nExcellent effort! When tackling **${text}**, remember our secondary school framework:\n\n1. **Identify the Given Information**: Write down values and constraints.\n2. **Apply the Core Rule**: Recall the formula or literary concept.\n3. **Step-by-Step Execution**: Work methodically.\n\nWhat do you think is our next immediate step?`,
        timestamp: new Date().toISOString(),
        follow_ups: ['Would you like to try a practice problem?', 'Can you break down the next step?'],
        xp_awarded: 15,
      };
      setChatHistories((prev) => ({
        ...prev,
        [currentSubject]: [...prev[currentSubject], fallbackMsg],
      }));
      addXp(15, `Active learning in ${currentSubject}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const requestHint = async (hintLevel: number) => {
    await sendMessageToTutor(`Please give me Hint Level ${hintLevel} for this concept.`, hintLevel);
  };

  const requestPracticeProblem = async () => {
    await sendMessageToTutor('Give me a secondary school practice problem with options!', 0);
  };

  const submitQuizAnswer = (problemId: string, selectedIdx: number) => {
    soundFx.playClick();
    const history = chatHistories[currentSubject];
    const targetMsg = history.find((m) => m.problem_data?.id === problemId);
    if (!targetMsg || !targetMsg.problem_data) return;

    const prob = targetMsg.problem_data;
    const isCorrect = selectedIdx === prob.correct_index;

    if (isCorrect) {
      soundFx.playLevelUp();
      addXp(50, `Correct answer in ${currentSubject} quiz!`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

      const feedbackMsg: ChatMessage = {
        id: `fb-${Date.now()}`,
        role: 'assistant',
        content: `🎉 **Brilliant! Option (${prob.options[selectedIdx]}) is correct!**\n\n**Explanation**: ${prob.explanation}\n\nYou earned **+50 XP**! Ready for another challenge?`,
        timestamp: new Date().toISOString(),
        follow_ups: ['Give me another practice problem!', 'Explain this concept further.'],
      };
      setChatHistories((prev) => ({
        ...prev,
        [currentSubject]: [...prev[currentSubject], feedbackMsg],
      }));
    } else {
      const feedbackMsg: ChatMessage = {
        id: `fb-${Date.now()}`,
        role: 'assistant',
        content: `Not quite! You selected **${prob.options[selectedIdx]}**.\n\n💡 **Hint**: Look at the problem again or click 'Request Hint' below to break it down step-by-step. Don't worry, mistakes help us learn!`,
        timestamp: new Date().toISOString(),
        follow_ups: ['Request Hint 1', 'Show me the correct explanation.'],
      };
      setChatHistories((prev) => ({
        ...prev,
        [currentSubject]: [...prev[currentSubject], feedbackMsg],
      }));
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentSubject,
        setCurrentSubject: switchSubject,
        routine,
        schools,
        chapters,
        activeChapter,
        onboardingComplete,
        setOnboardingComplete,
        saveChapter,
        timerSecondsRemaining,
        isTimerRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        completeCurrentSubjectSession,
        skipToNextSubject,
        toggleRestDayOverride,
        addXp,
        levelTiers: LEVEL_TIERS,
        currentLevelTier,
        nextLevelTier,
        levelProgressPercent,
        badges,
        recentXpGained,
        chatHistories,
        sendMessageToTutor,
        requestHint,
        requestPracticeProblem,
        submitQuizAnswer,
        isAiLoading,
        updateProfile,
        isAuthenticated: !!authSession,
        authSession,
        signOut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isLevelModalOpen,
        setIsLevelModalOpen,
        isBadgesModalOpen,
        setIsBadgesModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
