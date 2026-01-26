// Test the minimal AI service directly
import MinimalAIChatService from './server/services/aiChatService.minimal.js';

async function testMinimalAI() {
  console.log('🧪 Testing Minimal AI Chat Service...\n');
  
  try {
    // Test queries
    const testQueries = [
      "What class do I have Tuesday at 10:30?",
      "What classes are on Friday?", 
      "Show me Monday schedule",
      "What class do I have Saturday at 10:30?",
      "Who is teaching Machine Learning?"
    ];
    
    for (const query of testQueries) {
      console.log(`📝 Query: "${query}"`);
      console.log('─'.repeat(50));
      
      const result = await MinimalAIChatService.chat(query);
      
      if (result.success) {
        console.log(`✅ Response: ${result.message}`);
        console.log(`📊 Context Used: ${result.contextUsed}`);
        console.log(`⏱️  Response Time: ${result.responseTime}ms`);
        if (result.sources && result.sources.length > 0) {
          console.log(`📚 Sources: ${result.sources.map(s => s.section).join(', ')}`);
        }
      } else {
        console.log(`❌ Error: ${result.message}`);
      }
      console.log('');
    }
    
    // Test health check
    console.log('🏥 Health Check:');
    console.log('─'.repeat(50));
    const health = await MinimalAIChatService.healthCheck();
    console.log(JSON.stringify(health, null, 2));
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMinimalAI();