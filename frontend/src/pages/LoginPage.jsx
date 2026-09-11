import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth';
import { authStore } from '../store/authStore';
import { DEMO_CREDENTIALS } from '../config/demoCredentials';
import { Lock, Mail, ChevronDown, ChevronUp, CheckCircle, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

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
    <div className="h-screen w-full flex items-center justify-center bg-[#F5F0E6] p-3 sm:p-6 overflow-hidden antialiased font-sans select-none">
      {/* Ultra-Compact Viewport-Covered Portal Card */}
      <div className="w-full max-w-3xl bg-white border-2 border-zinc-800 rounded-2xl shadow-xl overflow-hidden my-auto card-pop">
        {/* Compact Header Ribbon */}
        <div className="bg-[#FAF8F5] border-b-2 border-zinc-800 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center font-heading font-extrabold text-white text-lg border border-zinc-800 shadow-xs shrink-0">
              PT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-heading font-extrabold text-lg text-zinc-900 tracking-tight leading-none">
                  PlaceTrack
                </h1>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border bg-white border-zinc-700 text-zinc-900">
                  RCPIT Shirpur
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 font-bold mt-0.5">
                Placement & Training Management System
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-bold text-zinc-800 bg-white border border-zinc-700 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Single Sign-On</span>
          </div>
        </div>

        {/* Compact Body Grid (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Feature Column (5 cols) */}
          <div className="md:col-span-5 bg-[#FAF8F5] border-b-2 md:border-b-0 md:border-r-2 border-zinc-800 p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <span className="inline-flex items-center space-x-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-900 bg-[#F5F0E6] border border-zinc-700 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Unified Access</span>
              </span>

              <h2 className="font-heading text-base font-extrabold text-zinc-900 leading-tight">
                Automated Placement Portal
              </h2>

              <p className="text-[11px] text-zinc-600 font-medium leading-normal">
                Single access point for T&P Officers, Department Coordinators, and Students.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  'Credit-weighted CGPA calculations',
                  'Automated drive eligibility matching',
                  'Department-scoped tracking',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-[11px] text-zinc-800 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-300 text-[10px] text-zinc-500 font-bold">
              RCPIT Shirpur • Maharashtra
            </div>
          </div>

          {/* Right Form Column (7 cols) */}
          <div className="md:col-span-7 bg-white p-4 sm:p-5 space-y-3">
            <div>
              <h3 className="font-heading text-base font-extrabold text-zinc-900 tracking-tight">
                Sign in to your account
              </h3>
              <p className="text-zinc-600 text-[11px] font-semibold">
                Enter your PRN or institutional email credentials.
              </p>
            </div>

            {/* Compact Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {serverError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-[11px] flex items-center space-x-2 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span className="truncate">{serverError}</span>
                </div>
              )}

              {/* Identifier Field */}
              <div>
                <label className="block text-[10px] font-extrabold text-zinc-900 uppercase tracking-wider mb-1">
                  PRN or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="2021012345 or officer@rcpit.ac.in"
                    {...register('identifier')}
                    className={`w-full pl-8 pr-3 py-1.5 bg-white border ${
                      errors.identifier ? 'border-rose-600' : 'border-zinc-700 focus:ring-zinc-800'
                    } rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 font-bold focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-[10px] text-rose-700 mt-0.5 font-bold">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-extrabold text-zinc-900 uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset requested. Please contact the T&P Cell administrator.');
                    }}
                    className="text-[10px] text-zinc-800 hover:underline font-bold"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full pl-8 pr-3 py-1.5 bg-white border ${
                      errors.password ? 'border-rose-600' : 'border-zinc-700 focus:ring-zinc-800'
                    } rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 font-bold focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-700 mt-0.5 font-bold">
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
                  className="w-3.5 h-3.5 text-zinc-900 border-zinc-700 rounded focus:ring-zinc-800"
                />
                <label htmlFor="rememberMe" className="ml-2 text-[11px] font-bold text-zinc-700">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-900 text-white font-heading font-extrabold text-xs rounded-lg shadow-sm border border-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-800 disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? <span>Authenticating...</span> : <span>Sign in to Portal</span>}
              </button>
            </form>

            {/* Compact Demo Logins */}
            <div className="pt-2 border-t border-zinc-300">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-zinc-900 uppercase tracking-wider">
                  Quick Demo Logins (Click to Fill)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {DEMO_CREDENTIALS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleFillDemo(demo)}
                    className="p-1.5 rounded-lg border border-zinc-700 hover:border-zinc-900 bg-[#FAF8F5] hover:bg-[#F5F0E6] text-center transition-all text-[10px] font-extrabold text-zinc-900 truncate"
                    title={demo.email}
                  >
                    {demo.role === 'tpo' ? 'Officer' : demo.role === 'coordinator' ? 'Coordinator' : 'Student'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
