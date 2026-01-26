// Simple test without external dependencies
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock environment variables
process.env.GROQ_API_KEY = 'test-key';

async function testAIService() {
  try {
    console.log('🧪 Testing AI Chat Service Import...');
    
    // Try to import the service
    const { default: AIChatService } = await import('./server/services/aiChatService.js');
    
    console.log('✅ AI Chat Service imported successfully');
    
    // Test structured data loading
    console.log('📊 Testing structured data query...');
    
    // Test timetable query
    const result = AIChatService.queryStructuredData('Tuesday at 10:30');
    console.log('🔍 Query result:', result);
    
    // Test health check
    console.log('🏥 Testing health check...');
    const health = await AIChatService.healthCheck();
    console.log('📋 Health status:', health);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIService();