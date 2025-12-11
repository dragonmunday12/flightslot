import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internal routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Get session cookie
  const session = request.cookies.get('session')

  // Public routes that don't require authentication
  const isLoginPage = pathname === '/login'

  // If accessing login page with a session, redirect to dashboard
  if (isLoginPage && session) {
    try {
      const user = JSON.parse(session.value)
      const dashboardUrl = user.role === 'instructor' ? '/instructor' : '/student'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    } catch (error) {
      // Invalid session, allow access to login
      return NextResponse.next()
    }
  }

  // If no session and trying to access protected route, redirect to login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Parse session to check role-based access
  if (session && !isLoginPage) {
    try {
      const user = JSON.parse(session.value)

      // Instructor-only routes
      if (pathname.startsWith('/instructor') && user.role !== 'instructor') {
        const correctDashboard = user.role === 'student' ? '/student' : '/login'
        return NextResponse.redirect(new URL(correctDashboard, request.url))
      }

      // Student-only routes
      if (pathname.startsWith('/student') && user.role !== 'student') {
        const correctDashboard = user.role === 'instructor' ? '/instructor' : '/login'
        return NextResponse.redirect(new URL(correctDashboard, request.url))
      }

      // Redirect root to appropriate dashboard
      if (pathname === '/') {
        const dashboardUrl = user.role === 'instructor' ? '/instructor' : '/student'
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    } catch (error) {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
