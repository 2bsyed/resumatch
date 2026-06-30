'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';

export default function LandingPage() {
  // Add Scroll animations via Intersection Observer (TASK 2)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-4');
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-on-surface">
      {/* Dynamic Navigation Bar */}
      <Navbar />
      
      {/* Layout Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 py-16 flex flex-col gap-32">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center pt-16 max-w-3xl mx-auto animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 select-none">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C2333]/60 border border-[#1F2937] mb-8 shadow-sm">
            <span className="font-mono text-label-mono text-secondary uppercase tracking-wider text-[11px] font-bold">
              ✦ Free · No credit card · AI-powered
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-white mb-6 font-heading font-extrabold text-[42px] md:text-[60px] leading-[1.15] tracking-tight">
            Your resume is good.<br />
            The <span className="text-clinical-primary">bots</span> disagree.
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-[16px] md:text-[18px] text-[#9CA3AF] mb-10 max-w-2xl leading-relaxed">
            ResuMatch analyzes any job description and rewrites your CV to match the exact keywords ATS systems look for — without fabricating a single word.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="bg-clinical-primary text-[#001a40] font-mono text-label-mono font-bold px-8 py-3.5 rounded uppercase tracking-wider hover:brightness-110 btn-glow transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto text-xs"
              style={{ borderRadius: '6px', boxShadow: '0 0 20px rgba(79, 142, 247, 0.3)' }}
            >
              Upload My Resume
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <a 
              href="#how-it-works" 
              className="border border-[#1F2937] text-white font-mono text-label-mono px-8 py-3.5 rounded uppercase tracking-wider hover:bg-[#151c25]/80 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto text-xs"
              style={{ borderRadius: '6px' }}
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              See how it works
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3.5 text-[#9CA3AF]">
            <div className="flex -space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1C2333] border-2 border-[#0A0E1A] flex items-center justify-center text-[10px] font-bold text-white select-none">A</div>
              <div className="w-8 h-8 rounded-full bg-[#232a34] border-2 border-[#0A0E1A] flex items-center justify-center text-[10px] font-bold text-white select-none">M</div>
              <div className="w-8 h-8 rounded-full bg-[#2e353f] border-2 border-[#0A0E1A] flex items-center justify-center text-[10px] font-bold text-white select-none">T</div>
            </div>
            <span className="font-sans text-body-small text-[13px]">
              Join 4,200+ job seekers landing interviews.
            </span>
          </div>
        </section>

        {/* ATS SCORE DEMO WIDGET */}
        <section className="flex flex-col items-center gap-12 py-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
          <div className="text-center space-y-2">
            <h2 className="font-heading font-semibold text-[22px] text-white">Optimize matching in seconds</h2>
            <p className="font-sans text-sm text-[#9CA3AF]">Instantly bypass screening algorithms with custom keywords</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-16 select-none">
            {/* Before match */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-44 h-44 rounded-full border-[8px] border-[#1C2333] flex items-center justify-center" style={{ borderColor: '#F59E0B' }}>
                <span className="font-mono text-[36px] font-bold text-[#F59E0B]">41%</span>
              </div>
              <span className="font-mono text-label-mono text-[#9CA3AF] uppercase text-[11px] tracking-wider">
                Before ResuMatch
              </span>
            </div>

            {/* Connection arrow */}
            <span className="material-symbols-outlined text-[48px] text-secondary hidden md:block" style={{ fontVariationSettings: "'wght' 300" }}>
              trending_flat
            </span>

            {/* After match */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-56 h-56 rounded-full border-[8px] border-[#1C2333] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)]" style={{ borderColor: '#10B981' }}>
                <span className="font-mono text-[48px] font-bold text-[#10B981] drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">87%</span>
              </div>
              <span className="font-mono text-label-mono text-[#10B981] uppercase text-[11px] tracking-wider font-bold">
                After ResuMatch
              </span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="space-y-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-bold text-[28px] text-white">How it works</h2>
            <p className="font-sans text-[#9CA3AF] text-sm leading-relaxed">
              ResuMatch structures resume sections and rewrites work bullet statements in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Step 1 */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-4">
              <div className="w-10 h-10 rounded-full bg-clinical-primary/10 border border-clinical-primary/30 flex items-center justify-center font-mono text-[14px] text-clinical-primary font-bold">
                1
              </div>
              <h3 className="font-heading font-semibold text-[18px] text-white">Upload Base CV</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Upload your master resume in PDF or Word formats, or copy paste raw CV texts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-4">
              <div className="w-10 h-10 rounded-full bg-clinical-primary/10 border border-clinical-primary/30 flex items-center justify-center font-mono text-[14px] text-clinical-primary font-bold">
                2
              </div>
              <h3 className="font-heading font-semibold text-[18px] text-white">Target Position</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Paste the target job description. Our engine will map out required ATS technical skills.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center font-mono text-[14px] text-secondary font-bold">
                3
              </div>
              <h3 className="font-heading font-semibold text-[18px] text-white">Optimize CV</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Get rewritten matching accomplishments bullets and download optimized PDF resumes.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section className="space-y-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-bold text-[28px] text-white">Features Built for Conversion</h2>
            <p className="font-sans text-[#9CA3AF] text-sm leading-relaxed">
              Get more interviews by matching the exact details companies search for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Card 1 */}
            <div className="md:col-span-3 bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-3 relative overflow-hidden">
              <span className="material-symbols-outlined text-clinical-primary text-3xl">psychology</span>
              <h3 className="font-heading font-semibold text-[18px] text-white">Semantic AI Rewrite</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Understand job roles contextually. Injects matching achievements using natural phrasing instead of plain keyword lists.
              </p>
            </div>

            {/* Card 2 */}
            <div className="md:col-span-3 bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-3 relative overflow-hidden">
              <span className="material-symbols-outlined text-secondary text-3xl">speed</span>
              <h3 className="font-heading font-semibold text-[18px] text-white">ONNX Scoring Models</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Get immediate ATS match grades using our local semantic sentence embedding models pre-warmed on server boot.
              </p>
            </div>

            {/* Card 3 */}
            <div className="md:col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-3">
              <span className="material-symbols-outlined text-[#F59E0B] text-3xl">download</span>
              <h3 className="font-heading font-semibold text-[18px] text-white">A4 PDF Downloads</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Export resumes generated in clean, parser-friendly single column layouts with basic system fonts.
              </p>
            </div>

            {/* Card 4 */}
            <div className="md:col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-3">
              <span className="material-symbols-outlined text-secondary text-3xl">shield</span>
              <h3 className="font-heading font-semibold text-[18px] text-white">Data Privacy</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                No selling of user information. Profile documents are protected by strict Row-Level-Security rules.
              </p>
            </div>

            {/* Card 5 */}
            <div className="md:col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 space-y-3">
              <span className="material-symbols-outlined text-clinical-primary text-3xl">history</span>
              <h3 className="font-heading font-semibold text-[18px] text-white">Optimization Logs</h3>
              <p className="font-sans text-sm text-[#9CA3AF] leading-relaxed">
                Track versions history and maintain lists of customized resumes indexed by target companies.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="space-y-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 flex flex-col items-center">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-bold text-[28px] text-white">No paywalls. No nonsense.</h2>
            <p className="font-sans text-[#9CA3AF] text-sm leading-relaxed">
              Free resume optimizations designed to help everyone land their dream job.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="w-full max-w-[400px] bg-[#111827] border border-[#1F2937] rounded-xl p-8 flex flex-col gap-6 shadow-2xl relative select-none">
            <div className="absolute top-4 right-4 bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full">
              <span className="font-mono text-[10px] text-secondary uppercase font-bold tracking-wider">Active</span>
            </div>
            <div>
              <span className="font-mono text-label-mono text-clinical-primary uppercase text-[11px] tracking-wider font-bold">
                Starter Plan
              </span>
              <h3 className="font-heading font-bold text-[24px] text-white mt-1">Free Forever</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[36px] font-extrabold text-white">$0</span>
              <span className="font-sans text-sm text-[#9CA3AF]">/ month</span>
            </div>
            
            <ul className="space-y-3 text-sm text-[#9CA3AF] font-sans">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                Unlimited Resume Uploads
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                AI keyword gap analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                12 bullet rewrites per CV run
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                ATS-friendly PDF exports
              </li>
            </ul>

            <Link 
              href="/register" 
              className="w-full py-3 bg-clinical-primary text-[#001a40] rounded-[6px] font-mono text-label-mono uppercase font-bold hover:brightness-110 shadow-lg text-center cursor-pointer text-xs mt-2"
            >
              Optimize My Resume Free
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-16 border-t border-[#1F2937] flex flex-col md:flex-row justify-between items-center gap-6 text-[#9CA3AF] font-sans text-sm select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 bg-clinical-primary rounded-sm"></div>
            <span className="font-heading text-[16px] font-bold text-white tracking-tight">
              ResuMatch
            </span>
          </div>
          
          <p className="text-[13px] text-[#4B5563] text-center md:text-left">
            © {new Date().getFullYear()} ResuMatch. All rights reserved. Free AI Resume Optimization Engine.
          </p>

          <div className="flex gap-6 text-[13px]">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </footer>

      </div>

      {/* Background radial gradient shader */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,rgba(79,142,247,0.03),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.02),transparent_40%)]"></div>
    </div>
  );
}
