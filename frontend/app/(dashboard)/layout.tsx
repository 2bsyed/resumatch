import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import SupabaseProvider from '../../components/providers/supabase-provider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabaseServer = createServerClient(cookieStore);

  // Server-side session validation
  const { data: { session } } = await supabaseServer.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <SupabaseProvider>
      <div className="min-h-screen bg-[#0A0E1A] text-on-surface font-sans flex antialiased">
        {/* Fixed left sidebar */}
        <Sidebar />

        {/* Dynamic content panel on the right */}
        <div className="flex-1 ml-64 bg-[#0A0E1A] overflow-y-auto h-screen w-full relative">
          {children}
        </div>
      </div>
    </SupabaseProvider>
  );
}
