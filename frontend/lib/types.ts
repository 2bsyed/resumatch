export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  location?: string;
  summary?: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  major?: string;
  grad_date: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  tools?: string[];
}

export interface CvJson {
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skills;
  certifications?: { name: string; authority?: string; date?: string }[];
}

export interface MasterCv {
  id: string;
  user_id: string;
  raw_text: string;
  cv_json: CvJson;
  file_url: string | null;
  file_type: 'pdf' | 'docx' | 'txt' | 'paste' | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  raw_text: string;
  company_name: string | null;
  job_title: string | null;
  job_category: string | null;
  extracted_keywords: any;
  created_at: string;
}

export interface TailoredCv {
  id: string;
  user_id: string;
  master_cv_id: string | null;
  job_description_id: string | null;
  tailored_cv_json: CvJson | null;
  ats_score_before: number;
  ats_score_after: number;
  keywords_matched: any; // JSONB Array
  keywords_missing: any; // JSONB Array
  changes_summary: any; // JSONB Object
  processing_status: 'pending' | 'processing' | 'complete' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  user_id: string;
  job_type: 'parse_cv' | 'tailor_cv';
  reference_id: string | null;
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress_step: number;
  progress_total: number;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  gemini_tokens_used: number;
  error_message: string | null;
}

export interface AtsScore {
  before: number;
  after: number;
  improvement: number;
  keywords_matched: string[];
  keywords_missing: string[];
  changes_summary: any;
}

export interface OptimizationHistoryItem {
  id: string;
  created_at: string;
  original_score: number;
  tailored_score: number;
  job_id: string;
  jobs: {
    job_title: string;
    job_description: string;
  };
  resumes: {
    file_name: string;
  };
}

export interface KeywordAnalysis {
  matched_keywords: string[];
  missing_keywords: string[];
  skills_gap: string[];
}
