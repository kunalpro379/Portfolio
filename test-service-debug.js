import dotenv from 'dotenv';
dotenv.config();

console.log('Testing AI Chat Service Import...');

try {
  const { default: AIChatService } = await import('./server/services/aiChatService.js');
  console.log('✅ Service imported successfully');
  
  // Test local data loading
  console.log('Testing local data loading...');
  const localData = AIChatService.loadLocalData();
  console.log('Local data loaded:', Object.keys(localData));
  
  if (localData.timetable) {
    console.log('✅ Timetable data found');
    console.log('College:', localData.timetable.college);
    console.log('Days available:', Object.keys(localData.timetable.timetable));
  } else {
    console.log('❌ No timetable data found');
  }
  
  // Test local search
  console.log('\nTesting local search...');
  const searchResults = AIChatService.searchLocalData('Tuesday 10:30', localData);
  console.log('Search results:', searchResults.length);
  if (searchResults.length > 0) {
    console.log('First result:', searchResults[0].content);
  }
  
} catch (error) {
  console.error('❌ Error importing or testing service:', error);
  console.error('Stack trace:', error.stack);
}