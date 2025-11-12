import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const docId = params.docId;
    
    const targetUrl = new URL(`/api/documents/${docId}/download`, BACKEND_URL);
    
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');
    
    // Explicitly forward cookies from the incoming request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }
    
    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      credentials: 'include', // Include credentials (cookies)
      duplex: 'half',
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend responded with error:', res.status, errorText);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to download document from backend',
        error: errorText,
        status: res.status
      }, { status: res.status });
    }
    
    const blob = await res.blob();
    
    // Return the file with appropriate headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'content-type': res.headers.get('content-type') || 'application/octet-stream',
        'content-disposition': res.headers.get('content-disposition') || `attachment; filename="document"`,
        'content-length': blob.size.toString(),
      }
    });
  } catch (err) {
    console.error('Proxy error during document download:', err);
    return NextResponse.json({ 
      success: false,
      error: 'Proxy error',
      details: String(err),
      message: 'Failed to connect to backend service for download'
    }, { status: 502 });
  }
}

