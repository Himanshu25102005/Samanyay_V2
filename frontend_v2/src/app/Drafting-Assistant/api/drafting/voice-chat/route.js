export const runtime = 'nodejs';

const BASE = 'http://34.93.247.115:8002';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const target = `${BASE}/drafting/voice-chat${qs ? `?${qs}` : ''}`;

    const res = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': req.headers.get('content-type') || undefined },
      body: req.body,
      duplex: 'half', // Required for Node.js fetch API when sending a body
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (err) {
    return Response.json({ status: 'error', message: err?.message || 'Proxy error' }, { status: 500 });
  }
}


