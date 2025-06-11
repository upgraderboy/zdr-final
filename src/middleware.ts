import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 🎯 Role-restricted dashboard routes
const isCandidateDashboard = createRouteMatcher(['/candidates(.*)', '/resume(.*)', '/jobs(.*)'])
const isCompanyDashboard = createRouteMatcher(['/companies(.*)', '/jobs(.*)', '/candidates'])

// 🧭 Onboarding routes
const isOnboardingRoute = createRouteMatcher(['/onboarding'])

// ✅ Public routes accessible to any logged-in user (no role check)
const isLoggedInPublicRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/jobs(.*)',
  '/favorites(.*)',
  '/candidates(.*)',
  '/companies(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()
  const userId = session.userId
  const claims = session.sessionClaims
  const onboardingComplete = claims?.metadata?.onboardingComplete
  const role = claims?.metadata?.role
  const pathname = req.nextUrl.pathname

  // 🚫 Skip static and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // 🔄 Redirect legacy sign-in/create to sign-up
  if (pathname === '/sign-in/create') {
    return NextResponse.redirect(new URL('/sign-up', req.url))
  }

  // 🛑 If not logged in and trying to access protected routes
  if (
    !userId &&
    (
      isOnboardingRoute(req) ||
      isCandidateDashboard(req) ||
      isCompanyDashboard(req) ||
      isLoggedInPublicRoute(req)
    )
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // ✅ Allow logged-in users to access public routes (no role/onboarding check)
  if (userId && isLoggedInPublicRoute(req)) {
    return NextResponse.next()
  }

  // 🚧 Enforce onboarding completion before continuing
  if (userId && onboardingComplete === false && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // 🛡️ Enforce role-based dashboard access
  if (userId && onboardingComplete === true) {
    if (isCandidateDashboard(req) && role !== 'CANDIDATE') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    if (isCompanyDashboard(req) && role !== 'COMPANY') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // ✅ All other requests pass through
  return NextResponse.next()
})
