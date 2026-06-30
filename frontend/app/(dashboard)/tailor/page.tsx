'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StepIndicator from '../../../components/ui/StepIndicator';
import PulseBar from '../../../components/ui/PulseBar';
import { apiPost } from '../../../lib/api';

interface JdAnalysis {
  job_title: string;
  company_name: string | null;
  job_category: string;
  seniority_level: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  required_years_experience: number | null;
  key_action_verbs: string[];
  industry_keywords: string[];
  responsibilities_summary: string;
  top_10_ats_keywords: string[];
}

export default function TailorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jdText, setJdText] = useState('');
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JdAnalysis | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [initialScore, setInitialScore] = useState<number | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  
  const [isTailoring, setIsTailoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirect check on page mount
  useEffect(() => {
    // If no cvId is provided, try reading from localStorage as fallback
    const storedCvId = localStorage.getItem('masterCvId');
    
    if (!cvId && !storedCvId) {
      router.push('/cv?message=Upload your CV first');
    } else if (!cvId && storedCvId) {
      // Re-route to self with cvId in parameters
      router.push(`/tailor?cvId=${storedCvId}`);
    }
  }, [cvId, router]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim() || !cvId) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const response = await apiPost<{
        jdId: string;
        jdAnalysis: JdAnalysis;
        initialScore: number;
        matched: string[];
        missing: string[];
      }>('/tailor/analyze', {
        masterCvId: cvId,
        jdText,
        jobTitle,
        companyName
      });

      setJdId(response.jdId);
      setAnalysisResult(response.jdAnalysis);
      setInitialScore(response.initialScore);
      setMatchedKeywords(response.matched);
      setMissingKeywords(response.missing);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze job description. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailor = async () => {
    if (!cvId || !jdId) return;
    
    setIsTailoring(true);
    setErrorMsg(null);

    try {
      const response = await apiPost<{
        tailoredCvId: string;
        jobId: string;
      }>('/tailor/start', {
        masterCvId: cvId,
        jdId
      });

      router.push(`/processing/${response.jobId}?tailorId=${response.tailoredCvId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to trigger tailoring job. Please try again.');
      setIsTailoring(false);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'text-secondary';
    if (score >= 50) return 'text-tertiary';
    return 'text-error';
  };

  const getScoreBarBgClass = (score: number) => {
    if (score >= 75) return 'bg-[#10B981]';
    if (score >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  const maxJdLength = 5000;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 pb-24">
      {/* Step Indicator */}
      <StepIndicator currentStep={2} />

      {/* Header */}
      <div className="mb-10">
        <h2 className="font-heading font-bold text-[28px] text-white mb-2">
          Paste the job description
        </h2>
        <p className="font-sans text-[16px] text-[#9CA3AF]">
          Copy the full JD from LinkedIn, company site, or anywhere. The more detail, the better your match.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-error/15 border border-error/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-xs text-error font-mono leading-relaxed">
          <span className="material-symbols-outlined text-lg shrink-0">warning</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* Side-by-side inputs */}
            <div className="flex gap-4 w-full">
              <div className="flex-grow flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Job Title
                </label>
                <input 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isAnalyzing || isTailoring}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-[4px] px-3 py-2.5 text-white font-sans text-xs placeholder:text-[#4B5563] focus:outline-none focus:border-clinical-primary focus:ring-0 transition-colors disabled:opacity-50" 
                  placeholder="Senior Software Engineer" 
                  type="text"
                />
              </div>
              <div className="flex-grow flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Company Name
                </label>
                <input 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isAnalyzing || isTailoring}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-[4px] px-3 py-2.5 text-white font-sans text-xs placeholder:text-[#4B5563] focus:outline-none focus:border-clinical-primary focus:ring-0 transition-colors disabled:opacity-50" 
                  placeholder="Google" 
                  type="text"
                />
              </div>
            </div>

            {/* Main Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[13px] uppercase tracking-[0.08em] text-[#9CA3AF]">
                Full Job Description *
              </label>
              <div className="relative">
                <textarea 
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value.slice(0, maxJdLength))}
                  disabled={isAnalyzing || isTailoring}
                  maxLength={maxJdLength}
                  className="w-full bg-[#0F1623] border border-[#374151] rounded-[8px] p-4 text-white font-sans text-sm placeholder:text-[#4B5563] min-h-[360px] resize-y focus:outline-none focus:border-clinical-primary focus:ring-0 transition-colors disabled:opacity-50" 
                  placeholder="About the Role...&#10;&#10;We're looking for...&#10;&#10;Responsibilities:&#10;- Design and implement scalable distributed systems..."
                  required
                ></textarea>
                <div className="absolute bottom-3 right-4 font-mono text-[12px] text-[#4B5563] select-none">
                  {jdText.length} / {maxJdLength}
                </div>
              </div>
            </div>

            {/* Pulse bar and buttons */}
            <div className="space-y-4">
              <PulseBar isActive={isAnalyzing} />
              
              <button 
                type="submit"
                disabled={isAnalyzing || isTailoring || !jdText.trim()}
                className="w-full bg-clinical-primary text-white font-mono text-[14px] font-medium uppercase h-[48px] rounded-[6px] hover:brightness-110 glow-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Job description...
                  </>
                ) : (
                  <>
                    Analyze Job Description
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
              <div className="text-center">
                <span className="font-sans text-[12px] text-[#4B5563]">
                  ⚡ Extracts keywords, required skills, and ATS scoring criteria
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Extraction Preview (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:pl-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-semibold text-[16px] text-white">Extracted Keywords</h3>
            <p className="font-sans text-body-small text-[13px] text-[#9CA3AF]">
              These are what ATS systems scan for
            </p>
          </div>

          {analysisResult ? (
            <div className="space-y-6 animate-fade-in">
              {/* Required Skills */}
              <div className="flex flex-col gap-3">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#4B5563]">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.required_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-[#1C2333] border border-[#374151] rounded-[4px] font-mono text-[13px] text-white select-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nice to Have */}
              {analysisResult.nice_to_have_skills.length > 0 && (
                <div className="flex flex-col gap-3">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#4B5563]">
                    Nice to Have
                  </label>
                  <div className="flex flex-wrap gap-2 opacity-80">
                    {analysisResult.nice_to_have_skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 bg-[#1C2333] border border-[#374151] rounded-[4px] font-mono text-[13px] text-white select-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Preview Card */}
              {initialScore !== null && (
                <div className="bg-[#0A0E1A] border border-[#374151] rounded-[12px] p-[16px] flex flex-col gap-4 shadow-lg">
                  <div className="font-sans text-[14px] text-[#9CA3AF]">
                    Initial ATS Match Estimate
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-mono text-[36px] font-bold leading-none ${getScoreColorClass(initialScore)}`}>
                      {initialScore}
                    </span>
                    <span className="font-mono text-[20px] text-[#4B5563] leading-none">/100</span>
                  </div>
                  <div className="font-sans text-[12px] text-[#4B5563] -mt-2">
                    Before tailoring your CV
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#1C2333] rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${getScoreBarBgClass(initialScore)} transition-all duration-500`}
                      style={{ width: `${initialScore}%` }}
                    ></div>
                  </div>
                  <div className="font-sans text-[13px] text-[#9CA3AF] mt-1">
                    {matchedKeywords.length} of {matchedKeywords.length + missingKeywords.length} keywords found in your current CV
                  </div>
                </div>
              )}

              {/* Tailor Button */}
              <button 
                onClick={handleTailor}
                disabled={isTailoring}
                className="w-full bg-[#10B981] hover:brightness-110 hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] text-[#0A0E1A] font-mono text-[14px] font-bold uppercase h-[48px] rounded-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isTailoring ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#0A0E1A]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Queuing AI Optimization...
                  </>
                ) : (
                  <>
                    Tailor My CV
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Placeholder state */
            <div className="bg-[#111827] border border-dashed border-[#1F2937] rounded-[16px] p-8 text-center h-[280px] flex flex-col items-center justify-center gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-[#4B5563] text-[40px] select-none">
                find_in_page
              </span>
              <p className="font-sans text-sm max-w-[240px] leading-relaxed select-none">
                Paste a JD to see keyword extraction
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
