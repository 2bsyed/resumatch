import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '../../../../lib/supabase';
import ResultsClient from './ResultsClient';

interface PageProps {
  params: {
    tailorId: string;
  };
}

export default async function ResultsPage({ params }: PageProps) {
  const { tailorId } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore as any);

  // Authenticate user first
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    redirect('/login');
  }

  // Load tailored CV data, joining associated tables
  const { data: tailored, error: fetchErr } = await supabase
    .from('tailored_cvs')
    .select(`
      id,
      ats_score_before,
      ats_score_after,
      tailored_cv_json,
      keywords_matched,
      keywords_missing,
      changes_summary,
      processing_status,
      job_descriptions (
        job_title,
        company_name,
        raw_text,
        extracted_keywords
      ),
      master_cvs (
        cv_json
      )
    `)
    .eq('id', tailorId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !tailored) {
    console.error('Fetch tailored CV error:', fetchErr);
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto text-error select-none">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>
        <h1 className="text-xl text-white font-bold font-heading">Failed to load tailoring results</h1>
        <p className="text-[#9CA3AF] text-sm max-w-md mx-auto">
          The requested tailoring result does not exist, or you do not have permission to view it.
        </p>
        <div className="pt-4">
          <a 
            href="/dashboard" 
            className="px-6 py-2.5 bg-clinical-primary text-[#001a40] rounded-[6px] font-mono text-label-mono uppercase font-bold hover:brightness-110 shadow-lg cursor-pointer"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <ResultsClient data={tailored} />;
}
