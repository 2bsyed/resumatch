'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';

// Form validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
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

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // Email confirmation is disabled, user is logged in immediately
        router.push('/dashboard');
      } else {
        // Email confirmation is enabled
        setSuccessMsg('Check your email to confirm your account');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-background text-on-surface">
      {/* Left Panel (55%) */}
      <div className="w-full md:w-[55%] bg-surface flex flex-col p-10 lg:p-20 relative overflow-hidden min-h-[300px] md:min-h-screen justify-center">
        {/* Brand Logo */}
        <div className="absolute top-10 left-10 lg:left-20">
          <span className="font-heading font-extrabold text-headline-h3 text-brand-primary tracking-tight">
            ResuMatch
          </span>
        </div>

        {/* Centered Content Wrapper */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto relative z-10 w-full mt-16 md:mt-0">
          {/* Timeline Visualization */}
          <div className="relative pl-8 border-l-2 border-dashed border-outline-variant space-y-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-brand-primary ring-4 ring-surface shadow-[0_0_8px_rgba(79,142,247,0.5)]"></div>
              <h3 className="font-sans text-body-base text-white font-medium mb-1">Upload your master CV</h3>
              <p className="font-sans text-body-small text-[#9CA3AF]">We parse your skills into a structured profile</p>
            </div>
            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-brand-primary ring-4 ring-surface shadow-[0_0_8px_rgba(79,142,247,0.5)]"></div>
              <h3 className="font-sans text-body-base text-white font-medium mb-1">Paste any job description</h3>
              <p className="font-sans text-body-small text-[#9CA3AF]">We extract the exact keywords bots look for</p>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#10B981] ring-4 ring-surface shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
              <h3 className="font-sans text-body-base text-white font-medium mb-1">Download your tailored CV + ATS score</h3>
              <p className="font-sans text-body-small text-[#9CA3AF]">Pass through every filter with confidence</p>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-16 text-[#4B5563] font-mono text-data-mono text-xs">
            Takes ~3 minutes the first time.
          </div>
        </div>

        {/* Ambient Background Glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-0"></div>
      </div>

      {/* Right Panel (45%) */}
      <div className="w-full md:w-[45%] bg-[#111827] flex flex-col justify-center p-6 md:p-10 border-l border-outline-variant shadow-[-8px_0_24px_rgba(0,0,0,0.2)] min-h-screen">
        <div className="max-w-[400px] w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading font-extrabold text-headline-h2 text-white mb-2">Create your free account</h1>
            <p className="font-mono text-data-mono text-brand-secondary">No credit card. No trial period. Free forever.</p>
          </div>

          {successMsg ? (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-[4px] p-6 text-center flex flex-col items-center gap-4 glow-success">
              <svg className="w-12 h-12 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-white font-semibold text-sm">Verify your Email</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {successMsg}. Please check your inbox and click the verification link to proceed.
              </p>
              <Link href="/login" className="w-full mt-2">
                <Button variant="primary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* OAuth */}
              <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-brand-input-bg border border-brand-input-border rounded-[6px] flex items-center justify-center gap-3 text-white font-sans text-sm hover:bg-surface-variant transition-colors duration-200 mb-6 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-outline-variant flex-1"></div>
                <span className="font-sans text-body-small text-on-surface-variant uppercase tracking-wider">or</span>
                <div className="h-px bg-outline-variant flex-1"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-sans text-body-small text-on-surface-variant block" htmlFor="fullName">
                    Full name
                  </label>
                  <input 
                    {...register('fullName')}
                    className="w-full h-11 bg-brand-input-bg border border-brand-input-border rounded-[6px] px-4 text-white placeholder-outline focus:border-brand-primary focus:ring-0 transition-colors font-sans text-sm" 
                    id="fullName" 
                    placeholder="Alex Chen" 
                    type="text"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-error font-mono mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-sans text-body-small text-on-surface-variant block" htmlFor="email">
                    Email
                  </label>
                  <input 
                    {...register('email')}
                    className="w-full h-11 bg-brand-input-bg border border-brand-input-border rounded-[6px] px-4 text-white placeholder-outline focus:border-brand-primary focus:ring-0 transition-colors font-sans text-sm" 
                    id="email" 
                    placeholder="you@example.com" 
                    type="email"
                  />
                  {errors.email && (
                    <p className="text-xs text-error font-mono mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-sans text-body-small text-on-surface-variant block" htmlFor="password">
                    Create password
                  </label>
                  <div className="relative">
                    <input 
                      {...register('password')}
                      className="w-full h-11 bg-brand-input-bg border border-brand-input-border rounded-[6px] pl-4 pr-10 text-white placeholder-outline focus:border-brand-primary focus:ring-0 transition-colors font-sans text-sm" 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-white transition-colors cursor-pointer" 
                      type="button"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-[#4B5563] mt-1">Min. 8 characters</p>
                  {errors.password && (
                    <p className="text-xs text-error font-mono mt-1">{errors.password.message}</p>
                  )}
                </div>

                {errorMsg && (
                  <div className="text-xs text-error font-mono leading-normal bg-error/5 p-3 rounded border border-error/20">
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button 
                  className="w-full h-12 bg-brand-primary hover:brightness-110 hover:shadow-glow text-[#0A0E1A] rounded-[6px] font-mono text-label-mono font-bold uppercase tracking-widest transition-all duration-300 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50" 
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
                      Create Free Account
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-4">
                <p className="font-sans text-body-small text-on-surface-variant">
                  By signing up you agree to our{' '}
                  <a className="text-brand-primary hover:underline transition-all" href="#">Terms</a> and{' '}
                  <a className="text-brand-primary hover:underline transition-all" href="#">Privacy Policy</a>
                </p>
                <p className="font-sans text-body-small text-on-surface-variant">
                  Already have an account?{' '}
                  <Link className="text-brand-primary hover:underline font-medium transition-all" href="/login">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
