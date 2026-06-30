import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite-preview-06-17'
});

// Response cleaning helper to strip Markdown blocks
function cleanResponseJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

async function callGeminiWithRetry(prompt: string, retries = 3, jsonMode = true): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'mock_key') {
    return getMockJsonFallback(prompt);
  }

  for (let i = 0; i < retries; i++) {
    try {
      const config: any = {};
      if (jsonMode) {
        config.responseMimeType = 'application/json';
      }

      // Wrap API call in a 60-second timeout race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const err = new Error('Gemini API call timed out after 60 seconds. Please wait and try again.') as any;
          err.status = 503;
          err.code = 'SERVICE_UNAVAILABLE';
          reject(err);
        }, 60000);
      });

      const result = await Promise.race([
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: config
        }),
        timeoutPromise
      ]) as any;

      const responseText = result.response.text();
      if (!responseText) throw new Error('Empty response from Gemini');
      return responseText;

    } catch (error: any) {
      console.warn(`Gemini API call failed (attempt ${i + 1}/${retries}):`, error.message);
      
      const isRateLimit = error.status === 429 || error.message?.includes('429');
      
      if (isRateLimit && i < retries - 1) {
        const waitMs = Math.pow(2, i) * 2000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Gemini API call failed after retries');
}

// ----------------------------------------------------
// FUNCTION 1: parseCvToJson
// ----------------------------------------------------

const cvJsonSchema = z.object({
  personal: z.object({
    full_name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedin_url: z.string().nullable(),
    github_url: z.string().nullable(),
    portfolio_url: z.string().nullable(),
    summary: z.string().nullable(),
  }),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    title: z.string(),
    location: z.string().nullable(),
    start_date: z.string(),
    end_date: z.string(),
    is_current: z.boolean(),
    bullets: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string().nullable(),
    field: z.string().nullable(),
    graduation_date: z.string().nullable(),
    gpa: z.string().nullable(),
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    tools: z.array(z.string()),
    languages: z.array(z.string()),
  }),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().nullable(),
    date: z.string().nullable(),
  })),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    tech_stack: z.array(z.string()),
    url: z.string().nullable(),
  })),
});

export type CvJson = z.infer<typeof cvJsonSchema>;

export async function parseCvToJson(rawText: string): Promise<CvJson> {
  const CV_PARSE_PROMPT = `You are a precise, clinical resume parser.
Convert the resume text below into the exact JSON schema provided.

STRICT RULES:
1. Never hallucinate or invent data not present in the resume
2. Standardize all dates to "YYYY-MM" format (e.g. "2021-03")
3. If a date is just a year, use "YYYY-01"
4. Use "present" for current positions (not "current" or "now")
5. Split each bullet point into a separate string in the bullets array
6. Return ONLY valid JSON. No markdown. No code blocks. No preamble.
7. If any field is missing, use null (not empty string)

JSON SCHEMA:
{
  "personal": {
    "full_name": "string",
    "email": "string | null",
    "phone": "string | null", 
    "location": "string | null",
    "linkedin_url": "string | null",
    "github_url": "string | null",
    "portfolio_url": "string | null",
    "summary": "string | null"
  },
  "experience": [
    {
      "id": "generate a random 8-char alphanumeric ID",
      "company": "string",
      "title": "string",
      "location": "string | null",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM | present",
      "is_current": false,
      "bullets": ["string", "string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string | null",
      "field": "string | null",
      "graduation_date": "YYYY-MM | null",
      "gpa": "string | null"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "tools": ["string"],
    "languages": ["string"]
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string | null",
      "date": "YYYY-MM | null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "tech_stack": ["string"],
      "url": "string | null"
    }
  ]
}

RESUME TEXT TO PARSE:
---
${rawText}
---

Return ONLY the JSON object. Nothing else.`;

  const responseText = await callGeminiWithRetry(CV_PARSE_PROMPT, 3, true);
  const cleaned = cleanResponseJson(responseText);
  
  try {
    const parsed = JSON.parse(cleaned);
    const validated = cvJsonSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(`JSON Schema mismatch: ${validated.error.message}`);
    }
    return validated.data;
  } catch (err: any) {
    throw new Error(`Failed to parse CV JSON: ${err.message}`);
  }
}

// ----------------------------------------------------
// FUNCTION 2: analyzeJobDescription
// ----------------------------------------------------

