import { supabase } from '../db/supabase';
import * as geminiService from '../services/gemini.service';
import * as scorerService from '../services/scorer.service';

export function buildCvText(cvJson: any): string {
  const parts: string[] = [];
  if (cvJson.personal) {
    parts.push(cvJson.personal.full_name || '');
    parts.push(cvJson.personal.summary || '');
  }
  if (Array.isArray(cvJson.experience)) {
    cvJson.experience.forEach((job: any) => {
      parts.push(job.company || '');
      parts.push(job.title || '');
      if (Array.isArray(job.bullets)) {
        parts.push(...job.bullets);
      }
    });
  }
  if (Array.isArray(cvJson.education)) {
    cvJson.education.forEach((edu: any) => {
      parts.push(edu.institution || '');
      parts.push(edu.degree || '');
      parts.push(edu.field || '');
    });
  }
  if (cvJson.skills) {
    if (Array.isArray(cvJson.skills.technical)) parts.push(...cvJson.skills.technical);
    if (Array.isArray(cvJson.skills.soft)) parts.push(...cvJson.skills.soft);
    if (Array.isArray(cvJson.skills.tools)) parts.push(...cvJson.skills.tools);
    if (Array.isArray(cvJson.skills.languages)) parts.push(...cvJson.skills.languages);
  }
  return parts.filter(Boolean).join(' ');
}

export function applyRewrites(cvJson: any, rewrites: any[]): any {
  const newCv = JSON.parse(JSON.stringify(cvJson));
  if (!Array.isArray(newCv.experience)) return newCv;

  newCv.experience.forEach((exp: any) => {
    if (!Array.isArray(exp.bullets)) return;
    exp.bullets = exp.bullets.map((bullet: string, idx: number) => {
      const bulletId = `${exp.id}-${idx}`;
      const match = rewrites.find((r: any) => r.id === bulletId);
      return match ? match.rewritten : bullet;
    });
  });
  return newCv;
}

export function reorderForAts(cvJson: any, keywords: string[]): any {
  const newCv = JSON.parse(JSON.stringify(cvJson));
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  // Sort bullets within each job experience
  if (Array.isArray(newCv.experience)) {
    newCv.experience.forEach((exp: any) => {
      if (!Array.isArray(exp.bullets)) return;
      exp.bullets.sort((a: string, b: string) => {
        const scoreA = lowerKeywords.filter(kw => a.toLowerCase().includes(kw)).length;
        const scoreB = lowerKeywords.filter(kw => b.toLowerCase().includes(kw)).length;
        return scoreB - scoreA; // Descending order
      });
    });
  }

  // Move matched skills to the top of technical skills array
  if (newCv.skills && Array.isArray(newCv.skills.technical)) {
    const tech = newCv.skills.technical;
    const matched = tech.filter((skill: string) =>
      lowerKeywords.some(kw => skill.toLowerCase().includes(kw) || kw.includes(skill.toLowerCase()))
    );
    const unmatched = tech.filter((skill: string) =>
      !lowerKeywords.some(kw => skill.toLowerCase().includes(kw) || kw.includes(skill.toLowerCase()))
    );
    newCv.skills.technical = [...matched, ...unmatched];
  }

  return newCv;
}

