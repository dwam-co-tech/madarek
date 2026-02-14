import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const target = new URL(url);
    const allowedOrigins = new Set<string>([
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ]);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (apiBase) {
      try {
        allowedOrigins.add(new URL(apiBase).origin);
      } catch { }
    }

    const isLocalNetworkHost = (hostname: string) => {
      if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
      if (hostname.startsWith('10.')) return true;
      if (hostname.startsWith('192.168.')) return true;
      if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return true;
      return false;
    };

    if (!allowedOrigins.has(target.origin) && !isLocalNetworkHost(target.hostname)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fetchOptions = { cache: 'no-store', redirect: 'follow' } as const;
    const resolveFallbackUrl = (u: URL) => {
      if (u.hostname === 'localhost') {
        const next = new URL(u.href);
        next.hostname = '127.0.0.1';
        return next.href;
      }
      if (u.hostname === '127.0.0.1' || u.hostname === '0.0.0.0') {
        const next = new URL(u.href);
        next.hostname = 'localhost';
        return next.href;
      }
      return null;
    };

    const response = await fetch(target.href, fetchOptions).catch(async (err) => {
      const fallback = resolveFallbackUrl(target);
      if (fallback && fallback !== target.href) {
        return fetch(fallback, fetchOptions);
      }
      throw err;
    });
    if (!response.ok) {
      return new NextResponse('Failed to fetch PDF', { status: response.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') ?? 'application/pdf');
    headers.set('Content-Disposition', 'inline');
    headers.set('Cache-Control', 'no-store');

    if (response.body) {
      return new NextResponse(response.body, { headers });
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, { headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new NextResponse(message, { status: 500 });
  }
}
