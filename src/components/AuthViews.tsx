/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ShieldAlert, Sparkles, BookOpen, Library, GraduationCap, Award } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onNavigate: (view: string) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

export function LoginView({ onLogin, onNavigate, toast }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

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
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-2">
            <Library className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs">Enter credentials to unlock your campus workstation</p>
        </div>

        {err && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="student@library.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none"
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
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors shadow-md shadow-blue-500/10 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            id="login-submit-btn"
          >
            <span>{loading ? 'Securing Connection...' : 'Secure Log In'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have a library account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Sign Up Now
            </button>
          </p>
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
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Student specific enrollment fields
  const [studentId, setStudentId] = useState('');
  const [major, setMajor] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  // Teacher specific enrollment fields
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState('');
  const [officeNumber, setOfficeNumber] = useState('');
  const [designation, setDesignation] = useState('');

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

    // Role-specific validation
    if (role === 'student' && !studentId) {
      setErr('Student ID is required for student enrollment.');
      return;
    }
    if (role === 'teacher' && !teacherId) {
      setErr('Teacher/Employee ID is required for teacher enrollment.');
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
        role,
        ...(role === 'student' ? { studentId, major, gradeLevel } : { teacherId, department, officeNumber, designation })
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
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Member Enrollment</h2>
          <p className="text-slate-400 text-xs">Create your professional campus library passport</p>
        </div>

        {/* Role Selection Tab */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setRole('student'); setErr(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              role === 'student'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('teacher'); setErr(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              role === 'teacher'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Teacher</span>
          </button>
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
                placeholder={role === 'student' ? 'student@campus.edu' : 'teacher@campus.edu'}
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

          {/* Conditional Student Fields */}
          {role === 'student' && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3.5">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student Academic Enrollment</span>
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Student ID / Matric Code *</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm outline-none"
                  placeholder="STU-2026-9481"
                  required={role === 'student'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Major / Subject</label>
                  <input
                    type="text"
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none"
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Grade Level / Term</label>
                  <select
                    value={gradeLevel}
                    onChange={e => setGradeLevel(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-2 py-2 text-xs outline-none"
                  >
                    <option value="">Select level...</option>
                    <option value="Freshman">Freshman (Yr 1)</option>
                    <option value="Sophomore">Sophomore (Yr 2)</option>
                    <option value="Junior">Junior (Yr 3)</option>
                    <option value="Senior">Senior (Yr 4)</option>
                    <option value="Graduate">Graduate (MSc/PhD)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Teacher Fields */}
          {role === 'teacher' && (
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-3.5">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Award className="h-3.5 w-3.5" />
                <span>Faculty/Staff Credentials</span>
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Employee ID / Teacher Code *</label>
                <input
                  type="text"
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm outline-none"
                  placeholder="FAC-9912-2026"
                  required={role === 'teacher'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none"
                    placeholder="Engineering"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Academic Title</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none"
                    placeholder="Assistant Professor"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Office Location / Desk Number</label>
                <input
                  type="text"
                  value={officeNumber}
                  onChange={e => setOfficeNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm outline-none"
                  placeholder="Tech Annex, Room 404"
                />
              </div>
            </div>
          )}

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
            <span>{loading ? 'Creating Passport...' : 'Enroll Account'}</span>
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
