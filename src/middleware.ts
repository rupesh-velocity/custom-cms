import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect all /admin routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('cms_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
      );
      
      // Verify the JWT token
      const { payload } = await jwtVerify(token, secret);
      
      if (payload.role !== 'Admin') {
        return NextResponse.redirect(new URL('/my-account', request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      // If token is invalid/expired, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from the login page
  if (path === '/login') {
    const token = request.cookies.get('cms_session')?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
        );
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch {
        // invalid token on login page, just continue
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
