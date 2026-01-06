import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const urlObj = new URL(req.url);
  const target = urlObj.searchParams.get('url');
  if (!target) {
    return NextResponse.json({ message: 'missing url' }, { status: 400 });
  }
  try {
    const abs = new URL(target, urlObj.origin).toString();
    const resp = await fetch(abs, { method: 'GET' });
    if (!resp.ok || !resp.body) {
      return NextResponse.json({ message: 'failed to fetch pdf' }, { status: 400 });
    }
    let filename = 'magazine.pdf';
    const cd = resp.headers.get('content-disposition');
    if (cd) {
      const m = cd.match(/filename="?([^"]+)"?/i);
      if (m && m[1]) filename = m[1];
    } else {
      try {
        const pn = new URL(abs).pathname;
        const parts = pn.split('/').filter(Boolean);
        filename = parts.pop() || filename;
      } catch {}
    }
    const headers = new Headers();
    headers.set('Content-Type', resp.headers.get('content-type') || 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'no-store');
    return new Response(resp.body, { headers });
  } catch {
    return NextResponse.json({ message: 'download error' }, { status: 400 });
  }
}
