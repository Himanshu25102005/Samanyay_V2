import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

async function proxy(request) {
  try {
    const targetPath = '/api/cases';

    const url = new URL(request.url);
    const targetUrl = new URL(targetPath, BACKEND_URL);
    targetUrl.search = url.search;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    // Explicitly forward cookies from the incoming request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    const init = {
      method: request.method,
      headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
      credentials: 'include', // Include credentials (cookies)
      duplex: 'half',
    };

    const res = await fetch(targetUrl.toString(), init);
    
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

    // Handle file downloads
    const contentType = res.headers.get('content-type');
    const isFileDownload = res.headers.get('content-disposition');
    
    if (isFileDownload) {
      const blob = await res.blob();
      return new NextResponse(blob, {
        status: res.status,
        headers: responseHeaders,
      });
    }

    const text = await res.text();
    
    // Try to parse as JSON if content-type suggests it
    if (contentType && contentType.includes('application/json')) {
      try {
        const jsonData = JSON.parse(text);
        return NextResponse.json(jsonData, { status: res.status, headers: responseHeaders });
      } catch (e) {
        // If not valid JSON, return text
      }
    }

    return new NextResponse(text, { status: res.status, headers: responseHeaders });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ 
      success: false,
      error: 'Proxy error', 
      details: String(err),
      message: `Failed to connect to backend service at ${targetUrl.toString()}`,
      backend_url: BACKEND_URL,
      hint: 'Make sure NEXT_PUBLIC_API_URL is set in your Vercel environment variables',
      environment_check: {
        has_next_public_api_url: !!process.env.NEXT_PUBLIC_API_URL,
        has_backend_url: !!process.env.BACKEND_URL,
        final_backend_url: BACKEND_URL
      }
    }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;

