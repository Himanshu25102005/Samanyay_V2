// ============================================================================
// DEVELOPMENT/DEBUG FILE - DO NOT DEPLOY TO PRODUCTION
// ============================================================================
// Debug script to check environment variables
// This file is for development and debugging purposes only.
// ============================================================================

console.log('=== ENVIRONMENT DEBUG ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Raw value type:', typeof process.env.NEXT_PUBLIC_API_URL);
console.log('Raw value length:', process.env.NEXT_PUBLIC_API_URL?.length);
console.log('Ends with slash:', process.env.NEXT_PUBLIC_API_URL?.endsWith('/'));
console.log('Starts with https:', process.env.NEXT_PUBLIC_API_URL?.startsWith('https'));
console.log('Contains double slash:', process.env.NEXT_PUBLIC_API_URL?.includes('//'));

// Test URL construction
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

console.log('=== URL CONSTRUCTION TEST ===');
console.log('Raw API URL:', rawApiUrl);
console.log('Clean API_BASE_URL:', API_BASE_URL);

// Test different endpoints
const endpoints = ['/api/user', 'api/user', '/api/cases', 'api/cases'];
endpoints.forEach(endpoint => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  console.log(`Endpoint: ${endpoint} -> URL: ${url}`);
});
console.log('=============================');
