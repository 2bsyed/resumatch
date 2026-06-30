'use client';

import React from 'react';
import PulseBar from '../components/ui/PulseBar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] relative flex items-center justify-center p-8 select-none">
      {/* 1. Signature PulseBar at top-0 */}
      <PulseBar isActive={true} />

      {/* 2. Centered spinner */}
      <div className="flex flex-col items-center gap-4 text-center">
        <svg className="animate-spin h-10 w-10 text-clinical-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="font-mono text-label-mono text-[#9CA3AF] uppercase text-[11px] tracking-wider animate-pulse">
          Loading Page Resources...
        </span>
      </div>
    </div>
  );
}
