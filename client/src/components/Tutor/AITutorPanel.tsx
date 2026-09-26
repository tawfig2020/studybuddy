import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Lightbulb, HelpCircle, Sparkles, Bot, User, 
  Brain, CheckCircle, RefreshCw, Layers, Check, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubjectType, PracticeProblem } from '../../types';

export const AITutorPanel: React.FC = () => {
  const {
    currentSubject,
    chatHistories,
    sendMessageToTutor,
    requestHint,
    requestPracticeProblem,
    submitQuizAnswer,
    isAiLoading,
    user
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = chatHistories[currentSubject] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    await sendMessageToTutor(msg);
  };

  const handleHintClick = async (level: number) => {
    setActiveHintLevel(level);
    await requestHint(level);
  };

  const handleAnswerSelection = (problemId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [problemId]: optionIdx }));
    submitQuizAnswer(problemId, optionIdx);
  };

  const tutorPersonas: Record<SubjectType, { name: string; title: string; avatar: string; color: string; desc: string }> = {
    Maths: {
      name: "Prof. Archimedes",
      title: "Secondary Maths Specialist",
      avatar: "📐",
      color: "from-blue-600 to-indigo-600",
      desc: "Socratic problem breakdown, formulas, and proofs"
    },
    Science: {
      name: "Dr. Curie",
      title: "Secondary Science Specialist",
      avatar: "🔬",
      color: "from-emerald-600 to-teal-600",
      desc: "Physics laws, Chemical equations & Biological systems"
    },
    English: {
      name: "Mentor Athena",
      title: "Secondary English & Literature Specialist",
      avatar: "✍️",
      color: "from-purple-600 to-pink-600",
      desc: "PEEL structure, literary devices & vocabulary"
    }
  };

  const currentTutor = tutorPersonas[currentSubject];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col h-[650px] shadow-xl overflow-hidden">
      
      {/* Tutor Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${currentTutor.color} flex items-center justify-center text-xl shadow-md`}>
            {currentTutor.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">{currentTutor.name}</span>
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {currentSubject} Tutor
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{currentTutor.desc}</p>
          </div>
        </div>

        {/* Quick Practice Challenge Trigger */}
        <button
          onClick={requestPracticeProblem}
          disabled={isAiLoading}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Practice Problem (+50 XP)</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0 mt-1">
                  {currentTutor.avatar}
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>

                {/* Interactive Practice Question Card if present */}
                {msg.problem_data && (
                  <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                      <span className="flex items-center gap-1.5">
                        <Brain className="h-4 w-4" />
                        {msg.problem_data.topic} Challenge
                      </span>
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        +50 XP
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {msg.problem_data.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {msg.problem_data.options.map((opt, idx) => {
                        const isSelected = selectedAnswers[msg.problem_data!.id] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelection(msg.problem_data!.id, idx)}
                            className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-850'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="h-4 w-4 text-white shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Follow-up Question Suggestion Chips */}
                {msg.follow_ups && msg.follow_ups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.follow_ups.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => sendMessageToTutor(q)}
                        className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl px-2.5 py-1 transition flex items-center gap-1"
                      >
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                  You
                </div>
              )}
            </div>
          );
        })}

        {isAiLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs font-medium">
            <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
              {currentTutor.avatar}
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-2 rounded-2xl flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>{currentTutor.name} is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scaffolding Hint Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          Request Socratic Hint:
        </span>
        <button
          onClick={() => handleHintClick(1)}
          disabled={isAiLoading}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition shrink-0"
        >
          Level 1: Nudge
        </button>
        <button
          onClick={() => handleHintClick(2)}
          disabled={isAiLoading}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition shrink-0"
        >
          Level 2: Core Rule
        </button>
        <button
          onClick={() => handleHintClick(3)}
          disabled={isAiLoading}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition shrink-0"
        >
          Level 3: Full Step-by-Step
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${currentTutor.name} a question, request a formula explanation, or ask for guidance...`}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isAiLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold p-2.5 rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
};
