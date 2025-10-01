export const runtime = 'nodejs';

const BASE = 'http://34.93.247.115:8002';

export async function GET(req, { params }) {
  try {
    const filename = params?.filename;
    const res = await fetch(`${BASE}/drafting/download/${encodeURIComponent(filename)}`);
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    return Response.json({ status: 'error', message: err?.message || 'Proxy error' }, { status: 500 });
  }
}



