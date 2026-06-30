'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '../../../components/ui/StepIndicator';
import CvUploader from '../../../components/cv/CvUploader';
import { apiPost } from '../../../lib/api';

export default function CvPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ jobId: string; masterCvId: string } | null>(null);

  const handleParseSubmit = async (file: File | null, pastedText: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (pastedText) {
      formData.append('pastedText', pastedText);
    } else {
      setErrorMsg('Please select a resume file or paste your CV text.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiPost<{ jobId: string; masterCvId: string }>('/cv/upload', formData);
      
      // Store masterCvId in localStorage
      localStorage.setItem('masterCvId', response.masterCvId);
      
      setSuccessData(response);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload and parse CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (successData) {
      router.push(`/tailor?cvId=${successData.masterCvId}`);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8 md:p-[32px] flex-1">
      {/* 3-Step Indicator (Step 1 Active) */}
      <StepIndicator currentStep={1} />

      {/* Page Header */}
      <div className="mb-12">
        <h1 className="font-heading font-extrabold text-[28px] leading-[36px] text-white mb-2">
          Upload your master CV
        </h1>
        <p className="font-sans text-[16px] text-[#9CA3AF]">
          This is your full career history. We'll tailor versions of it for each job.
        </p>
      </div>

      {/* Success Notification overlay or alert banner */}
      {successData && (
        <div className="bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl p-6 mb-8 text-center flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">check</span>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Master CV parsed successfully!</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Baseline profile data ready. Proceed to match against job criteria.
              </p>
            </div>
          </div>
          <button 
            onClick={handleNextStep}
            className="btn-primary flex items-center gap-2 cursor-pointer py-2 px-5 text-xs text-[#0A0E1A] font-mono tracking-wider uppercase font-bold"
          >
            Next Step: Paste Job Description
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-error/15 border border-error/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-xs text-error font-mono leading-relaxed">
          <span className="material-symbols-outlined text-lg shrink-0">warning</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout (60 / 40) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        {/* Left Column (60%) */}
        <div className="lg:col-span-7 flex flex-col">
          <CvUploader onParseSubmit={handleParseSubmit} isLoading={loading} />
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Info Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-[8px] p-6">
            <h3 className="font-heading font-semibold text-[16px] text-white mb-4 flex items-center gap-2 border-b border-[#1F2937] pb-3">
              <span className="material-symbols-outlined text-[#4F8EF7] text-[18px]">memory</span>
              What we extract
            </h3>
            <ul className="space-y-3 font-sans text-[14px] text-[#dce3f0]">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10B981] text-[16px]">check_circle</span>
                Work history & timelines
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10B981] text-[16px]">check_circle</span>
                Technical & soft skills
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10B981] text-[16px]">check_circle</span>
                Education & certifications
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10B981] text-[16px]">check_circle</span>
                Projects & achievements
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10B981] text-[16px]">check_circle</span>
                Contact info
              </li>
            </ul>
          </div>

          {/* Privacy Note */}
          <div className="bg-[#1C2333] border border-[#374151] rounded-[8px] p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#9CA3AF] text-[20px] mt-0.5 select-none">
              lock
            </span>
            <div>
              <p className="font-sans text-body-small text-[13px] text-[#dce3f0] leading-relaxed">
                Your CV data is stored securely and never shared. We process it solely to generate tailored variations for your applications.
              </p>
            </div>
          </div>

          {/* Decorative parsed preview card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-[8px] p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent z-10 pointer-events-none"></div>
            <h4 className="font-mono text-[11px] text-[#9CA3AF] uppercase absolute bottom-4 left-4 z-20">
              Preview of parsed output
            </h4>
            <div className="opacity-30 blur-[2px] group-hover:blur-[1px] transition-all select-none">
              <div className="h-2 w-1/3 bg-[#374151] rounded mb-3"></div>
              <div className="h-1.5 w-1/4 bg-[#1F2937] rounded mb-4"></div>
              <div className="h-1 w-full bg-[#1F2937] rounded mb-2"></div>
              <div className="h-1 w-5/6 bg-[#1F2937] rounded mb-2"></div>
              <div className="h-1 w-4/6 bg-[#1F2937] rounded mb-6"></div>
              <div className="h-2 w-1/4 bg-[#374151] rounded mb-3"></div>
              <div className="h-1 w-full bg-[#1F2937] rounded mb-2"></div>
              <div className="h-1 w-3/4 bg-[#1F2937] rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
