// Test script to verify API URL construction
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function testApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;
  
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Clean endpoint: ${cleanEndpoint}`);
  console.log(`Clean base URL: ${cleanBaseUrl}`);
  console.log(`Final URL: ${url}`);
  console.log('---');
}

// Test cases
testApiUrl('/api/user');
testApiUrl('api/user');
testApiUrl('/api/cases');
testApiUrl('api/cases');

console.log('Environment check:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
