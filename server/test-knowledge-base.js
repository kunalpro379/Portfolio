// Simple test script to check if knowledge base route is working
import fetch from 'node-fetch';

const API_BASE = 'https://api.kunalpatil.me';

async function testKnowledgeBaseRoute() {
  console.log('🧪 Testing Knowledge Base API routes...\n');
  
  const tests = [
    { name: 'Test Route', url: `${API_BASE}/api/knowledge-base/test` },
    { name: 'Health Check', url: `${API_BASE}/api/knowledge-base/health` },
    { name: 'Get Files', url: `${API_BASE}/api/knowledge-base/files` },
    { name: 'Get Stats', url: `${API_BASE}/api/knowledge-base/stats` }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔄 Testing ${test.name}...`);
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

testKnowledgeBaseRoute();