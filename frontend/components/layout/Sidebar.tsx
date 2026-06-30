'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Alex Chen');
  const [userInitials, setUserInitials] = useState('AC');

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Alex Chen';
        setUserName(fullName);
        
        // Extract initials
        const initials = fullName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials || 'US');
      }
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'My Master CV', path: '/cv', icon: 'description' },
    { label: 'New Tailoring', path: '/tailor', icon: 'auto_fix_high' },
    { label: 'History', path: '/history', icon: 'history' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-4 z-40">
      {/* Brand / Header */}
      <div className="px-6 py-6 mb-2">
        <Link href="/dashboard">
          <h1 className="font-heading font-bold text-headline-h2 text-primary tracking-tight cursor-pointer">
            ResuMatch
          </h1>
        </Link>
      </div>

      {/* User Profile Area */}
      <div className="px-6 pb-6 flex items-center gap-3 border-b border-outline-variant/30 mb-4">
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm select-none">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">{userName}</div>
          <div className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
            Professional Tier
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex 
                items-center 
                gap-3 
                px-4 
                py-3 
                transition-all 
                duration-200
                font-mono
                text-[11px]
                tracking-wider
                uppercase
                font-semibold
                ${
                  isActive
                    ? 'text-primary bg-primary-container/10 border-l-2 border-primary opacity-90'
                    : 'text-on-surface-variant hover:bg-surface-container-highest opacity-70 hover:opacity-100'
                }
              `}
            >
              {/* Material Symbols Outlined Icon replacement */}
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Card */}
      <div className="p-4 mt-auto">
        <div className="bg-[#1C2333] border border-outline-variant/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
              GEMINI AI
            </span>
            <span className="material-symbols-outlined text-primary text-sm">
              bolt
            </span>
          </div>
          <div className="text-xs text-on-surface-variant mb-2">Daily uses: 3/10</div>
          <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden mb-3">
            <div className="h-full w-[30%] pulse-bar rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-secondary">Free plan · Unlimited</span>
            <Link className="font-mono text-label-mono text-primary hover:text-primary-fixed uppercase text-[10px] font-bold" href="#">
              UPGRADE
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col gap-1 px-2">
          <Link 
            href="#" 
            className="flex items-center gap-3 px-2 py-2 text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200 text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">help</span>
            Help Center
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-2 py-2 text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200 text-sm font-medium w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
