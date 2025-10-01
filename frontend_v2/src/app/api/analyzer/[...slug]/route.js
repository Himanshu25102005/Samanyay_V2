// Proxy all analyzer API calls from the frontend (port 3000) to the backend microservice (port 8001)
// Usage examples (frontend):
//  - /api/analyzer/health                -> http://localhost:8001/health
//  - /api/analyzer/upload                -> http://localhost:8001/analyzer/upload
//  - /api/analyzer/analyze               -> http://localhost:8001/analyzer/analyze
//  - /api/analyzer/chat                  -> http://localhost:8001/analyzer/chat
//  - /api/analyzer/voice-chat?foo=bar    -> http://localhost:8001/analyzer/voice-chat?foo=bar

import { NextResponse } from 'next/server';

const TARGET_ORIGIN = process.env.ANALYZER_BASE_URL || 'http://34.93.247.115:8001';

async function proxy(request, context) {
  try {
    const params = await context.params;
    const slug = params?.slug || [];
    // Map special case: /api/analyzer/health -> /health, otherwise prefix with /analyzer
    const isHealth = slug.length === 1 && slug[0] === 'health';
    const targetPath = isHealth ? '/health' : `/analyzer/${slug.join('/')}`;

    const url = new URL(request.url);
    const targetUrl = new URL(targetPath, TARGET_ORIGIN);
    targetUrl.search = url.search; // preserve query

    // Clone headers and strip hop-by-hop or restricted headers
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    const init = {
      method: request.method,
      headers,
      body: request.body,
      duplex: 'half', // allow streaming bodies in Node fetch
    };

    const res = await fetch(targetUrl.toString(), init);
    const responseHeaders = new Headers(res.headers);
    // CORS not needed between same-origin; ensure no conflicting headers leak
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;


