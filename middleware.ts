import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle @ profile routes by rewriting to /u/[username]
  if (path.startsWith('/@')) {
    const username = path.slice(2); // Remove /@ to get just the username
    console.log('Middleware: Rewriting', path, 'to', `/u/${username}`);
    return NextResponse.rewrite(new URL(`/u/${username}`, request.url));
  }

  // Only protect admin routes
  if (path.startsWith('/dashboard')) {
    try {
      const token = request.cookies.get('midnight-auth')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
