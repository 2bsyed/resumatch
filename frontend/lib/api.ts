import { supabase } from './supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    'http://localhost:5000/api';

export interface ApiError extends Error {
  message: string;
  status?: number;
}

export async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(options?.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const url = `${BACKEND_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      // Ignore parse failure
    }
    
    const error = new Error(errorMsg) as ApiError;
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' });
}

export async function apiPost<T>(path: string, body: any, options?: RequestInit): Promise<T> {
  const isFormData = body instanceof FormData;
  const headers = new Headers(options?.headers || {});
  
  if (!isFormData && body) {
    headers.set('Content-Type', 'application/json');
  }

  return request<T>(path, {
    ...options,
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
    headers,
  });
}

export async function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' });
}

// Named export mapping for backward compatibility with previous mock pages
export const api = {
  checkHealth: () => apiGet<{ status: string; timestamp: string }>('/health'),

  uploadResume: (userId: string, fileName: string, resumeText: string) =>
    apiPost<any>('/resumes', { user_id: userId, file_name: fileName, resume_text: resumeText }),

  getUserResumes: (userId: string) =>
    apiGet<any[]>(`/resumes/user/${userId}`),

  triggerTailoring: (userId: string, resumeId: string, jobTitle: string, jobDescription: string) =>
    apiPost<{ message: string; jobId: string; status: string }>('/jobs', {
      user_id: userId,
      resume_id: resumeId,
      job_title: jobTitle,
      job_description: jobDescription,
    }),

  getJobStatus: (jobId: string) =>
    apiGet<{ job: any; tailored: any }>(`/jobs/${jobId}`),

  getUserHistory: (userId: string) =>
    apiGet<any[]>(`/history/user/${userId}`),
};
