'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 h-16 flex items-center justify-between px-6 md:px-10 backdrop-blur-sm ${
      scrolled ? 'bg-[#0A0E1A]/95 border-b border-[#1F2937]/80 shadow-lg' : 'bg-transparent border-b border-transparent'
    }`}>
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-5 h-5 bg-clinical-primary rounded-sm shadow-[0_0_8px_rgba(79,142,247,0.4)] group-hover:scale-110 transition-transform"></div>
        <span className="font-heading text-lg font-bold text-white tracking-tight select-none">
          ResuMatch
        </span>
      </Link>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-8">
        <a 
          href="#how-it-works" 
          className="text-[#9CA3AF] font-medium hover:text-white transition-colors duration-200 select-none text-sm"
        >
          How it works
        </a>
        <Link 
          href="/login" 
          className="text-[#9CA3AF] font-medium hover:text-white transition-colors duration-200 select-none text-sm"
        >
          Sign in
        </Link>
        <Link 
          href="/register" 
          className="bg-clinical-primary text-[#001a40] font-mono text-[11px] font-bold px-4 py-2.5 rounded uppercase tracking-wider hover:brightness-110 btn-glow transition-all duration-200 select-none"
          style={{ borderRadius: '6px', boxShadow: '0 0 16px rgba(79, 142, 247, 0.3)' }}
        >
          Get Started Free
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-white flex items-center justify-center p-2 cursor-pointer focus:outline-none"
      >
        <span className="material-symbols-outlined text-2xl">
          {mobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#0A0E1A]/95 border-b border-[#1F2937] backdrop-blur-md flex flex-col p-6 gap-4 animate-fade-in md:hidden font-mono text-label-mono uppercase text-xs">
          <a 
            href="#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#9CA3AF] hover:text-white py-2 border-b border-[#1F2937]/40 transition-colors"
          >
            How it works
          </a>
          <Link 
            href="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#9CA3AF] hover:text-white py-2 border-b border-[#1F2937]/40 transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/register" 
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-3 bg-clinical-primary text-[#001a40] rounded font-bold transition-all shadow-[0_0_12px_rgba(79,142,247,0.3)] mt-2"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
