import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface TailorResult {
  original_score: number;
  tailored_score: number;
  keyword_analysis: {
    matched_keywords: string[];
    missing_keywords: string[];
    skills_gap: string[];
  };
  suggested_changes: {
    section: string;
    original_bullet: string;
    tailored_bullet: string;
    rationale: string;
  }[];
  tailored_text: string;
}

export async function tailorResume(resumeText: string, jobDescription: string): Promise<TailorResult> {
  if (!apiKey || apiKey === 'mock_key_or_user_provided') {
    // Return mock data for testing/development if key is not configured
    return getMockTailorResult(resumeText, jobDescription);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are an expert resume optimizer and ATS (Applicant Tracking System) algorithm specialist.
Analyze the following candidate resume and target job description.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Perform the following tasks:
1. Calculate a realistic ATS match score (0-100) for the current resume against the job description.
2. Identify matched keywords and critical missing keywords (gaps in skills, tools, or concepts) from the job description.
3. Suggest 3-5 specific bullet-point rewrites for the experience or projects sections. Use the Google X-Y-Z resume formula: "Accomplished [X] as measured by [Y], by doing [Z]" to make them highly impactful.
4. Estimate the new ATS match score (0-100) after these changes and missing keywords are incorporated.
5. Generate the complete, optimized, tailored text version of the resume. Integrate the missing keywords and optimized bullet points seamlessly into the resume, maintaining its overall structure and professional tone.

You MUST respond strictly with a JSON object conforming to the following TypeScript interface:
{
  "original_score": number,
  "tailored_score": number,
  "keyword_analysis": {
    "matched_keywords": string[],
    "missing_keywords": string[],
    "skills_gap": string[]
  },
  "suggested_changes": [
    {
      "section": string,
      "original_bullet": string,
      "tailored_bullet": string,
      "rationale": string
    }
  ],
  "tailored_text": string
}
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return JSON.parse(text) as TailorResult;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

function getMockTailorResult(resumeText: string, jobDescription: string): TailorResult {
  // Simple heuristics to make mock results somewhat realistic
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  const commonKeywords = ['react', 'next.js', 'typescript', 'express', 'node', 'postgres', 'aws', 'docker', 'ci/cd', 'git', 'agile', 'python', 'java', 'tailwindcss', 'css', 'html', 'rest api', 'graphql', 'supabase', 'firebase'];
  
  const matched_keywords: string[] = [];
  const missing_keywords: string[] = [];

  commonKeywords.forEach(kw => {
    const inJd = jdLower.includes(kw);
    const inResume = resumeLower.includes(kw);
    if (inJd && inResume) {
      matched_keywords.push(kw.toUpperCase());
    } else if (inJd && !inResume) {
      missing_keywords.push(kw.toUpperCase());
    }
  });

  // Default values if no overlap found
  if (matched_keywords.length === 0) matched_keywords.push('COMMUNICATION', 'TEAMWORK');
  if (missing_keywords.length === 0) missing_keywords.push('NEXT.JS', 'TYPESCRIPT', 'TAILWIND CSS');

  const skills_gap = missing_keywords.map(kw => `${kw} optimization and modern integration`);

  return {
    original_score: Math.min(45 + matched_keywords.length * 5, 80),
    tailored_score: Math.min(85 + matched_keywords.length * 2, 98),
    keyword_analysis: {
      matched_keywords,
      missing_keywords,
      skills_gap,
    },
    suggested_changes: [
      {
        section: "Professional Experience",
        original_bullet: "Worked on the front-end components and fixed bugs.",
        tailored_bullet: `Rebuilt 15+ frontend modules utilizing ${missing_keywords[0] || 'Next.js'} and TypeScript, improving page load performance by 35% and boosting user engagement.`,
        rationale: `Integrates ${missing_keywords[0] || 'Next.js'} to directly match the JD's stack requirements while using the X-Y-Z framework.`
      },
      {
        section: "Professional Experience",
        original_bullet: "Helped write the REST APIs using Node and Express.",
        tailored_bullet: `Architected scalable RESTful microservices using Node.js and Express, cutting database query latency by 20% through Redis caching layers.`,
        rationale: "Quantifies the backend impact and shows deep understanding of api optimization."
      }
    ],
    tailored_text: `${resumeText}\n\n[Tailored Adjustments Applied for Job Matching]\n- Incorporated skills: ${missing_keywords.join(', ')}`
  };
}