const jdAnalysisSchema = z.object({
  job_title: z.string(),
  company_name: z.string().nullable(),
  job_category: z.enum(['Engineering', 'Product', 'Marketing', 'Sales', 'Finance', 'Design', 'Operations', 'Data', 'Other']),
  seniority_level: z.enum(['Junior', 'Mid', 'Senior', 'Staff', 'Lead', 'Manager', 'Director', 'VP', 'Executive']),
  required_skills: z.array(z.string()),
  nice_to_have_skills: z.array(z.string()),
  required_years_experience: z.number().nullable(),
  key_action_verbs: z.array(z.string()),
  industry_keywords: z.array(z.string()),
  responsibilities_summary: z.string(),
  top_10_ats_keywords: z.array(z.string()),
});

export type JdAnalysis = z.infer<typeof jdAnalysisSchema>;

export async function analyzeJobDescription(jdText: string): Promise<JdAnalysis> {
  const JD_ANALYSIS_PROMPT = `You are an expert ATS consultant and 
talent acquisition specialist.

Analyze this job description and extract structured data.

Return ONLY valid JSON. No markdown. No preamble.

JSON SCHEMA:
{
  "job_title": "string",
  "company_name": "string | null",
  "job_category": "one of: Engineering | Product | Marketing | Sales | Finance | Design | Operations | Data | Other",
  "seniority_level": "one of: Junior | Mid | Senior | Staff | Lead | Manager | Director | VP | Executive",
  "required_skills": ["skill1", "skill2"],
  "nice_to_have_skills": ["skill1", "skill2"],
  "required_years_experience": number | null,
  "key_action_verbs": ["verb1", "verb2"],
  "industry_keywords": ["keyword1", "keyword2"],
  "responsibilities_summary": "2-3 sentence summary of main responsibilities",
  "top_10_ats_keywords": ["keyword1", ... "keyword10"]
}

JOB DESCRIPTION:
---
${jdText}
---

Return ONLY the JSON object.`;

  const responseText = await callGeminiWithRetry(JD_ANALYSIS_PROMPT, 3, true);
  const cleaned = cleanResponseJson(responseText);

  try {
    const parsed = JSON.parse(cleaned);
    const validated = jdAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(`JSON Schema mismatch: ${validated.error.message}`);
    }
    return validated.data;
  } catch (err: any) {
    throw new Error(`Failed to parse JD Analysis JSON: ${err.message}`);
  }
}

// ----------------------------------------------------
// FUNCTION 3: tailorCvBullets
// ----------------------------------------------------

const tailorResultSchema = z.object({
  rewrites: z.array(z.object({
    id: z.string(),
    original: z.string(),
    rewritten: z.string(),
    keywords_added: z.array(z.string()),
    confidence: z.enum(['high', 'medium', 'low']),
  })),
});

export type TailorResult = z.infer<typeof tailorResultSchema>;

export async function tailorCvBullets(
  cvJson: CvJson, 
  jdAnalysis: JdAnalysis, 
  lowScoredBullets: { id: string; text: string }[]
): Promise<TailorResult> {
  
  // Heuristic to identify which keywords are already matched in the resume
  const cvTextLower = JSON.stringify(cvJson).toLowerCase();
  const matchedKeywords = jdAnalysis.top_10_ats_keywords.filter(keyword => 
    cvTextLower.includes(keyword.toLowerCase())
  );

  const TAILOR_PROMPT = `You are an elite resume writer and ATS 
optimization specialist with 15 years of experience placing 
candidates at top-tier companies.

TARGET ROLE: ${jdAnalysis.job_title}
TARGET COMPANY: ${jdAnalysis.company_name || 'the target company'}
SENIORITY LEVEL: ${jdAnalysis.seniority_level}

MISSING ATS KEYWORDS (must incorporate naturally):
${jdAnalysis.top_10_ats_keywords.filter(k => !matchedKeywords.includes(k)).join(', ')}

KEY ACTION VERBS FROM JD:
${jdAnalysis.key_action_verbs.join(', ')}

YOUR TASK: Rewrite each bullet point below to:
1. Naturally incorporate the missing ATS keywords where TRUTHFUL
2. Open with a strong action verb from the JD's vocabulary
3. Add quantifiable metrics if they are CLEARLY IMPLIED by context
   (e.g. "improved performance" → "improved performance by ~30%")
   NEVER fabricate specific numbers not implied by context
4. Keep each bullet under 20 words
5. NEVER invent experience, tools, or skills not in the original
6. NEVER change the fundamental meaning of the bullet

BULLETS TO OPTIMIZE:
${JSON.stringify(lowScoredBullets)}

Return ONLY valid JSON:
{
  "rewrites": [
    {
      "id": "original bullet id",
      "original": "original text",
      "rewritten": "optimized text",
      "keywords_added": ["keyword1"],
      "confidence": "high | medium | low"
    }
  ]
}

Return ONLY the JSON object.`;

  const responseText = await callGeminiWithRetry(TAILOR_PROMPT, 3, true);
  const cleaned = cleanResponseJson(responseText);

  try {
    const parsed = JSON.parse(cleaned);
    const validated = tailorResultSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(`JSON Schema mismatch: ${validated.error.message}`);
    }
    return validated.data;
  } catch (err: any) {
    throw new Error(`Failed to parse Tailor Result JSON: ${err.message}`);
  }
}

