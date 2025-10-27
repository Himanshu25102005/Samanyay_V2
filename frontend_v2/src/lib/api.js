/**
 * API configuration and utility functions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    console.log('Request options:', config);

    const response = await fetch(url, config);
    
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
  getUser: () => apiRequest('/api/user'),
  
  // Case endpoints
  getCases: () => apiRequest('/api/cases'),
  createCase: (caseData) => apiRequest('/api/cases', {
    method: 'POST',
    body: JSON.stringify(caseData),
  }),
  updateCase: (caseId, caseData) => apiRequest(`/api/cases/${caseId}`, {
    method: 'PUT',
    body: JSON.stringify(caseData),
  }),
  deleteCase: (caseId) => apiRequest(`/api/cases/${caseId}`, {
    method: 'DELETE',
  }),
  
  // Task endpoints
  getTasks: (caseId) => apiRequest(`/api/cases/${caseId}/tasks`),
  createTask: (caseId, taskData) => apiRequest(`/api/cases/${caseId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  updateTask: (taskId, taskData) => apiRequest(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),
  deleteTask: (taskId) => apiRequest(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  }),
  completeTask: (taskId) => apiRequest(`/api/tasks/${taskId}/complete`, {
    method: 'PATCH',
  }),
  incompleteTask: (taskId) => apiRequest(`/api/tasks/${taskId}/incomplete`, {
    method: 'PATCH',
  }),
  
  // Document endpoints
  getDocuments: (caseId) => apiRequest(`/api/cases/${caseId}/documents`),
  uploadDocument: (caseId, formData) => apiRequest(`/api/cases/${caseId}/documents`, {
    method: 'POST',
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  }),
  deleteDocument: (docId) => apiRequest(`/api/documents/${docId}`, {
    method: 'DELETE',
  }),
  downloadDocument: (docId) => apiRequest(`/api/documents/${docId}/download`),
  previewDocument: (docId) => apiRequest(`/api/documents/${docId}/preview`),
};

export default API;
