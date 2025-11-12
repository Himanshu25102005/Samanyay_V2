// ============================================================================
// DEVELOPMENT/TEST FILE - DO NOT DEPLOY TO PRODUCTION
// ============================================================================
// Test script to verify backend connection
// Run with: node test-backend-connection.js
// This file is for development and testing purposes only.
// ============================================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';

async function testBackendConnection() {
  console.log('Testing backend connection...');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test the cases endpoint
    const response = await fetch(`${BACKEND_URL}/api/cases`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful!');
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Backend responded with error:', response.status);
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Failed to connect to backend:');
    console.log('Error:', error.message);
    console.log('Make sure your backend is running and accessible at:', BACKEND_URL);
  }
}

testBackendConnection();
