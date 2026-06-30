-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master CVs (user's base resume stored as JSON)
CREATE TABLE master_cvs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  raw_text TEXT NOT NULL,
  cv_json JSONB NOT NULL,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf','docx','txt','paste')),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job descriptions
CREATE TABLE job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  raw_text TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  job_category TEXT,
  extracted_keywords JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tailored CV outputs
CREATE TABLE tailored_cvs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  master_cv_id UUID REFERENCES master_cvs(id) ON DELETE SET NULL,
  job_description_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
  tailored_cv_json JSONB,
  ats_score_before NUMERIC(5,2) DEFAULT 0,
  ats_score_after NUMERIC(5,2) DEFAULT 0,
  keywords_matched JSONB DEFAULT '[]',
  keywords_missing JSONB DEFAULT '[]',
  changes_summary JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending' 
    CHECK (processing_status IN ('pending','processing','complete','error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing job queue log
CREATE TABLE processing_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('parse_cv','tailor_cv')),
  reference_id UUID,
  status TEXT DEFAULT 'queued' 
    CHECK (status IN ('queued','processing','complete','error')),
  progress_step INTEGER DEFAULT 0,
  progress_total INTEGER DEFAULT 4,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  gemini_tokens_used INTEGER DEFAULT 0,
  error_message TEXT
);

-- Row Level Security policies (CRITICAL)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailored_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see/modify their own data
CREATE POLICY "Users own their profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own their CVs" ON master_cvs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their JDs" ON job_descriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their tailored CVs" ON tailored_cvs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their jobs" ON processing_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_master_cvs_updated_at BEFORE UPDATE ON master_cvs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_tailored_cvs_updated_at BEFORE UPDATE ON tailored_cvs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Auto-create user_profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
