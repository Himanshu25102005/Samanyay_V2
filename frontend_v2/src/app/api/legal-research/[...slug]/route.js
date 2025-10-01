import { NextResponse } from 'next/server';

const TARGET = process.env.LEGAL_RESEARCH_BASE_URL || 'http://34.93.247.115:8000';

async function proxy(request, context) {
  try {
    const params = await context.params;
    const slug = params?.slug || [];

    // Map /api/legal-research/health-check -> /health-check/
    const path = slug.join('/');
    const targetPath = path === 'health-check' ? '/health-check/' : `/${path.replace(/\/?$/, '/')}`;

    const url = new URL(request.url);
    const targetUrl = new URL(targetPath, TARGET);
    targetUrl.search = url.search;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    const init = { method: request.method, headers, body: request.body, duplex: 'half' };
    const res = await fetch(targetUrl.toString(), init);
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');
    return new NextResponse(res.body, { status: res.status, headers: responseHeaders });
  } catch (e) {
    return NextResponse.json({ error: 'Proxy error', details: String(e) }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;


