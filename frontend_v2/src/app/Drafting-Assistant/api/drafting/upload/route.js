export const runtime = 'nodejs';

const BASE = 'http://34.93.247.115:8002';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const target = `${BASE}/drafting/upload${qs ? `?${qs}` : ''}`;

    console.log('Proxying upload request to:', target);
    console.log('Content-Type:', req.headers.get('content-type'));

    const res = await fetch(target, {
      method: 'POST',
      // Forward the original content-type for multipart boundaries
      headers: { 'content-type': req.headers.get('content-type') || undefined },
      body: req.body,
      duplex: 'half', // Required for Node.js fetch API when sending a body
    });

    console.log('Backend response status:', res.status, res.statusText);

    const text = await res.text();
    console.log('Backend response text:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return Response.json({ 
      status: 'error', 
      message: err?.message || 'Proxy error',
      details: `Failed to connect to backend service at ${BASE}. Please check if the service is running.`
    }, { status: 500 });
  }
}


