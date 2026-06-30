'use client';

import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-on-surface flex flex-col items-center justify-center p-8 select-none">
      <div className="w-full max-w-[500px] bg-[#111827] border border-[#1F2937] rounded-xl p-10 text-center space-y-6 shadow-2xl relative">
        <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-error to-[#EF4444]/40 rounded-t-xl"></div>
        
        <div className="w-16 h-16 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto text-error select-none">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-white font-heading">Something went wrong</h1>
          <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred during page rendering. Our logs have been updated.
          </p>
        </div>

        {error.message && (
          <p className="font-mono text-xs text-error bg-error/5 p-3 rounded border border-error/10 leading-relaxed text-left max-h-[120px] overflow-y-auto custom-scrollbar select-all">
            Error: {error.message}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={() => reset()}
            className="w-full py-3 bg-[#4F8EF7] text-[#001a40] font-mono text-label-mono font-bold uppercase rounded-[6px] hover:brightness-110 shadow-lg cursor-pointer transition-all text-xs"
          >
            Try Again
          </button>
          <a 
            href="/"
            className="font-mono text-label-mono text-[#9CA3AF] hover:text-white uppercase transition-colors text-center text-[11px] hover:underline"
          >
            Return to Landing Page
          </a>
        </div>
      </div>
    </div>
  );
}
