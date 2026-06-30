import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { analyzeJobDescription } from '../services/gemini.service';
import { calculateAtsScore } from '../services/scorer.service';
import { tailorCvWorker } from '../workers/tailor-cv.worker';
import { generateCvPdf } from '../services/pdf.service';
import rateLimit from 'express-rate-limit';

const router = Router();

// Require auth for all tailor routes
router.use(authMiddleware);

// TASK 2: POST /api/tailor/analyze — Quick analysis (no tailoring yet)
router.post('/analyze', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }
  const { masterCvId, jdText, jobTitle, companyName } = req.body;

  if (!masterCvId || !jdText) {
    return res.status(400).json({ error: 'Missing required fields: masterCvId, jdText' });
  }

  try {
    // 1. Validate master CV belongs to user
    const { data: cv, error: cvErr } = await supabase
      .from('master_cvs')
      .select('raw_text, cv_json')
      .eq('id', masterCvId)
      .eq('user_id', userId)
      .single();

    if (cvErr || !cv) {
      return res.status(404).json({ error: 'Master CV not found or access denied' });
    }

    // 2. Call Gemini to analyze job description
    const jdAnalysis = await analyzeJobDescription(jdText);

    // 3. Save JD and analysis to job_descriptions table
    const { data: jd, error: jdErr } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: userId,
        raw_text: jdText,
        job_title: jobTitle || jdAnalysis.job_title || 'Target Position',
        company_name: companyName || jdAnalysis.company_name || 'Target Corp',
        extracted_keywords: jdAnalysis // Store full analysis inside JSONB
      })
      .select()
      .single();

    if (jdErr) throw jdErr;

    // 4. Calculate initial ATS score
    const score = await calculateAtsScore(cv.raw_text, jdText, jdAnalysis.top_10_ats_keywords);

    return res.json({
      success: true,
      jdId: jd.id,
      jdAnalysis,
      initialScore: score.composite,
      matched: score.matched,
      missing: score.missing
    });

  } catch (error: any) {
    console.error('JD analysis error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze job description' });
  }
});

const tailorStartLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 start commands per hour per user
  keyGenerator: (req: any) => req.user?.id || req.ip,
  message: { error: 'Rate limit reached. Please wait before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// TASK 2: POST /api/tailor/start — Kick off async tailoring job
router.post('/start', tailorStartLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }
  const { masterCvId, jdId } = req.body;

  if (!masterCvId || !jdId) {
    return res.status(400).json({ error: 'Missing required fields: masterCvId, jdId' });
  }

  try {
    // 1. Create tailored_cvs row with status 'pending'
    const { data: tailored, error: tailErr } = await supabase
      .from('tailored_cvs')
      .insert({
        user_id: userId,
        master_cv_id: masterCvId,
        job_description_id: jdId,
        tailored_cv_json: {},
        ats_score_before: 0,
        ats_score_after: 0,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (tailErr) throw tailErr;

    // 2. Create processing_jobs row with status 'queued'
    const { data: job, error: jobErr } = await supabase
      .from('processing_jobs')
      .insert({
        user_id: userId,
        job_type: 'tailor_cv',
        reference_id: jdId,
        status: 'queued',
        progress_step: 1,
        progress_total: 4
      })
      .select()
      .single();

    if (jobErr) throw jobErr;

    // 3. Trigger worker asynchronously using setImmediate
    setImmediate(() => {
      tailorCvWorker(job.id, userId, masterCvId, jdId, tailored.id);
    });

    // 4. Immediately return IDs to frontend
    return res.json({
      success: true,
      tailoredCvId: tailored.id,
      jobId: job.id
    });

  } catch (error: any) {
    console.error('Start tailoring error:', error);
    return res.status(500).json({ error: error.message || 'Failed to start tailoring job' });
  }
});

// TASK 2: GET /api/tailor/status/:jobId — Poll job status
router.get('/status/:jobId', async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }

  try {
    const { data: job, error: jobErr } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (jobErr || !job) {
      return res.status(404).json({ error: 'Job not found or access denied' });
    }

    // Get corresponding tailored CV ID
    const { data: tailored, error: tailErr } = await supabase
      .from('tailored_cvs')
      .select('id')
      .eq('job_description_id', job.reference_id)
      .eq('user_id', userId)
      .maybeSingle();

    return res.json({
      status: job.status,
      progressStep: job.progress_step,
      progressTotal: job.progress_total,
      tailoredCvId: tailored?.id || null,
      error: job.error_message || null
    });

  } catch (error: any) {
    console.error('Job status fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch job status' });
  }
});

// TASK 2: GET /api/tailor/history — Get all tailored CVs for user (paginated)
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select(`
        id,
        created_at,
        ats_score_before,
        ats_score_after,
        processing_status,
        job_descriptions (
          job_title,
          company_name,
          raw_text
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.json(data);
  } catch (error: any) {
    console.error('History fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch history' });
  }
});

// TASK 2: GET /api/tailor/:tailoredCvId — Get completed result
router.get('/:tailoredCvId', async (req: AuthenticatedRequest, res: Response) => {
  const { tailoredCvId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }

  try {
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select(`
        *,
        job_descriptions (
          job_title,
          company_name,
          raw_text,
          extracted_keywords
        )
      `)
      .eq('id', tailoredCvId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Tailored CV not found or access denied' });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Tailored CV fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch tailored CV' });
  }
});

// GET /api/tailor/:tailoredCvId/pdf — Generate and download CV PDF
router.get('/:tailoredCvId/pdf', async (req: AuthenticatedRequest, res: Response) => {
  const { tailoredCvId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }

  try {
    const { data: tailored, error } = await supabase
      .from('tailored_cvs')
      .select(`
        *,
        job_descriptions (
          job_title,
          company_name
        )
      `)
      .eq('id', tailoredCvId)
      .eq('user_id', userId)
      .single();

    if (error || !tailored) {
      return res.status(404).json({ error: 'Tailored CV not found or access denied' });
    }

    const cvJson = tailored.tailored_cv_json;
    if (!cvJson || Object.keys(cvJson).length === 0) {
      return res.status(400).json({ error: 'Tailored CV document is empty or processing has not finished' });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateCvPdf(cvJson);

    const jobTitle = tailored.job_descriptions?.job_title || 'role';
    const companyName = tailored.job_descriptions?.company_name || 'company';
    const sanitizedTitle = jobTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sanitizedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${sanitizedCompany}-${sanitizedTitle}.pdf"`);
    return res.send(pdfBuffer);

  } catch (error: any) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate PDF document' });
  }
});

// DELETE /api/tailor/:id — Delete a tailored CV
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }

  try {
    const { error } = await supabase
      .from('tailored_cvs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true, message: 'Tailored CV deleted successfully' });
  } catch (error: any) {
    console.error('Delete tailored CV error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete tailored CV' });
  }
});

export const tailorRouter = router;
