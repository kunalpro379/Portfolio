import AIChatService from './server/services/aiChatService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testChatbot() {
  console.log('🤖 Testing Enhanced AI Chatbot with Direct Timetable Support\n');
  
  try {
    // Test timetable queries
    const testQueries = [
      "What class do I have Tuesday at 9:30?",
      "What class do I have Tuesday at 10:30?", 
      "What classes are on Friday?",
      "What class do I have Saturday at 10:30?",
      "Show me Monday schedule",
      "What is my timetable?",
      "Who is teaching RL?",
      "What classes do I have on Wednesday?"
    ];
    
    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      console.log('─'.repeat(50));
      
      const startTime = Date.now();
      const result = await AIChatService.chat(query);
      const responseTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ Response: ${result.message}`);
        console.log(`📊 Context Used: ${result.contextUsed}`);
        console.log(`⏱️  Response Time: ${responseTime}ms`);
        if (result.sources && result.sources.length > 0) {
          console.log(`📚 Sources: ${result.sources.map(s => s.section).join(', ')}`);
        }
      } else {
        console.log(`❌ Error: ${result.message}`);
      }
    }
    
    // Test health check
    console.log('\n🏥 Health Check:');
    console.log('─'.repeat(50));
    const health = await AIChatService.healthCheck();
    console.log(JSON.stringify(health, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testChatbot();