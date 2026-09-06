/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, Phone, ShieldAlert, Sparkles, BookOpen, 
  Library, GraduationCap, ShieldCheck, ArrowRight, Check 
} from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onNavigate: (view: string) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
  initialMode?: 'student' | 'admin';
}

export function LoginView({ onLogin, onNavigate, toast, initialMode = 'student' }: LoginProps) {
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (initialMode) {
      setLoginMode(initialMode);
    }
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) {
      setErr('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (error: any) {
      setErr(error.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative z-10 space-y-6">
        
        {/* Role Switcher: Member vs Admin */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setLoginMode('student');
              setErr('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              loginMode === 'student'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-student-login"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setErr('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-admin-login"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Login as Admin</span>
          </button>
        </div>

        {/* Dynamic Header based on selected login mode */}
        {loginMode === 'admin' ? (
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 bg-slate-900 rounded-2xl text-amber-400 shadow-lg shadow-slate-900/20 mb-1 ring-4 ring-amber-400/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300/60">
                Staff & Librarian Portal
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Sign In</h2>
            <p className="text-slate-500 text-xs">Enter administrative credentials to manage library inventory, borrowers, and catalogs</p>
          </div>
        ) : (
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-1">
              <Library className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-xs">Enter credentials to unlock your campus library workstation</p>
          </div>
        )}

        {/* Error Alert */}
        {err && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {loginMode === 'admin' ? 'Admin Email Address' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder={loginMode === 'admin' ? 'admin@example.com' : 'student@example.com'}
                required
                id="login-email-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="••••••••"
                required
                id="login-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 hover:shadow-slate-900/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-blue-500/20'
            }`}
            id="login-submit-btn"
          >
            {loginMode === 'admin' ? (
              <>
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>{loading ? 'Authenticating Admin...' : 'Log In as Admin'}</span>
              </>
            ) : (
              <span>{loading ? 'Securing Connection...' : 'Secure Log In'}</span>
            )}
          </button>
        </form>

        {/* Dynamic Footer Options */}
        <div className="pt-3 border-t border-slate-100 flex flex-col items-center space-y-3">
          {loginMode === 'admin' ? (
            <p className="text-xs text-slate-500">
              Are you a student or faculty member?{' '}
              <button
                type="button"
                onClick={() => {
                  setLoginMode('student');
                  setErr('');
                }}
                className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                id="switch-to-student-btn"
              >
                Switch to Member Login
              </button>
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Don't have a library account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  id="login-signup-link"
                >
                  Sign Up Now
                </button>
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('admin');
                  setErr('');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200"
                id="switch-to-admin-btn"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Are you an Admin? Login as Admin</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface RegisterProps {
  onRegister: (data: any) => Promise<void>;
  onNavigate: (view: string) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

export function RegisterView({ onRegister, onNavigate, toast }: RegisterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    if (!firstName || !lastName || !email || !password) {
      setErr('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErr('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'student'
      };

      await onRegister(payload);
      toast('Registration successful! Please log in.', 'success');
      onNavigate('login');
    } catch (error: any) {
      setErr(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Registration</h2>
          <p className="text-slate-400 text-xs">Create your student library account</p>
        </div>

        {err && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="student@campus.edu"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="+1 (555) 0122"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="Min 6 characters"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors shadow-md shadow-blue-500/10 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            id="register-submit-btn"
          >
            <span>{loading ? 'Registering Account...' : 'Register Student Account'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already have a library account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Log In Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [mockToken, setMockToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API recovery
    setSuccess(true);
    setMockToken(`RESET-${Math.floor(Math.random() * 90000) + 10000}-SECRET`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative z-10 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Security Recovery</h2>
          <p className="text-slate-400 text-xs">Recover your credentials safely</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs leading-relaxed">
              <p className="font-bold">Dispatch Complete!</p>
              <p className="mt-1">We have generated a mock password reset request. For this sandbox preview environment, you can use the token bypass below to immediately reset your password.</p>
              <div className="mt-3 p-2 bg-white border border-emerald-200 font-mono text-center text-emerald-700 rounded-lg text-[11px] font-bold">
                {mockToken}
              </div>
            </div>

            <button
              onClick={() => onNavigate('login')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm outline-none"
                placeholder="student@library.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10"
            >
              Verify & Send Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
