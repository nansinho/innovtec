import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

const publicPaths = ['/login', '/register', '/forgot-password', '/auth/callback'];

function isPublicPath(pathname: string): boolean {
  const cleanPath = pathname.replace(/^\/(fr|pt)/, '') || '/';
  return publicPaths.some((p) => cleanPath.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Update Supabase session (refresh tokens)
  const { user, supabaseResponse } = await updateSession(request);

  // Run intl middleware to get locale-aware response
  const intlResponse = intlMiddleware(request);

  // Copy Supabase cookies to the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  // Check auth for protected routes
  if (!user && !isPublicPath(pathname)) {
    const locale = pathname.match(/^\/(fr|pt)/)?.[1] || 'fr';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Redirect authenticated users away from auth pages
  if (user && isPublicPath(pathname)) {
    const locale = pathname.match(/^\/(fr|pt)/)?.[1] || 'fr';
    const dashboardUrl = new URL(`/${locale}`, request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
