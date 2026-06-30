import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '../../../lib/supabase';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore as any);

  // Authenticate user first
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    redirect('/login');
  }

  // Fetch tailored CVs directly from Supabase, joining associated tables
  const { data, error } = await supabase
    .from('tailored_cvs')
    .select(`
      id,
      created_at,
      ats_score_before,
      ats_score_after,
      keywords_matched,
      keywords_missing,
      processing_status,
      job_descriptions (
        job_title,
        company_name,
        raw_text,
        extracted_keywords
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch history error:', error);
  }

  return <HistoryClient initialHistory={data || []} />;
}
