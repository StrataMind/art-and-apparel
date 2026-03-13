import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    // Block access to dangerous endpoints completely
    if (pathname.startsWith('/api/make-me-ceo') || 
        pathname.startsWith('/api/db-direct')) {
      return NextResponse.json(
        { error: 'Endpoint disabled for security' }, 
        { status: 403 }
      )
    }

    // Admin/Superuser only routes
    if (pathname.startsWith('/api/superuser') || 
        pathname.startsWith('/superuser')) {
      if (!token?.role || !['CEO', 'ADMIN', 'SUPERUSER'].includes(token.role as string)) {
        return NextResponse.json(
          { error: 'Insufficient privileges' }, 
          { status: 403 }
        )
      }
    }

    // Seller only routes  
    if (pathname.startsWith('/api/seller') || 
        pathname.startsWith('/seller')) {
      if (!token?.role || !['SELLER', 'CEO', 'ADMIN', 'SUPERUSER'].includes(token.role as string)) {
        return NextResponse.json(
          { error: 'Seller access required' }, 
          { status: 403 }
        )
      }
    }

    // Protected API routes that require authentication
    if (pathname.startsWith('/api/products') ||
        pathname.startsWith('/api/orders') ||
        pathname.startsWith('/api/profile')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow public routes
        if (pathname.startsWith('/api/auth') || 
            pathname.startsWith('/auth') ||
            pathname === '/' ||
            pathname.startsWith('/products') ||
            pathname.startsWith('/categories')) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Protect all API routes except public ones and placeholder images
    '/api/((?!auth|public|placeholder).*)',
    // Protect dashboard and admin areas
    '/dashboard/:path*',
    '/seller/:path*',
    '/superuser/:path*',
    '/admin/:path*',
    // Protect user profile areas
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*'
  ]
}