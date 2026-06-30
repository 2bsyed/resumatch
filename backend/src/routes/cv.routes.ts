import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import * as extractorService from '../services/extractor.service';
import * as geminiService from '../services/gemini.service';
import rateLimit from 'express-rate-limit';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    req: Request, 
    file: Express.Multer.File, 
    cb: FileFilterCallback
  ) => {
    const allowed = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT allowed.'));
    }
  }
});

const cvUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 uploads per hour per user
  keyGenerator: (req: any) => req.user?.id || req.ip,
  message: { error: 'Rate limit reached. Please wait before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// TASK 3: Implement POST /api/cv/upload
router.post('/upload', authMiddleware, cvUploadLimiter, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }
    let rawText = '';
    
    // Handle file upload OR pasted text (supporting raw_text or pastedText keys)
    if (req.file) {
      rawText = await extractorService.extractText(
        req.file.buffer, 
        req.file.mimetype
      );
    } else if (req.body.raw_text) {
      rawText = req.body.raw_text;
    } else if (req.body.pastedText) {
      rawText = req.body.pastedText;
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }
    
    // Validate minimum length
    if (rawText.trim().length < 200) {
      return res.status(400).json({ 
        error: 'CV text too short. Please provide a complete resume.' 
      });
    }
    
    // Parse with Gemini
    const cvJson = await geminiService.parseCvToJson(rawText);
    
    // Deactivate previous active CV
    await supabase
      .from('master_cvs')
      .update({ is_active: false })
      .eq('user_id', userId);
    
    // Determine file_type string
    let fileType: 'pdf' | 'docx' | 'txt' | 'paste' = 'paste';
    if (req.file) {
      if (req.file.mimetype.includes('pdf')) {
        fileType = 'pdf';
      } else if (req.file.mimetype.includes('text') || req.file.mimetype.includes('txt')) {
        fileType = 'txt';
      } else {
        fileType = 'docx';
      }
    }

    // Save to Supabase
    const { data: masterCv, error } = await supabase
      .from('master_cvs')
      .insert({
        user_id: userId,
        raw_text: rawText,
        cv_json: cvJson,
        file_type: fileType,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return res.json({ 
      success: true,
      masterCvId: masterCv.id,
      cvJson: masterCv.cv_json,
      message: 'CV parsed successfully'
    });
    
  } catch (error: any) {
    console.error('CV upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to parse CV' 
    });
  }
});

// TASK 4: Implement GET /api/cv/active (must come before /:id parameter matching)
router.get('/active', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }
    const { data, error } = await supabase
      .from('master_cvs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // standard supabase-js handler for optional single record
    
    if (error && error.code !== 'PGRST116') throw error;
    return res.json({ masterCv: data || null });
  } catch (error: any) {
    console.error('Active CV fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch active CV' });
  }
});

// GET /api/cv/:id - Fetch a specific master CV
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }
    const { data, error } = await supabase
      .from('master_cvs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'CV not found' });
      }
      throw error;
    }
    return res.json({ masterCv: data });
  } catch (error: any) {
    console.error('CV fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch CV' });
  }
});

// PUT /api/cv/:id - Update (re-parse) existing CV
router.put('/:id', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }
    const cvId = req.params.id;
    let rawText = '';
    
    // Check if new file is uploaded or raw text is provided
    if (req.file) {
      rawText = await extractorService.extractText(
        req.file.buffer, 
        req.file.mimetype
      );
    } else if (req.body.raw_text) {
      rawText = req.body.raw_text;
    } else if (req.body.pastedText) {
      rawText = req.body.pastedText;
    }
    
    // If no text provided, load the existing raw text
    if (!rawText) {
      const { data: existingCv, error: fetchErr } = await supabase
        .from('master_cvs')
        .select('raw_text')
        .eq('id', cvId)
        .eq('user_id', userId)
        .single();
      
      if (fetchErr || !existingCv) {
        return res.status(404).json({ error: 'CV not found or access denied' });
      }
      rawText = existingCv.raw_text;
    }
    
    // Validate length
    if (rawText.trim().length < 200) {
      return res.status(400).json({ 
        error: 'CV text too short. Please provide a complete resume.' 
      });
    }
    
    // Parse with Gemini
    const cvJson = await geminiService.parseCvToJson(rawText);
    
    // Save updates
    const { data: updatedCv, error: updateErr } = await supabase
      .from('master_cvs')
      .update({
        raw_text: rawText,
        cv_json: cvJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', cvId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (updateErr) throw updateErr;
    
    return res.json({
      success: true,
      masterCvId: updatedCv.id,
      cvJson: updatedCv.cv_json,
      message: 'CV updated and parsed successfully'
    });
    
  } catch (error: any) {
    console.error('CV update error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update CV' 
    });
  }
});

export const cvRouter = router;
