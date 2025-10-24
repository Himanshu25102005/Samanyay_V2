export const runtime = 'nodejs';

const BASE = 'http://34.93.247.115:8002';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Extract required parameters from query string
    const mode = searchParams.get('mode') || 'new'; // 'new' for new draft, 'improve' for improve draft
    const documentType = searchParams.get('document_type') || 'general';
    const language = searchParams.get('language') || 'en';
    const userId = searchParams.get('user_id') || 'default_user';
    const documentId = searchParams.get('document_id'); // Optional for new draft, required for improve
    
    // Validate required parameters based on mode
    if (mode === 'improve' && !documentId) {
      return Response.json({ 
        status: 'error', 
        message: 'document_id is required for improve mode' 
      }, { status: 400 });
    }
    
    // Build query string with all parameters
    const queryParams = new URLSearchParams({
      mode,
      document_type: documentType,
      language,
      user_id: userId
    });
    
    if (documentId) {
      queryParams.append('document_id', documentId);
    }
    
    // Add any additional query parameters from the original request
    for (const [key, value] of searchParams.entries()) {
      if (!['mode', 'document_type', 'language', 'user_id', 'document_id'].includes(key)) {
        queryParams.append(key, value);
      }
    }
    
    const target = `${BASE}/drafting/voice-chat?${queryParams.toString()}`;

    console.log('Voice chat request to:', target);
    console.log('Mode:', mode, 'Document Type:', documentType, 'Language:', language, 'User ID:', userId, 'Document ID:', documentId);

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
    console.error('Voice chat API error:', err);
    return Response.json({ status: 'error', message: err?.message || 'Proxy error' }, { status: 500 });
  }
}


