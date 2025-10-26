import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const docId = params.docId;
    
    console.log('Document preview request for docId:', docId);
    
    const targetUrl = new URL(`/api/documents/${docId}/download`, BACKEND_URL);
    
    console.log('Proxying document preview request to:', targetUrl.toString());
    
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');
    
    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      duplex: 'half',
    });
    
    console.log('Backend response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend responded with error:', res.status, errorText);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to preview document from backend',
        error: errorText,
        status: res.status
      }, { status: res.status });
    }
    
    const blob = await res.blob();
    console.log('Blob size for preview:', blob.size, 'bytes');
    
    // Return the file with appropriate headers for preview
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'content-type': res.headers.get('content-type') || 'application/octet-stream',
        'content-disposition': 'inline', // This allows preview instead of download
        'content-length': blob.size.toString(),
        'cache-control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
  } catch (err) {
    console.error('Proxy error during document preview:', err);
    return NextResponse.json({ 
      success: false,
      error: 'Proxy error',
      details: String(err),
      message: 'Failed to connect to backend service for preview'
    }, { status: 502 });
  }
}
