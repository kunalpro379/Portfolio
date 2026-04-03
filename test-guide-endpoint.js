// Test script to check guide-notes endpoint
import fetch from 'node-fetch';

async function testGuideEndpoint() {
  try {
    console.log('Testing GET /api/guide-notes/guides...');
    const response = await fetch('http://localhost:5000/api/guide-notes/guides');
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Parsed data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGuideEndpoint();
