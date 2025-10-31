export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

async function proxy(request, context) {
  try {
    const params = await context.params;
    const pathSegments = params?.path || [];
    const targetPath = `/api/auth/${pathSegments.join('/')}`;

    const url = new URL(request.url);
    const targetUrl = new URL(targetPath, BACKEND_URL);
    targetUrl.search = url.search;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    const method = request.method;
    let body;
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await request.text();
      } else {
        body = request.body;
      }
    }

    const res = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
      duplex: 'half',
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return NextResponse.json(json, { status: res.status, headers: responseHeaders });
      } catch {
        return new NextResponse(text, { status: res.status, headers: responseHeaders });
      }
    }

    const blob = await res.blob();
    return new NextResponse(blob, { status: res.status, headers: responseHeaders });
  } catch (err) {
    console.error('[Auth Proxy] error:', err);
    return NextResponse.json({ success: false, error: 'Proxy error', details: String(err) }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
