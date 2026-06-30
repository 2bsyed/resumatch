'use client';

import React, { useState } from 'react';

interface CvViewerProps {
  tailoredCv: any;
  originalCv: any;
  keywords: string[];
  jobTitle?: string;
  companyName?: string;
}

export function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!text) return '';
  if (!keywords || keywords.length === 0) return text;

  // Filter out any empty/undefined keywords and sort by length descending to match longest first
  const sortedKeywords = keywords
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (sortedKeywords.length === 0) return text;

  // Escape special regex characters
  const escapedKws = sortedKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  
  // Match keywords as full words when possible
  const regex = new RegExp(`\\b(${escapedKws.join('|')})\\b`, 'gi');

  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        const isMatch = sortedKeywords.some(
          kw => kw.toLowerCase() === part.toLowerCase()
        );
        if (isMatch) {
          return (
            <mark key={index} className="bg-primary/20 text-primary rounded px-0.5 border-b border-primary/50 font-medium font-sans">
              {part}
            </mark>
          );
        }
        return part;
      })}
    </>
  );
}

export default function CvViewer({ tailoredCv, originalCv, keywords, jobTitle, companyName }: CvViewerProps) {
  const [activeTab, setActiveTab] = useState<'tailored' | 'original'>('tailored');

  const cv = activeTab === 'tailored' ? tailoredCv : originalCv;
  const isTailored = activeTab === 'tailored';

  if (!cv) {
    return (
      <div className="bg-[#0F1623] border border-[#1F2937] rounded-[12px] p-6 text-center text-[#9CA3AF] font-sans text-sm select-none">
        No CV data available.
      </div>
    );
  }

  const fullName = cv.personal?.full_name || 'Your Name';
  const email = cv.personal?.email || '';
  const phone = cv.personal?.phone || '';
  const location = cv.personal?.location || '';
  const summary = cv.personal?.summary || '';

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Title and Toggle */}
      <div className="flex justify-between items-end border-b border-[#1F2937] pb-4">
        <div>
          <h3 className="font-heading font-semibold text-[18px] text-white">
            {isTailored ? 'Tailored Resume' : 'Original Resume'}
          </h3>
          {(jobTitle || companyName) && (
            <p className="font-sans text-[13px] text-[#9CA3AF]">
              for {jobTitle || 'Target Role'} {companyName ? `at ${companyName}` : ''}
            </p>
          )}
        </div>
        <div className="flex gap-4 font-mono text-label-mono uppercase">
          <button 
            onClick={() => setActiveTab('tailored')}
            className={`pb-1 font-bold transition-all cursor-pointer ${
              isTailored ? 'text-primary border-b-2 border-primary' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Tailored
          </button>
          <button 
            onClick={() => setActiveTab('original')}
            className={`pb-1 transition-all cursor-pointer ${
              !isTailored ? 'text-primary border-b-2 border-primary font-bold' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Styled CV Paper Container */}
      <div className="bg-[#0F1623] border border-[#1F2937] rounded-[12px] p-6 max-h-[600px] overflow-y-auto custom-scrollbar font-sans text-[13px] text-on-surface-variant shadow-inner relative leading-relaxed">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(79,142,247,0.03),transparent_40%)]"></div>
        
        {/* Name and Info */}
        <div className="text-center mb-8 border-b border-outline-variant/30 pb-4">
          <h4 className="font-heading text-[20px] mb-1 font-bold text-white">{fullName}</h4>
          <p className="text-[#9CA3AF] font-mono text-[12px] flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
            {email && <span>{email}</span>}
            {email && (phone || location) && <span className="opacity-40">|</span>}
            {phone && <span>{phone}</span>}
            {phone && location && <span className="opacity-40">|</span>}
            {location && <span>{location}</span>}
          </p>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="mb-6">
            <h5 className="font-mono text-label-mono uppercase text-primary mb-2 border-b border-outline-variant/30 pb-1 inline-block">
              Summary
            </h5>
            <p className="text-on-surface-variant font-sans leading-relaxed">
              {isTailored ? highlightKeywords(summary, keywords) : summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {Array.isArray(cv.experience) && cv.experience.length > 0 && (
          <div className="mb-6">
            <h5 className="font-mono text-label-mono uppercase text-primary mb-2 border-b border-outline-variant/30 pb-1 inline-block">
              Experience
            </h5>
            <div className="space-y-6">
              {cv.experience.map((job: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h6 className="font-bold text-[14px] text-white">{job.company || 'Company'}</h6>
                    <span className="text-[#9CA3AF] font-mono text-[12px]">{job.dates || job.duration || ''}</span>
                  </div>
                  <p className="text-[#9CA3AF] italic text-[13px]">{job.title || 'Job Title'}</p>
                  {Array.isArray(job.bullets) && (
                    <ul className="list-disc pl-5 text-on-surface-variant space-y-2 mt-2">
                      {job.bullets.map((bullet: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          {isTailored ? highlightKeywords(bullet, keywords) : bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {Array.isArray(cv.education) && cv.education.length > 0 && (
          <div className="mb-6">
            <h5 className="font-mono text-label-mono uppercase text-primary mb-2 border-b border-outline-variant/30 pb-1 inline-block">
              Education
            </h5>
            <div className="space-y-3">
              {cv.education.map((edu: any, index: number) => (
                <div key={index} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-white">{edu.degree || ''} {edu.field ? `in ${edu.field}` : ''}</span>
                    <p className="text-[#9CA3AF] text-[12px]">{edu.institution || ''}</p>
                  </div>
                  <span className="text-[#9CA3AF] font-mono text-[12px]">{edu.graduation_date || edu.dates || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {cv.skills && (
          <div className="mb-6">
            <h5 className="font-mono text-label-mono uppercase text-primary mb-2 border-b border-outline-variant/30 pb-1 inline-block">
              Skills
            </h5>
            <div className="space-y-2">
              {Array.isArray(cv.skills.technical) && cv.skills.technical.length > 0 && (
                <div>
                  <span className="font-bold text-[#9CA3AF] mr-2">Technical:</span>
                  <span className="text-on-surface-variant">
                    {cv.skills.technical.map((s: string, idx: number) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && ', '}
                        {isTailored ? highlightKeywords(s, keywords) : s}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}
              {Array.isArray(cv.skills.soft) && cv.skills.soft.length > 0 && (
                <div>
                  <span className="font-bold text-[#9CA3AF] mr-2">Soft:</span>
                  <span className="text-on-surface-variant">{cv.skills.soft.join(', ')}</span>
                </div>
              )}
              {Array.isArray(cv.skills.tools) && cv.skills.tools.length > 0 && (
                <div>
                  <span className="font-bold text-[#9CA3AF] mr-2">Tools:</span>
                  <span className="text-on-surface-variant">
                    {cv.skills.tools.map((t: string, idx: number) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && ', '}
                        {isTailored ? highlightKeywords(t, keywords) : t}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        {isTailored && (
          <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase text-[#9CA3AF]">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-[2px] bg-primary"></div>
              <span className="text-[11px] text-[#9CA3AF]">Keyword injected / emphasized</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
