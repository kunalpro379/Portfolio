// Simple test script to verify todo API functionality
const API_BASE_URL = 'https://api.kunalpatil.me';

async function testTodoAPI() {
  console.log('Testing Todo API...\n');

  try {
    // Test 1: Fetch all todos
    console.log('1. Fetching all todos...');
    const todosResponse = await fetch(`${API_BASE_URL}/api/todos`);
    const todosData = await todosResponse.json();
    console.log('✓ Todos fetched:', todosData.todos.length, 'todos found');
    
    if (todosData.todos.length > 0) {
      const firstTodo = todosData.todos[0];
      console.log('First todo:', firstTodo.topic);
      
      // Test 2: Fetch single todo details
      console.log('\n2. Fetching single todo details...');
      const todoResponse = await fetch(`${API_BASE_URL}/api/todos/${firstTodo.todoId}`);
      const todoData = await todoResponse.json();
      console.log('✓ Todo details fetched:', todoData.todo.topic);
      console.log('  - Content:', todoData.todo.content);
      console.log('  - Points:', todoData.todo.points.length);
      console.log('  - Links:', todoData.todo.links.length);
    }

    // Test 3: Fetch performance stats
    console.log('\n3. Fetching performance stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/todos/stats/performance`);
    const statsData = await statsResponse.json();
    console.log('✓ Performance stats fetched:');
    console.log('  - Total todos:', statsData.totalTodos);
    console.log('  - Total points:', statsData.totalPoints);
    console.log('  - Overall percentage:', statsData.overallPercentage + '%');

    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testTodoAPI();