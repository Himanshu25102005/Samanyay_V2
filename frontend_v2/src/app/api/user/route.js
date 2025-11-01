export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request) {
  try {
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    // Explicitly forward cookies from the incoming request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    const backendUrl = new URL('/api/user', BACKEND_URL);

    const res = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      credentials: 'include', // Include credentials (cookies)
      duplex: 'half',
    });
    
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');

    // Explicitly forward Set-Cookie headers to ensure session persistence
    const setCookieHeaders = res.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // Clear any existing set-cookie header
      responseHeaders.delete('set-cookie');
      // Add all set-cookie headers
      setCookieHeaders.forEach((cookie) => {
        responseHeaders.append('set-cookie', cookie);
      });
    } else {
      // Also try the single set-cookie header (for compatibility)
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        responseHeaders.set('set-cookie', setCookie);
      }
    }

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
