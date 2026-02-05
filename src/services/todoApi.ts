import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export interface TodoPoint {
  text: string;
  status: 'pending' | 'working' | 'done';
  completedAt?: string;
}

export interface TodoLink {
  title: string;
  url: string;
}

export interface Todo {
  todoId: string;
  topic: string;
  content: string;
  points: TodoPoint[];
  links: TodoLink[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoStats {
  total: number;
  done: number;
  working: number;
  pending: number;
  percentage: number;
}

export interface PerformanceStats {
  totalTodos: number;
  totalPoints: number;
  donePoints: number;
  workingPoints: number;
  pendingPoints: number;
  overallPercentage: number;
  completedTodos: number;
}

export interface CreateTodoData {
  topic: string;
  content: string;
  points: TodoPoint[];
  links?: TodoLink[];
}

export interface UpdateTodoData {
  topic?: string;
  content?: string;
  points?: TodoPoint[];
  links?: TodoLink[];
}

// Get authentication token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('todoAuthToken');
};

// Set authentication token with expiry
export const setAuthToken = (persistFor: 'day' | 'always') => {
  const token = 'authenticated'; // Simple token for demo
  const expiry = persistFor === 'day' 
    ? Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    : Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year (effectively "always")
  
  localStorage.setItem('todoAuthToken', token);
  localStorage.setItem('todoAuthExpiry', expiry.toString());
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const expiry = localStorage.getItem('todoAuthExpiry');
  
  if (!token || !expiry) return false;
  
  const expiryTime = parseInt(expiry, 10);
  if (Date.now() > expiryTime) {
    // Token expired, clear storage
    clearAuthToken();
    return false;
  }
  
  return true;
};

// Clear authentication
export const clearAuthToken = () => {
  localStorage.removeItem('todoAuthToken');
  localStorage.removeItem('todoAuthExpiry');
};

// Fetch all todos
export const fetchTodos = async (): Promise<Todo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.todos}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    
    const data = await response.json();
    return data.todos || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

// Fetch performance stats
export const fetchPerformanceStats = async (): Promise<PerformanceStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.todos}/stats/performance`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance stats');
    }
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    throw error;
  }
};

// Create a new todo
export const createTodo = async (todoData: CreateTodoData): Promise<Todo> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.todos}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    
    const data = await response.json();
    return data.todo;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

// Update a todo
export const updateTodo = async (todoId: string, updateData: UpdateTodoData): Promise<Todo> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.todos}/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    
    const data = await response.json();
    return data.todo;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// Toggle a point's status (cycles through pending -> working -> done -> pending)
export const toggleTodoPoint = async (
  todoId: string,
  pointIndex: number
): Promise<Todo> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.todos}/${todoId}/points/${pointIndex}/toggle`,
      {
        method: 'PUT',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to toggle point');
    }
    
    const data = await response.json();
    return data.todo;
  } catch (error) {
    console.error('Error toggling point:', error);
    throw error;
  }
};

// Update a specific point's status
export const updatePointStatus = async (
  todoId: string,
  pointIndex: number,
  status: 'pending' | 'working' | 'done'
): Promise<Todo> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.todos}/${todoId}/points/${pointIndex}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update point status');
    }
    
    const data = await response.json();
    return data.todo;
  } catch (error) {
    console.error('Error updating point status:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (todoId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.todos}/${todoId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};
