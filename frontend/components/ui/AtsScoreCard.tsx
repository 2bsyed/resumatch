import React from 'react';
import Card from './Card';

interface AtsScoreCardProps {
  originalScore: number;
  tailoredScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function AtsScoreCard({ originalScore, tailoredScore, size = 'md' }: AtsScoreCardProps) {
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-[#10B981]'; // Success green
    if (score >= 60) return 'text-tertiary'; // Warning orange
    return 'text-error'; // Error red
  };

  const delta = tailoredScore !== undefined ? tailoredScore - originalScore : 0;

  return (
    <Card level={2} className="p-6 flex flex-col items-center justify-center text-center">
      <h3 className="label-mono text-xs text-on-surface-variant mb-4 uppercase tracking-wider">
        ATS Match Score Analysis
      </h3>

      {tailoredScore !== undefined ? (
        <div className="flex items-center gap-8 w-full justify-around">
          {/* Original Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-on-surface-variant/70 mb-1">
              Original
            </span>
            <div className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-on-surface-variant">
              {originalScore}%
            </div>
          </div>

          {/* Delta Arrow */}
          <div className="flex flex-col items-center justify-center">
            <svg className="w-6 h-6 text-brand-secondary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-mono font-bold text-brand-secondary mt-1">
              +{delta}%
            </span>
          </div>

          {/* Tailored Score */}
          <div className="flex flex-col items-center bg-brand-level1 border border-brand-level1Border/30 p-4 rounded-lg relative overflow-hidden">
            {/* Gradient border border-t-2 */}
            <div className="absolute top-0 left-0 w-full h-[2px] pulse-bar"></div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-brand-primary mb-1 font-semibold">
              Tailored
            </span>
            <div className={`text-5xl md:text-6xl font-bold font-mono tracking-tighter ${getScoreColorClass(tailoredScore)}`}>
              {tailoredScore}%
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-brand-level1Border bg-brand-level1">
          <div className="text-center">
            <div className={`text-4xl md:text-5xl font-bold font-mono tracking-tight ${getScoreColorClass(originalScore)}`}>
              {originalScore}%
            </div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant">
              ATS MATCH
            </span>
          </div>
        </div>
      )}

      {tailoredScore !== undefined && (
        <p className="text-xs text-on-surface-variant mt-5 max-w-sm">
          Your tailored resume matches the job requirements and has a <strong className="text-white font-mono">{tailoredScore}%</strong> probability of passing automated screening filters.
        </p>
      )}
    </Card>
  );
}
