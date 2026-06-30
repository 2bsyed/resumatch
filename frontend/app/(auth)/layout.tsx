import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '../../lib/supabase';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Server-side session check
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen w-full bg-background text-on-surface font-sans flex flex-col md:flex-row antialiased">
      {children}
    </div>
  );
}
