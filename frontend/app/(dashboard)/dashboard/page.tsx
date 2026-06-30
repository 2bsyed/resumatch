import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '../../../lib/supabase';

// Format date relative to today (e.g. "2d ago")
function getRelativeTimeString(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'Today';
  if (diffDays === 2) return '1d ago';
  if (diffDays <= 7) return `${diffDays - 1}d ago`;
  return date.toLocaleDateString();
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Get active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // 1. Fetch active master CV
  const { data: masterCv } = await supabase
    .from('master_cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Fetch recent tailorings (joining with job_descriptions)
  const { data: recentTailorings } = await supabase
    .from('tailored_cvs')
    .select(`
      *,
      job_descriptions (
        company_name,
        job_title
      )
    `)
    .eq('user_id', session.user.id)
    .eq('processing_status', 'complete')
    .order('created_at', { ascending: false })
    .limit(3);

  const tailoredList = recentTailorings || [];

  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'text-secondary'; // >75
    if (score >= 50) return 'text-tertiary'; // 50-75
    return 'text-error'; // <50
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 pb-24">
      {/* Top Bar */}
      <header className="flex justify-between items-center mb-10">
        <h2 className="font-heading font-bold text-headline-h2 text-white tracking-tight">
          Dashboard
        </h2>
        <Link href="/tailor">
          <button className="btn-primary flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            New Tailoring
          </button>
        </Link>
      </header>

      {/* A) Master CV Status Card */}
      <section className="mb-12">
        {masterCv ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-[16px] p-6 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group">
            {/* Background glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none"></div>
            
            <div className="w-16 h-16 rounded-xl bg-[#1C2333] flex items-center justify-center shrink-0 border border-[#374151]">
              <span className="material-symbols-outlined text-primary text-[32px]">description</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-heading font-semibold text-[18px] text-white">Your Master CV</h3>
                <span className="px-2 py-0.5 rounded-[4px] bg-secondary/10 text-secondary text-xs font-medium border border-secondary/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Active
                </span>
              </div>
              <p className="text-sm text-[#9CA3AF] truncate">
                Last updated {getRelativeTimeString(masterCv.updated_at)} · {masterCv.cv_json?.personal?.name || 'Software Engineer'} profile · Version {masterCv.version || 1}
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 border-t border-[#1F2937] md:border-t-0 pt-4 md:pt-0">
              <Link href="/cv" className="btn-ghost flex-1 md:flex-none flex items-center justify-center gap-2 text-center text-xs py-2">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                View
              </Link>
              <Link href="/cv" className="btn-ghost flex-1 md:flex-none flex items-center justify-center gap-2 text-center text-xs py-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Update
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#111827] border border-dashed border-[#1F2937] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
            <div className="w-16 h-16 rounded-xl bg-[#1C2333] flex items-center justify-center shrink-0 border border-[#374151]">
              <span className="material-symbols-outlined text-outline text-[32px]">description</span>
            </div>
            <div className="max-w-md">
              <h3 className="font-heading font-semibold text-[18px] text-white">Upload Your Master CV First</h3>
              <p className="text-sm text-[#9CA3AF] mt-1 leading-relaxed">
                Provide a master resume baseline before using AI matching capabilities.
              </p>
            </div>
            <Link href="/cv">
              <button className="btn-primary cursor-pointer mt-2">
                Upload CV Now
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* B) Recent Tailorings Section */}
      {tailoredList.length > 0 ? (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-[18px] text-white">Recent Tailorings</h3>
            <Link className="text-sm text-primary hover:underline transition-colors font-medium flex items-center gap-1" href="/history">
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tailoredList.map((cv) => {
              const jd = cv.job_descriptions as any;
              const companyName = jd?.company_name || 'Target Corp';
              const jobTitle = jd?.job_title || 'Software Engineer';
              const gain = Math.round(Number(cv.ats_score_after) - Number(cv.ats_score_before));
              const keywordsCount = Array.isArray(cv.keywords_matched) ? cv.keywords_matched.length : 0;

              return (
                <div key={cv.id} className="bg-[#111827] border border-[#1F2937] rounded-lg p-5 flex flex-col h-full hover:border-[#374151] transition-colors relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <h4 className="font-medium text-white text-base leading-tight mb-1 truncate">
                        {jobTitle}
                      </h4>
                      <div className="text-sm text-on-surface-variant flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-[16px]">business</span> 
                        {companyName}
                      </div>
                    </div>
                    <div className="text-xs text-on-surface-variant font-mono whitespace-nowrap ml-2">
                      {getRelativeTimeString(cv.created_at)}
                    </div>
                  </div>
                  
                  <div className="mb-4 pb-4 border-b border-[#1F2937] flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-mono">
                        Match Score
                      </div>
                      <div className={`font-mono font-bold text-[20px] ${getScoreColorClass(Number(cv.ats_score_after))}`}>
                        {Math.round(Number(cv.ats_score_after))}/100
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end font-mono">
                      <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[11px] font-semibold">
                        +{gain} pts
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#1C2333] text-[#9CA3AF] text-[11px]">
                        {keywordsCount} keywords added
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button className="btn-ghost flex-1 text-xs py-1.5 flex justify-center items-center gap-1 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">download</span> 
                      PDF
                    </button>
                    <Link href={`/results/${cv.id}`} className="flex-grow flex">
                      <button className="btn-ghost w-full text-xs py-1.5 cursor-pointer">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* D) Empty State (if no tailored CVs yet) */
        masterCv && (
          <section className="mb-12">
            <div className="bg-[#111827] border border-[#1F2937] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-6 max-w-xl mx-auto my-6">
              <div className="w-12 h-12 rounded-full bg-[#1C2333] flex items-center justify-center border border-[#374151] text-primary">
                <span className="material-symbols-outlined text-[24px]">waving_hand</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-white mb-2">Welcome to ResuMatch!</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  Let's get your resume ATS-ready. Follow our simple three-step optimization path:
                </p>
              </div>
              <div className="w-full text-left space-y-4 max-w-md bg-[#0A0E1A] p-5 rounded-lg border border-[#1F2937]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-xs text-brand-primary font-bold font-mono">1</div>
                  <span className="text-xs text-white">Upload your base Master CV inside the CV tab</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-xs text-brand-primary font-bold font-mono">2</div>
                  <span className="text-xs text-white">Paste the job post description inside the Tailor tab</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-secondary/10 border border-brand-secondary/30 flex items-center justify-center text-xs text-brand-secondary font-bold font-mono">3</div>
                  <span className="text-xs text-white">Review keyword optimizations & download tailored PDF</span>
                </div>
              </div>
              <Link href="/tailor">
                <button className="btn-primary cursor-pointer">
                  Get Started
                </button>
              </Link>
            </div>
          </section>
        )
      )}

      {/* C) Quick Start card (only if user has master CV) */}
      {masterCv && (
        <section>
          <div className="w-full border border-dashed border-[#374151] rounded-[12px] bg-[#0A0E1A] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-colors duration-300">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#4F8EF7] text-[24px]">bolt</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[18px] text-white mb-1">
                  Tailor your resume for a new job
                </h3>
                <p className="text-[14px] text-[#9CA3AF]">
                  Paste a job description and get a tailored CV in under 2 minutes.
                </p>
              </div>
            </div>
            <Link href="/tailor">
              <button className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 shrink-0 group cursor-pointer">
                Start New Tailoring
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
