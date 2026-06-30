import React from 'react';
import Card from '../ui/Card';
import KeywordPill from '../ui/KeywordPill';
import { KeywordAnalysis } from '../../lib/types';

interface KeywordDiffProps {
  analysis: KeywordAnalysis;
}

export default function KeywordDiff({ analysis }: KeywordDiffProps) {
  const { matched_keywords = [], missing_keywords = [], skills_gap = [] } = analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Matched Keywords */}
      <Card level={1} className="p-5 flex flex-col">
        <div className="flex items-center gap-2 border-b border-brand-level1Border/40 pb-3 mb-4">
          <div className="w-5 h-5 rounded-md bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/30">
            <svg className="w-3.5 h-3.5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="label-mono text-[10px] text-white uppercase font-bold tracking-wider">
            Matched ATS Keywords ({matched_keywords.length})
          </h4>
        </div>
        
        {matched_keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matched_keywords.map((kw, idx) => (
              <KeywordPill key={idx} keyword={kw} isMatched={true} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant italic py-2">
            No matching keywords detected.
          </p>
        )}
      </Card>

      {/* Missing Keywords */}
      <Card level={1} className="p-5 flex flex-col">
        <div className="flex items-center gap-2 border-b border-brand-level1Border/40 pb-3 mb-4">
          <div className="w-5 h-5 rounded-md bg-error/10 flex items-center justify-center border border-error/30">
            <svg className="w-3.5 h-3.5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="label-mono text-[10px] text-white uppercase font-bold tracking-wider">
            Missing ATS Keywords ({missing_keywords.length})
          </h4>
        </div>

        {missing_keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missing_keywords.map((kw, idx) => (
              <KeywordPill key={idx} keyword={kw} isMatched={false} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-secondary italic py-2">
            Perfect match! No keywords missing.
          </p>
        )}
      </Card>

      {/* Skills Gap Details */}
      {skills_gap.length > 0 && (
        <Card level={1} className="p-5 md:col-span-2">
          <h4 className="label-mono text-[10px] text-white uppercase font-bold tracking-wider border-b border-brand-level1Border/40 pb-3 mb-4">
            Analysis & Recommendations
          </h4>
          <ul className="space-y-2 text-xs text-on-surface-variant font-mono">
            {skills_gap.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-brand-primary select-none mt-0.5">»</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
