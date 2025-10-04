export const runtime = 'nodejs';

const BASE = 'http://34.93.247.115:8002';

export async function GET() {
  try {
    console.log('Checking backend health at:', BASE);
    
    const res = await fetch(`${BASE}/health`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });

    const text = await res.text();
    console.log('Backend health response:', res.status, text);
    
    return Response.json({
      status: 'success',
      backend_status: res.status,
      backend_response: text,
      backend_url: BASE
    });
  } catch (err) {
    console.error('Backend health check failed:', err);
    return Response.json({ 
      status: 'error', 
      message: err?.message || 'Backend service unreachable',
      backend_url: BASE,
      error_type: err.name || 'UnknownError'
    }, { status: 500 });
  }
}
