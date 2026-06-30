'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CvViewer from '../../../../components/cv/CvViewer';
import { getAuthToken } from '../../../../lib/api';

interface ResultsClientProps {
  data: any;
}

export default function ResultsClient({ data }: ResultsClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const {
    id: tailorId,
    ats_score_before,
    ats_score_after,
    tailored_cv_json,
    keywords_matched = [],
    keywords_missing = [],
    changes_summary = {},
    job_descriptions,
    master_cvs
  } = data;

  const jobTitle = job_descriptions?.job_title || 'Target Role';
  const companyName = job_descriptions?.company_name || 'Target Company';
  const extractedKeywords = job_descriptions?.extracted_keywords?.top_10_ats_keywords || [];

  const improvement = Math.max(0, ats_score_after - ats_score_before);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      const token = await getAuthToken();
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                          process.env.NEXT_PUBLIC_API_URL || 
                          'http://localhost:5000/api';
      
      const response = await fetch(
        `${BACKEND_URL}/tailor/${tailorId}/pdf`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to generate PDF. Status: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${jobTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(err.message || 'Failed to download PDF. Please try again.');
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'text-secondary';
    if (score >= 50) return 'text-tertiary';
    return 'text-error';
  };

  const matchedKeywordsList = Array.isArray(keywords_matched) ? keywords_matched : [];
  const missingKeywordsList = Array.isArray(keywords_missing) ? keywords_missing : [];
  const totalKeywordsCount = matchedKeywordsList.length + missingKeywordsList.length;
  const keywordPercentage = totalKeywordsCount > 0 
    ? Math.round((matchedKeywordsList.length / totalKeywordsCount) * 100) 
    : 0;

  // Render match label based on ATS score
  const isStrongMatch = ats_score_after >= 75;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 pb-24 space-y-8 select-none print:p-0 print:m-0 print:max-w-full">
      
      {/* SECTION 1 — Page Header */}
      <div className="flex flex-col gap-6 print:hidden">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 font-mono text-label-mono uppercase">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Step 1: Upload</span>
          </div>
          <span className="text-[#424753] mx-2">/</span>
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Step 2: Target</span>
          </div>
          <span className="text-[#424753] mx-2">/</span>
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="material-symbols-outlined text-[16px]">radio_button_checked</span>
            <span>Step 3: Results</span>
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-heading font-bold text-[28px] text-white leading-tight">
              Your tailored resume is ready
            </h2>
            <p className="font-sans text-[14px] text-[#9CA3AF]">
              AI optimization successfully parsed and updated experience bullets for maximum match relevance.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => router.push('/tailor')}
              className="flex-1 md:flex-none px-4 py-2 border border-[#1F2937] text-white rounded-[6px] font-mono text-label-mono uppercase hover:bg-surface-container-high transition-colors cursor-pointer text-xs"
            >
              Start New Tailoring
            </button>
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 md:flex-none px-4 py-2 bg-clinical-primary text-[#001a40] rounded-[6px] font-mono text-label-mono font-bold uppercase hover:brightness-110 glow-primary transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Score Banner (full-width card) */}
      <div className="w-full bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden relative shadow-lg print:hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4F8EF7] to-[#10B981]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pl-12">
          
          {/* BEFORE score */}
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-label-mono text-[#9CA3AF] mb-2 uppercase">BEFORE</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[48px] leading-[48px] font-bold text-error">
                {ats_score_before}
              </span>
              <span className="font-mono text-[24px] text-[#424753]">/100</span>
            </div>
            <span className="font-sans text-[13px] text-[#9CA3AF] mt-1">ATS Match Score</span>
          </div>

          {/* IMPROVEMENT indicator */}
          <div className="flex flex-col items-center justify-center text-center border-y md:border-y-0 md:border-x border-[#1F2937] py-6 md:py-0">
            <span className="material-symbols-outlined text-[40px] text-secondary mb-1" style={{ fontVariationSettings: "'wght' 300" }}>
              trending_up
            </span>
            <span className="font-mono text-[24px] font-bold text-secondary leading-none">
              +{improvement} points
            </span>
            <span className="font-mono text-label-mono text-[#9CA3AF] uppercase mt-1">improvement</span>
          </div>

          {/* AFTER score */}
          <div className="flex flex-col items-center text-center relative">
            <div className="absolute -top-4 right-0 md:-right-4 px-3 py-1 bg-secondary/15 border border-secondary/30 rounded-full flex items-center gap-1">
              <span className="font-mono text-[10px] text-secondary uppercase font-bold tracking-wider">
                {isStrongMatch ? 'Strong Match' : 'Good Match'}
              </span>
              <span className="material-symbols-outlined text-secondary text-[12px]">check</span>
            </div>
            <span className="font-mono text-label-mono text-[#9CA3AF] mb-2 uppercase">AFTER</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[48px] leading-[48px] font-bold text-secondary glow-success">
                {ats_score_after}
              </span>
              <span className="font-mono text-[24px] text-[#424753]">/100</span>
            </div>
            <span className="font-sans text-[13px] text-[#9CA3AF] mt-1">Optimized ATS Score</span>
          </div>

        </div>
      </div>

      {/* SECTION 3 — Two Column Layout (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:grid-cols-1 print:block">
        
        {/* LEFT COLUMN: CV Document Viewer */}
        <div className="lg:col-span-8 print:w-full">
          <CvViewer 
            tailoredCv={tailored_cv_json}
            originalCv={master_cvs?.cv_json}
            keywords={extractedKeywords}
            jobTitle={jobTitle}
            companyName={companyName}
          />
        </div>

        {/* RIGHT COLUMN: Analysis Panel (three cards) */}
        <div className="lg:col-span-4 flex flex-col gap-6 print:hidden">
          
          {/* Card A: Keyword Match */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-[8px] p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-heading font-semibold text-[16px] text-white border-b border-[#1F2937] pb-2">
              Keyword Match
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle className="text-[#1F2937]" cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3"></circle>
                  <circle 
                    className="text-secondary" 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                    strokeDasharray={`${keywordPercentage}, 100`}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[15px] font-bold text-secondary">
                  {keywordPercentage}%
                </div>
              </div>
              <div>
                <p className="font-sans text-[13px] text-[#9CA3AF] mb-1">
                  {isStrongMatch ? 'Excellent keyword compatibility.' : 'Good keyword coverage.'}
                </p>
                <p className="font-mono text-[10px] text-[#4B5563] uppercase tracking-wider">
                  Target for interview: 75%+
                </p>
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="space-y-2">
              <h4 className="font-mono text-label-mono text-[#9CA3AF] uppercase flex items-center gap-1.5">
                Matched Keywords
                <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
              </h4>
              {matchedKeywordsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchedKeywordsList.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-secondary/10 text-secondary rounded-[4px] font-mono text-[12px] border border-secondary/20 flex items-center gap-1 select-all"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-[12px] text-[#4B5563] italic">No keywords matched.</p>
              )}
            </div>

            {/* Missing Keywords */}
            <div className="space-y-2">
              <h4 className="font-mono text-label-mono text-[#9CA3AF] uppercase flex items-center gap-1.5">
                Missing Keywords
                <span className="material-symbols-outlined text-error text-[14px]">close</span>
              </h4>
              {missingKeywordsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {missingKeywordsList.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-error/10 text-error rounded-[4px] font-mono text-[12px] border border-error/20 flex items-center gap-1 select-all"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-[12px] text-secondary italic">All key terms matched!</p>
              )}
              <p className="font-sans text-[11px] text-[#4B5563] leading-relaxed mt-1">
                Note: Consider adding these if you possess the skills truthfully.
              </p>
            </div>

          </div>

          {/* Card B: Changes Summary */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-[8px] p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-[16px] text-white mb-4 border-b border-[#1F2937] pb-2">
              What changed
            </h3>
            <ul className="flex flex-col gap-3 font-mono text-[13px] text-[#9CA3AF]">
              <li className="flex justify-between items-center">
                <span>Bullets rewritten</span>
                <span className="text-primary font-bold">
                  {changes_summary.bullets_rewritten || 0}
                </span>
              </li>
              <li className="w-full h-px bg-[#1F2937]"></li>
              <li className="flex justify-between items-center">
                <span>Keywords injected</span>
                <span className="text-secondary font-bold">
                  {changes_summary.keywords_added || 0}
                </span>
              </li>
              <li className="w-full h-px bg-[#1F2937]"></li>
              <li className="flex justify-between items-center">
                <span>Sections reordered</span>
                <span className="text-white font-bold">
                  {changes_summary.sections_reordered || 0}
                </span>
              </li>
              <li className="w-full h-px bg-[#1F2937]"></li>
              <li className="flex justify-between items-center">
                <span>Bullets removed</span>
                <span className="text-error font-bold">
                  {changes_summary.bullets_removed || 0}
                </span>
              </li>
            </ul>
          </div>

          {/* Card C: Download & Actions */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-[8px] p-6 shadow-sm flex flex-col gap-4 text-center">
            <button 
              onClick={handleDownloadPdf}
              className="w-full py-3 bg-clinical-primary text-[#001a40] rounded-[6px] font-mono text-label-mono uppercase hover:brightness-110 glow-primary transition-all font-bold cursor-pointer text-xs"
            >
              Download PDF
            </button>
            <button 
              onClick={handleCopyLink}
              className="w-full py-2 border border-[#1F2937] text-white rounded-[6px] font-mono text-label-mono uppercase hover:bg-surface-container-high transition-colors cursor-pointer text-xs"
            >
              {copied ? 'Copied Link ✓' : 'Copy shareable link'}
            </button>
            <p className="font-sans text-[12px] text-[#4B5563] mt-2">
              Your tailored CV is securely saved in History.
            </p>
          </div>

        </div>

      </div>

      {/* SECTION 4 — Bottom CTA */}
      <div className="w-full pt-8 border-t border-[#1F2937] flex justify-center print:hidden">
        <Link 
          href="/tailor" 
          className="flex items-center gap-2 font-mono text-[13px] text-primary hover:underline uppercase tracking-wider"
        >
          Tailor for another job
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

    </div>
  );
}
