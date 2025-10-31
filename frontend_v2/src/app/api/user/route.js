export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request) {
  try {
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    const backendUrl = new URL('/api/user', BACKEND_URL);

    const res = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      duplex: 'half',
    });
    
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');

    const contentType = res.headers.get('content-type');
    let body;
    if (contentType && contentType.toLowerCase().includes('application/json')) {
      body = await res.json();
      return NextResponse.json(body, { status: res.status, headers: responseHeaders });
    } else {
      body = await res.text();
      return new NextResponse(body, { status: res.status, headers: responseHeaders });
    }
  } catch (err) {
    console.error('/api/user proxy error:', err);
    return NextResponse.json({ success: false, error: 'Proxy error: ' + String(err) }, { status: 502 });
  }
}
