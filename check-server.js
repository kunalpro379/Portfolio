#!/usr/bin/env node

import fetch from 'node-fetch';

const servers = [
  { name: 'Local Server', url: 'http://localhost:5000' },
  { name: 'Production Server', url: 'https://api.kunalpatil.me' }
];

async function checkServer(server) {
  try {
    console.log(`🔄 Checking ${server.name}...`);
    
    const response = await fetch(`${server.url}/api/health`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${server.name}: ONLINE`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message || 'OK'}\n`);
      return true;
    } else {
      console.log(`❌ ${server.name}: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${server.name}: ${error.message}`);
    return false;
  }
}

async function checkAllServers() {
  console.log('🏥 Server Health Check\n');
  
  let anyOnline = false;
  
  for (const server of servers) {
    const isOnline = await checkServer(server);
    if (isOnline) anyOnline = true;
  }
  
  if (anyOnline) {
    console.log('✅ At least one server is available!');
  } else {
    console.log('❌ No servers are available. Please start the local server:');
    console.log('   cd server && npm run dev');
  }
}

checkAllServers();