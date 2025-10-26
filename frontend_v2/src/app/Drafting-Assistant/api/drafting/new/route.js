export const runtime = 'nodejs';

import { extractUserId, addUserIdToQuery } from '../../../../lib/userUtils';

const BASE = 'http://34.93.247.115:8002';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    
    // Extract user ID and add to query parameters
    const userId = extractUserId(req);
    addUserIdToQuery(url.searchParams, userId);
    
    const qs = url.searchParams.toString();
    const target = `${BASE}/drafting/new${qs ? `?${qs}` : ''}`;
    
    console.log(`[Drafting Assistant - New] Proxying request to: ${target}`);
    console.log(`[Drafting Assistant - New] User ID: ${userId}`);
    
    const res = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: await req.text(),
      duplex: 'half', // Required for Node.js fetch API when sending a body
    });
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    console.error('[Drafting Assistant - New] Proxy error:', err);
    return Response.json({ 
      status: 'error', 
      message: err?.message || 'Proxy error', 
      hint: 'Ensure backend on http://localhost:8002 is running.',
      service: 'drafting-assistant-new'
    }, { status: 500 });
  }
}


