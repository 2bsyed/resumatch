'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabase';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google authentication failed.');
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#0A0E1A]">
      {/* Left Panel (55%) */}
      <div className="hidden md:flex flex-col w-[55%] bg-level-0 relative p-10 lg:p-20 justify-center min-h-screen">
        {/* Logo */}
        <div className="absolute top-10 left-10 lg:left-20 flex items-center gap-2">
          {/* Work icon */}
          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-8-2h4v2h-4V4zm8 15H4V8h16v11z"/>
          </svg>
          <span className="font-heading font-extrabold text-headline-h3 text-primary tracking-tight">
            ResuMatch
          </span>
        </div>

        <div className="max-w-xl">
          {/* Quote Block */}
          <blockquote className="border-l-[3px] border-primary pl-6 py-2 mb-12 relative">
            <p className="font-heading font-bold text-headline-h2 text-on-surface mb-6 leading-tight">
              "I went from 3% to 78% interview rate after tailoring each application."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-level-2 border border-brand-border overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCEtRsjEj2uYdsik1WQ4RdeJg5gFn6N6_HbqNuKjkXlmhI9vBSSCUIRXHPSw_r_V78zSETwg99Ht4DbbAdWh8an_tyvBXnf4GUKoy6q_ODky85gda3_cMstapa9Dd8bt8x8X_H6_-APv1JZ0ZDl6jlW7Y0RVFWwofjrseqaW964DF3o96aThC7BREuAd_zZEEcoZCD_scGcdLySY_cKrqhVK4VgEdP9CzTWtcNJbeBR72fCvb5EbwazqaK9CusN6t3_GYBu5tGR4A')" }}
                ></div>
              </div>
              <div>
                <div className="font-sans font-semibold text-body-base text-on-surface">Priya S.</div>
                <div className="font-sans text-body-small text-on-surface-variant">Product Manager at Stripe</div>
              </div>
            </footer>
          </blockquote>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-level-2 border border-brand-border rounded px-4 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span className="font-mono text-data-mono text-on-surface">4,200+ users</span>
            </div>
            <div className="bg-level-2 border border-brand-border rounded px-4 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              <span className="font-mono text-data-mono text-on-surface">87% avg ATS score</span>
            </div>
            <div className="bg-level-2 border border-brand-border rounded px-4 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-mono text-data-mono text-on-surface">Free forever</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (45%) */}
      <div className="w-full md:w-[45%] bg-level-1 flex flex-col justify-center items-center min-h-screen relative p-6 border-l border-brand-border">
        {/* Mobile Logo (Hidden on desktop) */}
        <div className="absolute top-6 left-6 flex md:hidden items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-8-2h4v2h-4V4zm8 15H4V8h16v11z"/>
          </svg>
          <span className="font-heading font-extrabold text-headline-h3 text-primary tracking-tight text-xl">
            ResuMatch
          </span>
        </div>

        <div className="w-full max-w-[380px] mt-12 md:mt-0">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="font-heading font-bold text-headline-h2 text-white mb-2">Welcome back</h1>
            <p className="font-sans text-body-base text-on-surface-variant">Sign in to continue tailoring your resume.</p>
          </div>

          {/* Social Auth */}
          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            className="w-full bg-level-2 border border-brand-border hover:border-brand-border-hover text-on-surface font-sans text-body-base font-medium py-3 px-4 rounded-[6px] transition-colors flex items-center justify-center gap-3 mb-6 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.72 17.59V20.35H19.28C21.36 18.43 22.56 15.61 22.56 12.25Z" fill="#4285F4"></path>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.35L15.72 17.59C14.74 18.25 13.48 18.64 12 18.64C9.13 18.64 6.7 16.71 5.81 14.12H2.13V16.98C3.95 20.61 7.7 23 12 23Z" fill="#34A853"></path>
              <path d="M5.81 14.12C5.58 13.45 5.45 12.74 5.45 12C5.45 11.26 5.58 10.55 5.81 9.88V7.02H2.13C1.38 8.52 0.95 10.21 0.95 12C0.95 13.79 1.38 15.48 2.13 16.98L5.81 14.12Z" fill="#FBBC05"></path>
              <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.03L19.36 3.87C17.46 2.1 14.97 1 12 1C7.7 1 3.95 3.39 2.13 7.02L5.81 9.88C6.7 7.29 9.13 5.38 12 5.38Z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex py-5 items-center mb-6">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink-0 mx-4 font-mono text-label-mono text-outline uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-brand-border"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-mono text-label-mono text-on-surface-variant uppercase mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input 
                {...register('email')}
                className="w-full bg-[#0F1623] border border-brand-border rounded-[4px] px-4 py-2.5 text-on-surface font-sans text-body-base focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
                id="email" 
                placeholder="name@company.com" 
                type="email"
              />
              {errors.email && (
                <p className="text-xs text-error font-mono mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-mono text-label-mono text-on-surface-variant uppercase" htmlFor="password">
                  Password
                </label>
                <Link className="font-sans text-body-small text-primary hover:text-primary-fixed transition-colors" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  {...register('password')}
                  className="w-full bg-[#0F1623] border border-brand-border rounded-[4px] pl-4 pr-10 py-2.5 text-on-surface font-sans text-body-base focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer" 
                  onClick={() => setShowPassword(!showPassword)} 
                  type="button"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error font-mono mt-1">{errors.password.message}</p>
              )}
            </div>

            {errorMsg && (
              <div className="text-xs text-error font-mono leading-normal bg-error/5 p-3 rounded border border-error/20">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button 
              className="w-full bg-primary hover:brightness-110 hover:shadow-glow text-[#0A0E1A] font-mono text-label-mono font-bold uppercase tracking-widest py-3 px-4 rounded-[6px] transition-all mt-2 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-brand-bg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="font-sans text-body-small text-on-surface-variant">
              Don't have an account?{' '}
              <Link className="text-primary hover:text-primary-fixed transition-colors font-medium hover:underline" href="/register">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-1.5 text-outline">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Protected by Supabase Auth. Your data is never sold.
          </span>
        </div>
      </div>
    </div>
  );
}
