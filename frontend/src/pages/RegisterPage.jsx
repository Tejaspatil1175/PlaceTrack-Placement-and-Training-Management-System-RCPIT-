import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/auth';
import { authStore } from '../store/authStore';
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name is required (min 2 characters)'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
    prn: z.string().min(5, 'PRN must be at least 5 characters'),
    phone: z.string().optional(),
    branch: z.string().min(1, 'Please select your engineering department'),
    division: z.string().min(1, 'Division is required'),
    admissionYear: z
      .preprocess((val) => Number(val), z.number().min(2018).max(2030)),
    currentSemester: z
      .preprocess((val) => Number(val), z.number().min(1).max(8)),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Telecommunication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      prn: '',
      phone: '',
      branch: 'Computer Engineering',
      division: 'A',
      admissionYear: 2024,
      currentSemester: 5,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        prn: data.prn,
        phone: data.phone || null,
        branch: data.branch,
        division: data.division,
        admissionYear: Number(data.admissionYear),
        currentSemester: Number(data.currentSemester),
      });

      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user;

      if (token && user) {
        setSuccessMessage('Registration successful! Redirecting to dashboard...');
        authStore.setAuth(token, user);
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setSuccessMessage('Account registered successfully! Please sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    } catch (err) {
      console.error('Registration error:', err?.response?.data || err.message);
      const message =
        err?.response?.data?.message ||
        'Registration failed. Please check your information and try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-base overflow-hidden">
      {/* Left 45% Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
            <circle cx="400" cy="400" r="300" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="400" cy="400" r="180" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M100 400H700M400 100V700" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center text-accent-400 font-bold text-lg">
              PT
            </div>
            <div>
              <span className="text-xl font-heading font-bold tracking-tight text-white block">
                PlaceTrack
              </span>
              <span className="text-[11px] text-primary-200 tracking-wider uppercase block">
                RCPIT Shirpur
              </span>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <h1 className="text-3xl font-heading font-bold text-white leading-tight">
              Join RCPIT Placement & Training Portal
            </h1>
            <p className="text-sm text-primary-200 leading-relaxed">
              Create your official student account to explore campus recruitment drives, submit resumes, and track recruitment rounds in real time.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-4 max-w-sm my-6">
          <div className="flex items-start space-x-3 text-xs text-primary-100">
            <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
            <span>Automated CGPA verification & placement eligibility matching</span>
          </div>
          <div className="flex items-start space-x-3 text-xs text-primary-100">
            <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
            <span>Direct application tracking from shortlisting to final offer</span>
          </div>
          <div className="flex items-start space-x-3 text-xs text-primary-100">
            <GraduationCap className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
            <span>Complete academic transcript history across all 8 semesters</span>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-primary-300">
          &copy; 2026 R.C. Patel Institute of Technology, Shirpur. Training & Placement Cell.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-border-subtle p-8 my-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Student Registration
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 font-medium">
                Undergraduate
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Fill in your academic and personal details to register for campus placements.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {serverError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name & PRN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Patil"
                    {...register('name')}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border-subtle focus:ring-primary-500'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Permanent Reg. No. (PRN) *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="e.g. 2021012345"
                    {...register('prn')}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                      errors.prn ? 'border-red-500 focus:ring-red-500' : 'border-border-subtle focus:ring-primary-500'
                    }`}
                  />
                </div>
                {errors.prn && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.prn.message}</p>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  College / Personal Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    placeholder="student@rcpit.ac.in"
                    {...register('email')}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border-subtle focus:ring-primary-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    {...register('phone')}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Branch / Department */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Department / Branch *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                <select
                  {...register('branch')}
                  className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                    errors.branch ? 'border-red-500 focus:ring-red-500' : 'border-border-subtle focus:ring-primary-500'
                  }`}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Division, Admission Year, Semester */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Division *
                </label>
                <select
                  {...register('division')}
                  className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                >
                  <option value="A">Div A</option>
                  <option value="B">Div B</option>
                  <option value="C">Div C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Admission Year *
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  {...register('admissionYear')}
                  className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Current Sem *
                </label>
                <select
                  {...register('currentSemester')}
                  className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    {...register('password')}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-border-subtle focus:ring-primary-500'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    {...register('confirmPassword')}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-border-subtle focus:ring-primary-500'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-primary-900 hover:bg-primary-700 active:bg-primary-900 text-white font-heading font-medium text-sm rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Registering student account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center pt-2 border-t border-border-subtle">
              <p className="text-xs text-text-secondary">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
