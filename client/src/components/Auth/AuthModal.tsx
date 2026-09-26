import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, user, updateProfile } = useApp();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(user.full_name);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      if (isSupabaseConfigured()) {
        if (authMode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName }
            }
          });
          if (error) throw error;
          setStatusMessage({ type: 'success', text: 'Account created! Please check your email to confirm registration.' });
          updateProfile({ email, full_name: fullName });
        } else if (authMode === 'signin') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          setStatusMessage({ type: 'success', text: 'Successfully signed in with Supabase Auth!' });
          if (data.user) {
            updateProfile({ email: data.user.email || email, full_name: data.user.user_metadata?.full_name || fullName });
          }
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        } else if (authMode === 'reset') {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
          setStatusMessage({ type: 'success', text: 'Password reset link sent to your email address!' });
        }
      } else {
        // Local mode / Mock Auth
        if (authMode === 'signup') {
          updateProfile({ email, full_name: fullName });
          setStatusMessage({ type: 'success', text: 'Account registered locally! (Supabase credentials can be connected in .env)' });
          setTimeout(() => setIsAuthModalOpen(false), 1500);
        } else if (authMode === 'signin') {
          updateProfile({ email });
          setStatusMessage({ type: 'success', text: 'Welcome back! Signed in to your secondary school study space.' });
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        } else {
          setStatusMessage({ type: 'success', text: `Demo reset instructions sent to ${email}.` });
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Authentication error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {authMode === 'signin' ? 'Sign In to StudyBuddy' : authMode === 'signup' ? 'Create Secondary Student Account' : 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-400">
                Supabase Auth JWT & Email Verification
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Student Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@secondary.edu"
                className="w-full bg-slate-850 border border-slate-750 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {authMode !== 'reset' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-300">Password</label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <span>
              {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Mode Switcher */}
          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            {authMode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Sign Up Free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
