// ============================================================================
// DEVELOPMENT/TEST FILE - DO NOT DEPLOY TO PRODUCTION
// ============================================================================
// Test script to verify all backend routes are working
// This file is for development and testing purposes only.
// ============================================================================

const express = require('express');
const request = require('supertest');
const app = require('./app');

async function testRoutes() {
  console.log('Testing backend routes...\n');

  // Test cases routes
  console.log('1. Testing GET /api/cases...');
  try {
    const response = await request(app).get('/api/cases');
    console.log('Status:', response.status);
    console.log('Response:', response.body);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n2. Testing POST /api/cases...');
  try {
    const response = await request(app).post('/api/cases')
      .send({
        clientName: 'Test Client',
        clientPhone: '1234567890',
        clientEmail: 'test@example.com',
        caseSummary: 'Test case',
        nextSteps: 'Test steps',
        status: 'Active'
      });
    console.log('Status:', response.status);
    console.log('Response:', response.body);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n3. Testing GET /api/user...');
  try {
    const response = await request(app).get('/api/user');
    console.log('Status:', response.status);
    console.log('Response:', response.body);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n4. Testing GET /api/test...');
  try {
    const response = await request(app).get('/api/test');
    console.log('Status:', response.status);
    console.log('Response:', response.body);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n5. Testing 404 route...');
  try {
    const response = await request(app).get('/api/nonexistent');
    console.log('Status:', response.status);
    console.log('Response:', response.body);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testRoutes().then(() => {
  console.log('\nRoute testing completed.');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
