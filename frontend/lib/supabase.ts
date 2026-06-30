import { createBrowserClient, createServerClient as supabaseCreateServerClient } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Browser client for client-side files
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server client for use in Server Components and Route Handlers
export function createServerClient(cookieStore: {
  getAll: () => any[];
  set: (name: string, value: string, options: any) => void;
}) {
  return supabaseCreateServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Set can fail if called from read-only server component
          }
        },
      },
    }
  );
}

// Middleware client for use in Next.js middleware
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return supabaseCreateServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );
}
