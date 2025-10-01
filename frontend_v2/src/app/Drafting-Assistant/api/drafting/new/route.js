export const runtime = 'nodejs';

const BASE = 'http://34.93.247.115:8002';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const target = `${BASE}/drafting/new${qs ? `?${qs}` : ''}`;
    const res = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: await req.text(),
    });
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    return Response.json({ status: 'error', message: err?.message || 'Proxy error', hint: 'Ensure backend on http://localhost:8002 is running.' }, { status: 500 });
  }
}


