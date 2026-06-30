'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '../../../../lib/api';

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const urlTailorId = searchParams.get('tailorId');

  const [status, setStatus] = useState<string>('queued');
  const [progressStep, setProgressStep] = useState<number>(1);
  const [progressTotal, setProgressTotal] = useState<number>(4);
  const [tailoredCvId, setTailoredCvId] = useState<string | null>(urlTailorId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollJobStatus = async () => {
      try {
        const data = await apiGet<{
          status: string;
          progressStep: number;
          progressTotal: number;
          tailoredCvId: string | null;
          error: string | null;
        }>(`/tailor/status/${jobId}`);

        setStatus(data.status);
        setProgressStep(data.progressStep || 1);
        setProgressTotal(data.progressTotal || 4);
        
        if (data.tailoredCvId) {
          setTailoredCvId(data.tailoredCvId);
        }

        if (data.status === 'complete') {
          // Clear poll and redirect after 1.5s success visual delay
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          
          const finalId = data.tailoredCvId || urlTailorId;
          setTimeout(() => {
            router.push(`/results/${finalId}`);
          }, 1500);
        } else if (data.status === 'error' || data.status === 'failed') {
          setErrorMessage(data.error || 'Unknown optimization pipeline error.');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        // Do not fail immediately on a network lookup transient failure, keep polling
      }
    };

    // Initial check
    pollJobStatus();

    // Set polling interval
    pollIntervalRef.current = setInterval(pollJobStatus, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [jobId, router, urlTailorId]);

  const steps = [
    'Reading your master CV',
    'Analyzing job description & extracting keywords',
    'Calculating ATS gap & scoring your profile',
    'Rewriting bullets to match job keywords',
  ];

  const percentage = Math.round((progressStep / progressTotal) * 100);
  
  // Custom estimated seconds calculation (approx 6 seconds per remaining step)
  const remainingSeconds = Math.max(5, (progressTotal - progressStep) * 6);

  const isComplete = status === 'complete';
  const isFailed = status === 'error' || status === 'failed';

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center p-8 z-10 relative">
      {/* 1. Signature PulseBar: absolute top-0, only visible while processing */}
      {!isComplete && !isFailed && (
        <div className="h-1 w-full bg-gradient-to-r from-[#4F8EF7] via-[#10B981] to-[#4F8EF7] animate-gradient-x z-25 absolute top-0 left-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      )}

      {/* 2. Center Card Container */}
      <div className="w-full max-w-[560px] bg-[#111827]/90 backdrop-blur-sm border border-[#1F2937] rounded-xl p-12 shadow-2xl flex flex-col items-center select-none">
        
        {isFailed ? (
          /* Error State UI */
          <div className="w-full text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto text-error select-none">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-white mb-2">Optimization failed</h1>
              <p className="text-sm text-error font-mono bg-error/5 p-4 rounded border border-error/10 leading-relaxed text-left">
                {errorMessage || 'Something went wrong during tailoring process.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={() => router.push('/tailor')}
                className="w-full btn-primary h-12 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                Try Again
              </button>
              <Link 
                href="#"
                className="font-mono text-label-mono text-[#9CA3AF] hover:text-white uppercase transition-colors text-center text-[11px]"
              >
                Contact Support
              </Link>
            </div>
          </div>
        ) : isComplete ? (
          /* Success Redirect State UI */
          <div className="w-full text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mx-auto text-secondary shadow-[0_0_15px_rgba(78,222,163,0.4)] animate-pulse">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-white mb-2">Tailored CV is ready!</h1>
              <p className="text-sm text-[#9CA3AF]">
                Calculations complete. Redirecting you to matching dashboard results...
              </p>
            </div>
            <div className="pt-2">
              <svg className="animate-spin h-5 w-5 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        ) : (
          /* Active Processing List UI */
          <>
            {/* Animated Logo Icon */}
            <div className="w-16 h-16 rounded-full bg-[#1C2333] border border-[#374151] flex items-center justify-center mb-6 pulse-glow text-[#4F8EF7]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                work
              </span>
            </div>

            {/* Header text */}
            <h1 className="text-[24px] font-bold text-white mb-2 text-center">
              Tailoring your resume...
            </h1>
            <p className="text-[14px] text-[#9CA3AF] text-center mb-10 leading-relaxed max-w-[400px]">
              Our AI is reading the job description, comparing it to your CV, and rewriting your bullets to match.
            </p>

            {/* Steps Timeline Grid */}
            <div className="w-full space-y-5 mb-10">
              {steps.map((label, index) => {
                const stepNum = index + 1;
                const isStepCompleted = progressStep > stepNum;
                const isStepActive = progressStep === stepNum;
                
                return (
                  <div key={stepNum} className="flex items-center gap-4 animate-fade-in">
                    {isStepCompleted ? (
                      /* Completed step check icon */
                      <div className="w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 text-secondary border border-secondary/20">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                    ) : isStepActive ? (
                      /* Active spinner icon */
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#4F8EF7] text-[20px] animate-spin-slow">
                          progress_activity
                        </span>
                      </div>
                    ) : (
                      /* Queued empty step dot */
                      <div className="w-6 h-6 rounded-full border border-[#374151] flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#374151]"></div>
                      </div>
                    )}
                    
                    <span 
                      className={`text-sm transition-colors duration-300 ${
                        isStepActive 
                          ? 'font-semibold text-[#4F8EF7]' 
                          : isStepCompleted 
                            ? 'text-on-surface opacity-90' 
                            : 'text-[#9CA3AF]'
                      }`}
                    >
                      {label}{isStepActive ? '...' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Shimmering Progress Bar */}
            <div className="w-full mb-3">
              <div className="h-2 w-full bg-[#1C2333] rounded-full overflow-hidden border border-[#374151]">
                <div 
                  className="h-full bg-[#4F8EF7] rounded-full shimmer shadow-[0_0_8px_rgba(79,142,247,0.4)] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Timer countdown summary */}
            <div className="w-full flex justify-end mb-8 font-mono text-[11px] text-[#9CA3AF] tracking-wider">
              Estimated time remaining: ~{remainingSeconds} seconds
            </div>

            {/* Footer Quote */}
            <div className="w-full pt-6 border-t border-[#1F2937] text-center">
              <p className="text-[13px] text-[#4B5563] italic leading-relaxed">
                "Tip: ATS systems reject up to 75% of resumes before a human ever reads them."
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