// Development fallback helper when API Key is missing or invalid
function getMockJsonFallback(prompt: string): string {
  if (prompt.includes('parseCvToJson') || prompt.includes('Precise, clinical resume parser')) {
    return JSON.stringify({
      personal: {
        full_name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0199',
        location: 'San Francisco, CA',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        portfolio_url: null,
        summary: 'Experienced software engineer specializing in scalable modern web ecosystems.'
      },
      experience: [
        {
          id: 'exp12345',
          company: 'Stripe',
          title: 'Software Engineer',
          location: 'San Francisco, CA',
          start_date: '2023-01',
          end_date: 'present',
          is_current: true,
          bullets: [
            'Worked on frontend modules and components.',
            'Wrote and maintained REST APIs using Express.'
          ]
        }
      ],
      education: [
        {
          institution: 'State University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduation_date: '2022-05',
          gpa: '3.8'
        }
      ],
      skills: {
        technical: ['REACT', 'NODE.JS', 'EXPRESS', 'TYPESCRIPT', 'POSTGRESQL'],
        soft: ['COMMUNICATION', 'AGILE DEVELOPMENTS'],
        tools: ['GIT', 'DOCKER'],
        languages: ['ENGLISH']
      },
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          date: '2023-08'
        }
      ],
      projects: [
        {
          name: 'Personal Portfolio',
          description: 'A server-rendered portfolio showcasing projects and contact forms.',
          tech_stack: ['Next.js', 'TailwindCSS'],
          url: 'https://johndoe.dev'
        }
      ]
    });
  }

  if (prompt.includes('analyzeJobDescription') || prompt.includes('Analyze this job description')) {
    return JSON.stringify({
      job_title: 'Senior Frontend Engineer',
      company_name: 'Stripe',
      job_category: 'Engineering',
      seniority_level: 'Senior',
      required_skills: ['REACT', 'TYPESCRIPT', 'NEXT.JS', 'TAILWIND CSS'],
      nice_to_have_skills: ['NODE.JS', 'AWS', 'TESTING'],
      required_years_experience: 5,
      key_action_verbs: ['Architect', 'Optimize', 'Refactor', 'Deliver'],
      industry_keywords: ['Saas', 'Fintech', 'Dashboard'],
      responsibilities_summary: 'Design and build high-performance web dashboards with React and TypeScript.',
      top_10_ats_keywords: ['NEXT.JS', 'TYPESCRIPT', 'TAILWIND CSS', 'REACT', 'PERFORMANCE', 'ACCESSIBILITY', 'SAAS', 'FINTECH', 'DASHBOARD', 'API']
    });
  }

  // tailorCvBullets fallback
  return JSON.stringify({
    rewrites: [
      {
        id: 'bullet1',
        original: 'Worked on frontend modules and components.',
        rewritten: 'Architected 15+ high-traffic frontend modules using Next.js and TypeScript, increasing performance and meeting strict accessibility standards.',
        keywords_added: ['NEXT.JS', 'TYPESCRIPT', 'PERFORMANCE', 'ACCESSIBILITY'],
        confidence: 'high'
      },
      {
        id: 'bullet2',
        original: 'Wrote and maintained REST APIs using Express.',
        rewritten: 'Optimized secure RESTful API endpoints utilizing Express and Node.js, reducing server response times by ~20%.',
        keywords_added: ['API', 'NODE.JS'],
        confidence: 'high'
      }
    ]
  });
}
