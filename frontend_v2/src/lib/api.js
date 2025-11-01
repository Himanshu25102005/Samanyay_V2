/**
 * API configuration and utility functions
 */

// Get the base URL and ensure it doesn't have trailing slash
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

// Debug logging
console.log('=== API CONFIGURATION DEBUG ===');
console.log('Raw NEXT_PUBLIC_API_URL:', JSON.stringify(process.env.NEXT_PUBLIC_API_URL));
console.log('Clean API_BASE_URL:', JSON.stringify(API_BASE_URL));
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});
console.log('URL validation:', {
  hasTrailingSlash: rawApiUrl.endsWith('/'),
  hasDoubleSlash: rawApiUrl.includes('//'),
  length: rawApiUrl.length
});
console.log('================================');

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export async function apiRequest(endpoint, options = {}) {
  // Check if endpoint is already a full URL
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  
  let url;
  if (isFullUrl) {
    // Use the full URL directly
    url = endpoint;
  } else {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Prefer same-origin proxy for Next.js API routes to avoid CORS/cookie issues
    const isNextApi = cleanEndpoint.startsWith('/api/');
    url = isNextApi ? cleanEndpoint : `${API_BASE_URL}${cleanEndpoint}`;
  }
  
  console.log('=== URL CONSTRUCTION DEBUG ===');
  console.log('Original endpoint:', endpoint);
  console.log('Is full URL:', isFullUrl);
  if (!isFullUrl) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const isNextApi = cleanEndpoint.startsWith('/api/');
    console.log('Clean endpoint:', cleanEndpoint);
    console.log('Using Next proxy:', isNextApi);
  }
  console.log('API_BASE_URL (for non-proxied):', API_BASE_URL);
  console.log('Final URL:', url);
  console.log('URL validation:', {
    hasDoubleSlash: url.includes('//'),
    startsWithHttp: url.startsWith('http'),
    endsWithSlash: url.endsWith('/')
  });
  console.log('================================');
  
  const defaultOptions = {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    console.log('Request options:', config);

    let response;
    try {
      response = await fetch(url, config);
    } catch (fetchErr) {
      // Handle low-level network errors here
      if (fetchErr instanceof TypeError && fetchErr.message && fetchErr.message.includes('Failed to fetch')) {
        console.error('[API] Network error: Failed to fetch:', url);
        throw new Error('[Network Error] Could not reach backend server. Check your server URL, CORS, or server status. Tried: ' + url);
      }
      throw fetchErr;
    }

    console.log(`API Response: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      throw new Error(`Expected JSON but received ${contentType || 'unknown content type'}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * API endpoints
 */
export const API = {
  // User endpoints
  // getUser makes direct backend call to ensure cookies are sent (important for OAuth sessions)
  getUser: () => {
    // Make direct backend call to include cookies from backend domain
    const url = `${API_BASE_URL}/api/user`;
    return apiRequest(url, { credentials: 'include' });
  },
  register: (userData) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  logout: () => {
    const url = `${API_BASE_URL}/api/auth/logout`;
    return apiRequest(url, { method: 'POST', credentials: 'include' });
  },
  
  // Case endpoints
  // Make direct backend calls to ensure cookies are sent (important for authentication)
  getCases: () => {
    const url = `${API_BASE_URL}/api/cases`;
    return apiRequest(url, { credentials: 'include' });
  },
  createCase: (caseData) => {
    const url = `${API_BASE_URL}/api/cases`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(caseData),
      credentials: 'include',
    });
  },
  updateCase: (caseId, caseData) => {
    const url = `${API_BASE_URL}/api/cases/${caseId}`;
    return apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(caseData),
      credentials: 'include',
    });
  },
  deleteCase: (caseId) => {
    const url = `${API_BASE_URL}/api/cases/${caseId}`;
    return apiRequest(url, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
  
  // Task endpoints - make direct backend calls to ensure cookies are sent
  getTasks: (caseId) => {
    const url = `${API_BASE_URL}/api/cases/${caseId}/tasks`;
    return apiRequest(url, { credentials: 'include' });
  },
  createTask: (caseId, taskData) => {
    const url = `${API_BASE_URL}/api/cases/${caseId}/tasks`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(taskData),
      credentials: 'include',
    });
  },
  updateTask: (taskId, taskData) => {
    const url = `${API_BASE_URL}/api/tasks/${taskId}`;
    return apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(taskData),
      credentials: 'include',
    });
  },
  deleteTask: (taskId) => {
    const url = `${API_BASE_URL}/api/tasks/${taskId}`;
    return apiRequest(url, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
  completeTask: (taskId) => {
    const url = `${API_BASE_URL}/api/tasks/${taskId}/complete`;
    return apiRequest(url, {
      method: 'PATCH',
      credentials: 'include',
    });
  },
  incompleteTask: (taskId) => {
    const url = `${API_BASE_URL}/api/tasks/${taskId}/incomplete`;
    return apiRequest(url, {
      method: 'PATCH',
      credentials: 'include',
    });
  },
  
  // Document endpoints - make direct backend calls to ensure cookies are sent
  getDocuments: (caseId) => {
    const url = `${API_BASE_URL}/api/cases/${caseId}/documents`;
    return apiRequest(url, { credentials: 'include' });
  },
  uploadDocument: (caseId, formData) => {
    const url = `${API_BASE_URL}/api/cases/${caseId}/documents`;
    return apiRequest(url, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
      credentials: 'include',
    });
  },
  deleteDocument: (docId) => {
    const url = `${API_BASE_URL}/api/documents/${docId}`;
    return apiRequest(url, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
  downloadDocument: (docId) => {
    const url = `${API_BASE_URL}/api/documents/${docId}/download`;
    return apiRequest(url, { credentials: 'include' });
  },
  previewDocument: (docId) => {
    const url = `${API_BASE_URL}/api/documents/${docId}/preview`;
    return apiRequest(url, { credentials: 'include' });
  },
};

export default API;