export async function tailorCvWorker(
  jobId: string,
  userId: string,
  masterCvId: string,
  jdId: string,
  tailoredCvId: string
) {
  const updateJob = async (step: number, status?: string) => {
    await supabase.from('processing_jobs').update({
      progress_step: step,
      status: status || 'processing',
      started_at: step === 1 ? new Date().toISOString() : undefined
    }).eq('id', jobId);
  };

  try {
    // STEP 1: Load master CV and JD from DB
    await updateJob(1);
    const [cvResult, jdResult] = await Promise.all([
      supabase.from('master_cvs').select('*')
        .eq('id', masterCvId).single(),
      supabase.from('job_descriptions').select('*')
        .eq('id', jdId).single()
    ]);
    
    if (cvResult.error || !cvResult.data) throw new Error('Master CV not found');
    if (jdResult.error || !jdResult.data) throw new Error('Job description not found');

    const cvJson = cvResult.data.cv_json;
    const jdText = jdResult.data.raw_text;

    // STEP 2: Analyze JD (get structured analysis)
    await updateJob(2);
    const jdAnalysis = jdResult.data.extracted_keywords?.job_title
      ? jdResult.data.extracted_keywords  // Already analyzed
      : await geminiService.analyzeJobDescription(jdText);

    // Update job description extracted_keywords if it wasn't saved yet
    if (!jdResult.data.extracted_keywords?.job_title) {
      await supabase
        .from('job_descriptions')
        .update({ extracted_keywords: jdAnalysis })
        .eq('id', jdId);
    }

    // Update tailored_cvs status to processing
    await supabase
      .from('tailored_cvs')
      .update({ processing_status: 'processing' })
      .eq('id', tailoredCvId);

    // STEP 3: Score CV against JD (before tailoring)
    await updateJob(3);
    const fullCvText = buildCvText(cvJson); // flatten cv to string
    const scoreBefore = await scorerService.calculateAtsScore(
      fullCvText, jdText, jdAnalysis.top_10_ats_keywords || []
    );

    // STEP 4: Identify bullets to rewrite
    // Score each experience bullet against the JD
    const bulletScores: any[] = [];
    if (cvJson && Array.isArray(cvJson.experience)) {
      for (const exp of cvJson.experience) {
        if (Array.isArray(exp.bullets)) {
          for (let idx = 0; idx < exp.bullets.length; idx++) {
            const bullet = exp.bullets[idx];
            // Compute semantic similarity of individual bullet against JD
            const score = await scorerService.calculateSemanticScore(bullet, jdText);
            bulletScores.push({ 
              id: `${exp.id}-${idx}`,
              expId: exp.id,
              bullet,
              score: score / 100, // Normalize to 0-1 range (score is 0-100)
              expTitle: exp.title,
              expCompany: exp.company
            });
          }
        }
      }
    }
    
    // Bullets with semantic score < 0.45 get rewritten
    // (If all bullets are high-scoring, take the lowest scoring ones regardless)
    let bulletsToRewrite = bulletScores.filter(b => b.score < 0.45);
    if (bulletsToRewrite.length === 0 && bulletScores.length > 0) {
      bulletsToRewrite = [...bulletScores];
    }
    
    bulletsToRewrite = bulletsToRewrite
      .sort((a, b) => a.score - b.score)
      .slice(0, 12); // Max 12 bullets to rewrite

    // STEP 4 cont: Call Gemini to rewrite bullets
    const formattedBullets = bulletsToRewrite.map(b => ({
      id: b.id,
      text: b.bullet
    }));

    const tailorResult = await geminiService.tailorCvBullets(
      cvJson, jdAnalysis, formattedBullets
    );

    // STEP 5: Apply rewrites to cv_json
    const tailoredCvJson = applyRewrites(cvJson, tailorResult.rewrites);
    
    // Reorder experience bullets (highest scoring first)
    // Move matched skills to top of skills.technical array
    const reorderedCvJson = reorderForAts(
      tailoredCvJson, jdAnalysis.top_10_ats_keywords || []
    );

    // STEP 6: Calculate after-tailoring score
    const fullTailoredText = buildCvText(reorderedCvJson);
    const scoreAfter = await scorerService.calculateAtsScore(
      fullTailoredText, jdText, jdAnalysis.top_10_ats_keywords || []
    );

    // STEP 7: Save everything to DB
    const changesSummary = {
      bullets_rewritten: tailorResult.rewrites.length,
      keywords_added: tailorResult.rewrites
        .flatMap(r => r.keywords_added || []).length,
      bullets_removed: 0,
      sections_reordered: 1
    };

    await supabase.from('tailored_cvs').update({
      tailored_cv_json: reorderedCvJson,
      ats_score_before: scoreBefore.composite,
      ats_score_after: scoreAfter.composite,
      keywords_matched: scoreAfter.matched,
      keywords_missing: scoreAfter.missing,
      changes_summary: changesSummary,
      processing_status: 'complete'
    }).eq('id', tailoredCvId);

    await supabase.from('processing_jobs').update({
      status: 'complete',
      progress_step: 4,
      completed_at: new Date().toISOString()
    }).eq('id', jobId);

  } catch (error: any) {
    console.error('Tailor worker execution error:', error);
    await supabase.from('tailored_cvs').update({
      processing_status: 'failed',
      error_message: error.message
    }).eq('id', tailoredCvId);
    
    await supabase.from('processing_jobs').update({
      status: 'error',
      error_message: error.message
    }).eq('id', jobId);
  }
}
