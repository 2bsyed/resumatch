import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from './lib/supabase';

export async function middleware(request: NextRequest) {
  // We need a response object to pass cookies back and forth
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient(request, response);

  // Perform session check
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Paths requiring protection
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/cv') ||
    pathname.startsWith('/tailor') ||
    pathname.startsWith('/processing') ||
    pathname.startsWith('/results') ||
    pathname.startsWith('/history');

  // Paths representing public auth interfaces
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isProtectedRoute && !session) {
    // Redirect unauthenticated requests to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && session) {
    // Redirect logged in users away from auth forms
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cv/:path*',
    '/tailor/:path*',
    '/processing/:path*',
    '/results/:path*',
    '/history/:path*',
    '/login',
    '/register',
  ],
};
