import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  // Allow access to maintenance page and static assets
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance';
  const isStaticAsset = request.nextUrl.pathname.startsWith('/_next') ||
                       request.nextUrl.pathname.startsWith('/assets') ||
                       request.nextUrl.pathname.startsWith('/favicon');

  // If maintenance mode is on and not already on maintenance page
  if (isMaintenanceMode && !isMaintenancePage && !isStaticAsset) {
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  // If maintenance mode is off and trying to access maintenance page directly
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
