// Test script to check guide creation endpoint
import fetch from 'node-fetch';

async function testCreateGuide() {
  try {
    console.log('Testing POST /api/guide-notes/guides...');
    
    const testData = {
      name: 'Test Guide',
      topic: 'Testing',
      description: 'Test description'
    };
    
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://api.kunalpatil.me/api/guide-notes/guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
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

testCreateGuide();
