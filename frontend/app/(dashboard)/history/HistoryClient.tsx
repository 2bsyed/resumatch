'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthToken, apiDelete } from '../../../lib/api';

interface HistoryClientProps {
  initialHistory: any[];
}

export default function HistoryClient({ initialHistory }: HistoryClientProps) {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>(initialHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  
  // Dropdown states
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const kebabRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (activeKebabId && kebabRef.current && !kebabRef.current.contains(event.target as Node)) {
        setActiveKebabId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeKebabId]);

  // Local filtering & memoization (TASK 2)
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const jd = item.job_descriptions || {};
      const title = (jd.job_title || '').toLowerCase();
      const company = (jd.company_name || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = title.includes(query) || company.includes(query);
      if (!matchesSearch) return false;

      const score = item.ats_score_after || 0;
      if (scoreFilter === 'High') return score >= 75;
      if (scoreFilter === 'Medium') return score >= 50 && score < 75;
      if (scoreFilter === 'Low') return score < 50;

      return true;
    });
  }, [history, searchQuery, scoreFilter]);

  // Download PDF Handler
  const handleDownload = async (id: string, company: string, title: string) => {
    setDownloadingId(id);
    try {
      const token = await getAuthToken();
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                          process.env.NEXT_PUBLIC_API_URL || 
                          'http://localhost:5000/api';
      
      const response = await fetch(
        `${BACKEND_URL}/tailor/${id}/pdf`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download PDF. Status: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${company.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Optimistic Delete Handler (TASK 3)
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this tailoring history record? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    const previousHistory = [...history];
    
    // 1. Instantly update UI (Optimistic UI)
    setHistory(history.filter(item => item.id !== id));
    setActiveKebabId(null);

    try {
      // 2. Perform backend API delete call
      await apiDelete(`/tailor/${id}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete history record. Re-adding to history list.');
      // 3. Rollback list on failure
      setHistory(previousHistory);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'text-accent-emerald';
    if (score >= 50) return 'text-accent-amber';
    return 'text-error';
  };

  const getLogoLetter = (company: string) => {
    if (!company) return 'J';
    return company.charAt(0).toUpperCase();
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) return 'Today';
      if (diffDays <= 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays} days ago`;
      if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto select-none">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-[28px] leading-[36px] font-bold text-white mb-2">Tailoring History</h1>
        <p className="font-sans text-[15px] text-[#9CA3AF]">
          All your tailored CVs, indexed by job.
        </p>
      </header>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full sm:w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
            search
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-[#1F2937] text-white pl-10 pr-4 py-2 rounded-[4px] focus:outline-none focus:border-[#4F8EF7] font-sans text-xs placeholder:text-[#4B5563] transition-colors" 
            placeholder="Search by job title or company..." 
            type="text"
          />
        </div>

        {/* Custom score filter dropdown menu */}
        <div className="relative" ref={filterDropdownRef}>
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="ghost-button flex items-center gap-2 px-4 py-2 rounded-[4px] font-mono text-label-mono uppercase text-xs cursor-pointer"
          >
            {scoreFilter === 'All' ? 'All scores' : `${scoreFilter} Match`}
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-[#1F2937] rounded-md shadow-2xl z-30 overflow-hidden animate-fade-in font-mono text-label-mono uppercase text-xs">
              <button 
                onClick={() => { setScoreFilter('All'); setShowFilterMenu(false); }}
                className="w-full px-4 py-3 text-left text-white hover:bg-surface-container-high transition-colors"
              >
                All scores
              </button>
              <button 
                onClick={() => { setScoreFilter('High'); setShowFilterMenu(false); }}
                className="w-full px-4 py-3 text-left text-accent-emerald hover:bg-surface-container-high transition-colors"
              >
                High (&gt;75)
              </button>
              <button 
                onClick={() => { setScoreFilter('Medium'); setShowFilterMenu(false); }}
                className="w-full px-4 py-3 text-left text-accent-amber hover:bg-surface-container-high transition-colors"
              >
                Medium (50-75)
              </button>
              <button 
                onClick={() => { setScoreFilter('Low'); setShowFilterMenu(false); }}
                className="w-full px-4 py-3 text-left text-error hover:bg-surface-container-high transition-colors"
              >
                Low (&lt;50)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card List (The History) */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const jd = item.job_descriptions || {};
            const company = jd.company_name || 'Target Corp';
            const title = jd.job_title || 'Target Position';
            const dateText = getFormattedDate(item.created_at);
            const scoreBefore = item.ats_score_before || 0;
            const scoreAfter = item.ats_score_after || 0;
            const improvement = Math.max(0, scoreAfter - scoreBefore);
            
            const matchedList = Array.isArray(item.keywords_matched) ? item.keywords_matched : [];
            const missingList = Array.isArray(item.keywords_missing) ? item.keywords_missing : [];
            const matchedCount = matchedList.length;
            const totalCount = matchedList.length + missingList.length;

            const isItemKebabActive = activeKebabId === item.id;

            return (
              <div 
                key={item.id} 
                className="bg-[#111827] border border-[#1F2937] rounded-[8px] p-6 flex flex-col lg:flex-row lg:items-center gap-6 relative group hover:border-[#374151] transition-all hover:border-l-2 hover:border-l-clinical-primary"
              >
                {/* Left: Logo & Info */}
                <div className="flex items-start gap-4 flex-grow">
                  <div className="w-10 h-10 rounded-full bg-[#1C2333] flex items-center justify-center border border-[#374151] shrink-0 text-white font-heading text-[18px]">
                    {getLogoLetter(company)}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[16px] font-bold text-white mb-1 leading-tight">
                      {title}
                    </h3>
                    <p className="text-[13px] text-[#9CA3AF] mb-3">
                      {company} · Optimized {dateText}
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-[#1C2333] text-[#9CA3AF] px-2 py-1 rounded-[4px] font-mono text-[10px] uppercase tracking-wide border border-[#374151]">
                        Engineering
                      </span>
                      <span className="bg-[#1C2333] text-[#9CA3AF] px-2 py-1 rounded-[4px] font-mono text-[10px] uppercase tracking-wide border border-[#374151]">
                        {item.processing_status || 'Complete'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Metrics */}
                <div className="flex flex-col items-start lg:items-end flex-shrink-0 min-w-[200px] border-t border-[#1F2937] lg:border-t-0 pt-4 lg:pt-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-mono text-[14px] flex items-center gap-2">
                      <span className="text-accent-amber font-semibold">{scoreBefore}</span>
                      <span className="text-[#4B5563] material-symbols-outlined text-[16px]">arrow_right_alt</span>
                      <span className={`font-bold ${getScoreColorClass(scoreAfter)}`}>{scoreAfter}</span>
                    </div>
                    <span className="bg-accent-emerald-subtle text-accent-emerald px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                      +{improvement} pts
                    </span>
                  </div>
                  <p className="text-[12px] text-[#4B5563] font-sans">
                    {matchedCount}/{totalCount} keywords matched
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 pt-4 lg:pt-0 mt-2 lg:mt-0 border-t border-[#1F2937] lg:border-t-0 w-full lg:w-auto justify-end relative">
                  <button 
                    onClick={() => router.push(`/results/${item.id}`)}
                    className="ghost-button px-3 py-1.5 rounded-[4px] font-mono text-label-mono uppercase text-[11px] cursor-pointer"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDownload(item.id, company, title)}
                    disabled={downloadingId === item.id}
                    className="ghost-button px-3 py-1.5 rounded-[4px] font-mono text-label-mono uppercase flex items-center gap-1.5 text-[11px] cursor-pointer disabled:opacity-50"
                  >
                    {downloadingId === item.id ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Downloading
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">download</span> 
                        PDF
                      </>
                    )}
                  </button>
                  
                  {/* Kebab Action Menu */}
                  <div className="relative" ref={isItemKebabActive ? kebabRef : undefined}>
                    <button 
                      onClick={() => setActiveKebabId(isItemKebabActive ? null : item.id)}
                      className="text-[#9CA3AF] hover:text-white p-1 ml-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                    
                    {isItemKebabActive && (
                      <div className="absolute right-0 bottom-full lg:bottom-auto lg:top-full mt-1 mb-2 lg:mb-0 w-36 bg-[#111827] border border-[#1F2937] rounded-md shadow-2xl z-20 overflow-hidden font-mono text-label-mono uppercase text-[11px]">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-full px-4 py-2.5 text-left text-error hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-16 border-2 border-dashed border-[#1F2937] rounded-[8px] p-12 flex flex-col items-center justify-center text-center bg-[#111827]/50 select-none animate-fade-in">
          <div className="w-16 h-16 bg-[#1C2333] rounded-full flex items-center justify-center mb-6 border border-[#1F2937]">
            <span className="material-symbols-outlined text-[32px] text-[#9CA3AF]">description</span>
          </div>
          <h3 className="text-[20px] font-bold text-white mb-2">No tailored CVs yet</h3>
          <p className="text-[#9CA3AF] font-sans text-sm max-w-md mb-8 leading-relaxed">
            Start by uploading your master CV and pasting a job description to optimize.
          </p>
          <button 
            onClick={() => router.push('/cv')}
            className="bg-clinical-primary text-[#001a40] px-6 py-3 rounded-[6px] font-mono text-label-mono font-bold uppercase hover:brightness-110 shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            Tailor My First Resume
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
