import React from 'react';
import Navbar from '../../components/layout/Navbar';

export const metadata = {
  title: 'ResuMatch — AI Resume Optimizer That Beats ATS',
  description: 'Free AI tool that rewrites your resume to match any job description and pass ATS systems. No credit card required.',
  openGraph: {
    title: 'ResuMatch — AI Resume Optimizer That Beats ATS',
    description: 'Free AI tool that rewrites your resume to match any job description and pass ATS systems. No credit card required.',
    type: 'website',
    locale: 'en_US',
    url: 'https://resumatch.io',
    siteName: 'ResuMatch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResuMatch — AI Resume Optimizer That Beats ATS',
    description: 'Free AI tool that rewrites your resume to match any job description and pass ATS systems. No credit card required.',
  }
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-on-surface">
      {/* Dynamic Navigation Bar */}
      <Navbar />
      
      {/* Layout Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Background radial gradient shader */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,rgba(79,142,247,0.03),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.02),transparent_40%)]"></div>
    </div>
  );
}
