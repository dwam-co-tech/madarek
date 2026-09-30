import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATH = '/md-dash';
const LOGIN_PATH = `${ADMIN_PATH}/login`;

function adminEntryPath(request: NextRequest): string {
  if (!request.cookies.has('admin_token')) {
    return LOGIN_PATH;
  }

  return request.cookies.get('admin_role')?.value === 'author'
    ? `${ADMIN_PATH}/issues`
    : ADMIN_PATH;
}

function noIndex(response: NextResponse): NextResponse {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep the old public frontend in the repository without exposing it from
  // the admin deployment. Dashboard routes and its internal API remain live.
  if (
    pathname.startsWith(ADMIN_PATH) ||
    pathname.startsWith('/api/') ||
    pathname === '/robots.txt' ||
    /\.[^/]+$/.test(pathname)
  ) {
    return noIndex(NextResponse.next());
  }

  const destination = request.nextUrl.clone();
  destination.pathname = adminEntryPath(request);
  destination.search = '';

  return noIndex(NextResponse.redirect(destination));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
