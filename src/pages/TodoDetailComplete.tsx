import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Lock, Edit3, Eye, Settings } from 'lucide-react';
import { fetchTodoById, updateTodo, isAuthenticated, setAuthToken, type Todo, type TodoPoint, type CustomColumn } from '@/services/todoApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const CORRECT_PASSWORD = 'kunal';

export default function TodoDetail() {
  const navigate = useNavigate();
  const { todoId } = useParams<{ todoId: string }>();
  
  const [showPasswordModal, setShowPasswo