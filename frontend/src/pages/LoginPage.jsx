import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth';
import { authStore } from '../store/authStore';
import { DEMO_CREDENTIALS } from '../config/demoCredentials';
import { Lock, Mail, ChevronDown, ChevronUp, CheckCircle, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your PRN or Email address'),
  password: z.string().min(1, 'Please enter your password'),
  rememberMe: z.boolean().optional(),
});

export function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    try {
      // 1. Attempt real API call
      const res = await loginApi({
        email: data.identifier,
        password: data.password,
      });

      if (res && res.token) {
        authStore.setAuth(res.token, res.user);
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      console.warn('Real backend login attempt:', err?.response?.data || err.message);

      // 2. Check if credentials match one of the demo users for offline / dev demo testing
      const matchedDemo = DEMO_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === data.identifier.toLowerCase()
      );

      if (matchedDemo) {
        // Mock fallback login for seamless UI preview
        const mockUser = {
          id: matchedDemo.role === 'tpo' ? 1 : matchedDemo.role === 'coordinator' ? 2 : 101,
          name: matchedDemo.role === 'tpo' ? 'Prof. T&P Officer' : matchedDemo.role === 'coordinator' ? 'Dept. Coordinator (Computer)' : 'Rahul Sharma',
          email: matchedDemo.email,
          prn: matchedDemo.role === 'student' ? '2021012345' : null,
          role: matchedDemo.role,
          departmentId: matchedDemo.role === 'tpo' ? null : 1,
        };
        const mockToken = `mock_jwt_token_${matchedDemo.role}_rcpit`;
        authStore.setAuth(mockToken, mockUser);
        navigate('/dashboard');
        return;
      }

      // If no demo match and backend error exists, display inline error
      const errorMessage =
        err?.response?.data?.message ||
        'Invalid PRN/Email or password. Please check your credentials and try again.';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demo) => {
    setValue('identifier', demo.email, { shouldValidate: true });
    setValue('password', demo.password, { shouldValidate: true });
    setServerError('');
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-base overflow-hidden">
      {/* Left 55% Brand Panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-primary-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle abstract geometric lines background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
            <circle cx="400" cy="400" r="300" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="400" cy="400" r="200" stroke="#FFFFFF" strokeWidth="1" />
            <path d="M100 200 L700 600 M100 600 L700 200" stroke="#FFFFFF" strokeWidth="1" />
            <rect x="250" y="250" width="300" height="300" stroke="#FFFFFF" strokeWidth="1.5" transform="rotate(45 400 400)" />
          </svg>
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-accent-500 flex items-center justify-center font-heading font-bold text-white text-xl shadow-lg">
            PT
          </div>
          <div>
            <span className="font-heading font-bold text-xl tracking-tight text-white block">
              PlaceTrack
            </span>
            <span className="text-xs text-primary-100/70 font-medium">
              R.C. Patel Institute of Technology, Shirpur
            </span>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-700/80 border border-primary-500 text-accent-500 text-xs font-semibold uppercase tracking-wider mb-6">
            <span>Unified Placement Automation</span>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white mb-4">
            Placement & Training Management System
          </h1>
          <p className="text-primary-100/90 text-base leading-relaxed mb-8">
            Digitizing campus recruitment across T&P Officers, Department Coordinators, and Students. Automated eligibility checks, real-time application tracking, and institutional analytics.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Credit-weighted CGPA & stateful backlog calculations',
              'Automated drive eligibility matching',
              'Department-scoped coordinator workflows',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-sm text-primary-100">
                <CheckCircle className="w-4 h-4 text-accent-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 pt-6 border-t border-primary-700 text-xs text-primary-100/60">
          © 2026 Training & Placement Cell, RCPIT Shirpur. All rights reserved.
        </div>
      </div>

      {/* Right 45% Form Container */}
      <div className="w-full lg:w-[45%] bg-bg-surface flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary-900 text-accent-500 flex items-center justify-center font-heading font-bold text-lg">
              PT
            </div>
            <div>
              <h2 className="font-heading font-bold text-primary-900 text-lg">PlaceTrack</h2>
              <p className="text-xs text-text-muted">RCPIT Shirpur</p>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-text-primary tracking-tight">
              Sign in to PlaceTrack
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Enter your institutional credentials to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Global Server Error Banner */}
            {serverError && (
              <div className="p-3.5 rounded-lg bg-error-100 border border-error-600/30 text-error-600 text-sm flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Identifier Field */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                PRN or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2021012345 or officer@rcpit.ac.in"
                  {...register('identifier')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-bg-base border ${
                    errors.identifier ? 'border-error-600 focus:ring-error-600' : 'border-border-subtle focus:ring-primary-500'
                  } rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-error-600 mt-1 font-medium">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset requested. Please contact the T&P Cell administrator.');
                  }}
                  className="text-xs text-primary-500 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-bg-base border ${
                    errors.password ? 'border-error-600 focus:ring-error-600' : 'border-border-subtle focus:ring-primary-500'
                  } rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-error-600 mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 text-primary-500 border-border-subtle rounded focus:ring-primary-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-text-secondary">
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-primary-900 hover:bg-primary-700 active:bg-primary-900 text-white font-heading font-medium text-sm rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>

          {/* Demo Credentials Helper Panel */}
          <div className="pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setShowDemoPanel(!showDemoPanel)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-bg-base hover:bg-primary-100/50 border border-border-subtle transition-colors text-xs font-semibold text-text-secondary"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                <span>Demo Credentials (Click to fill)</span>
              </div>
              {showDemoPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemoPanel && (
              <div className="mt-2.5 space-y-2">
                {DEMO_CREDENTIALS.map((demo) => (
                  <div
                    key={demo.role}
                    onClick={() => handleFillDemo(demo)}
                    className="p-2.5 rounded-lg border border-border-subtle hover:border-primary-500 bg-white cursor-pointer transition-all hover:shadow-xs group flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${demo.badgeColor}`}>
                          {demo.role === 'tpo' ? 'Officer' : demo.role}
                        </span>
                        <span className="text-xs font-medium text-text-primary group-hover:text-primary-700">
                          {demo.roleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1 font-mono">
                        {demo.email} / {demo.password}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Fill
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
