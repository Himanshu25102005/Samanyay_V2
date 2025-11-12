export const runtime = 'nodejs';

import { extractUserId, addUserIdToQuery } from '../../../../../lib/userUtils';

const BASE = 'http://34.93.247.115:8002';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    
    // Extract user ID and add to query parameters
    const userId = extractUserId(req);
    addUserIdToQuery(url.searchParams, userId);
    
    const qs = url.searchParams.toString();
    const target = `${BASE}/drafting/upload${qs ? `?${qs}` : ''}`;

    const res = await fetch(target, {
      method: 'POST',
      // Forward the original content-type for multipart boundaries
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
    console.error('Proxy error:', err);
    return Response.json({ 
      status: 'error', 
      message: err?.message || 'Proxy error',
      details: `Failed to connect to backend service at ${BASE}. Please check if the service is running.`,
      service: 'drafting-assistant-upload'
    }, { status: 500 });
  }
}


