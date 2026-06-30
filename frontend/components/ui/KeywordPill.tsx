import React from 'react';

interface KeywordPillProps {
  keyword: string;
  isMatched?: boolean;
  className?: string;
}

export default function KeywordPill({ keyword, isMatched, className = '' }: KeywordPillProps) {
  return (
    <div
      className={`
        inline-flex 
        items-center 
        justify-center 
        font-mono 
        text-[11px] 
        px-2.5 
        py-1 
        rounded-[4px] 
        transition-all 
        duration-200
        border
        ${
          isMatched
            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 glow-success'
            : 'bg-brand-chipBg text-brand-chipText border-brand-level1Border/40'
        }
        ${className}
      `}
    >
      {isMatched && (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {!isMatched && (
        <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5 animate-pulse"></span>
      )}
      {keyword}
    </div>
  );
}
