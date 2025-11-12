// ============================================================================
// DEVELOPMENT/TEST FILE - DO NOT DEPLOY TO PRODUCTION
// ============================================================================
// Test script to check if backend is reachable
// This file is for development and testing purposes only.
// ============================================================================

const BACKEND_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('Testing backend connection...');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test 1: Check if backend is running
    const response = await fetch(`${BACKEND_URL}/api/test`);
    console.log('\n1. Backend test endpoint:', response.status, response.statusText);
    const data = await response.json();
    console.log('Response:', data);
    
    // Test 2: Try to get cases
    const casesResponse = await fetch(`${BACKEND_URL}/api/cases`);
    console.log('\n2. Cases endpoint:', casesResponse.status, casesResponse.statusText);
    const casesData = await casesResponse.json();
    console.log('Response:', casesData);
    
  } catch (error) {
    console.error('\n❌ Backend connection failed:', error.message);
    console.error('Make sure the backend server is running on port 5000');
    console.error('Run: cd backend_v2 && npm start');
  }
}

testBackend();

