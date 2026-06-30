'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-on-surface flex flex-col items-center justify-center p-8 select-none">
      <div className="w-full max-w-[500px] bg-[#111827] border border-[#1F2937] rounded-xl p-10 text-center space-y-6 shadow-2xl relative">
        <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-clinical-primary to-[#4F8EF7]/40 rounded-t-xl"></div>
        
        <div className="w-16 h-16 rounded-full bg-clinical-primary/15 border border-clinical-primary/30 flex items-center justify-center mx-auto text-clinical-primary select-none">
          <span className="material-symbols-outlined text-3xl">route</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-white font-heading">Page Not Found</h1>
          <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-sm mx-auto">
            The page you are looking for does not exist, or has been moved to a new URL path.
          </p>
        </div>

        <div className="pt-2">
          <a 
            href="/"
            className="w-full py-3 bg-clinical-primary text-[#001a40] font-mono text-label-mono font-bold uppercase rounded-[6px] hover:brightness-110 shadow-lg cursor-pointer transition-all text-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
