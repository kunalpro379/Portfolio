import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Lock, Edit3 } from 'lucide-react';
import { fetchTodoById, updateTodo, isAuthenticated, setAuthToken, type Todo } from '@/services/todoApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const CORRECT_PASSWORD = 'kunal';

export default function TodoDetail() {
  const navigate = useNavigate();
  const { todoId } = useParams<{ todoId: string }>();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      loadTodo();
    } else {
      setShowPasswordModal(true);
      setLoading(false);
    }
  }, [todoId]);

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setAuthToken(rememberMe ? 'always' : 'day');
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      loadTodo();
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const loadTodo = async () => {
    try {
      setLoading(true);
      const data = await fetchTodoById(todoId!);
      setTodo(data);
    } catch (error) {
      console.error('Error loading todo:', error);
      alert('Failed to load todo');
    } finally {
      setLoading(false);
    }
  };
