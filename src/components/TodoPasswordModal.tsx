import { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface TodoPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (persistFor: 'day' | 'always') => void;
  mode: 'view' | 'create' | 'edit';
}

export default function TodoPasswordModal({ isOpen, onClose, onSuccess, mode }: TodoPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [persistFor, setPersistFor] = useState<'day' | 'always'>('day');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check password (you can change this to match your actual password)
    if (password === 'kunalpatil.me') {
      onSuccess(persistFor);
      setPassword('');
      onClose();
    } else {
      setError('Incorrect password! Please try again.');
      setPassword('');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return 'View Todos';
      case 'create':
        return 'Create Todo';
      case 'edit':
        return 'Edit Todo';
      default:
        return 'Authentication Required';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'view':
        return 'Enter password to view your todos';
      case 'create':
        return 'Enter password to create a new todo';
      case 'edit':
        return 'Enter password to edit this todo';
      default:
        return 'Enter password to continue';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div 
        className="bg-white border border-gray-300 rounded-lg max-w-md w-full shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 border-b border-red-800 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-gray-200 rounded-md">
                <Lock size={20} strokeWidth={2} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {getTitle()}
                </h2>
                <p className="text-sm font-normal text-red-100">
                  {getDescription()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white hover:bg-red-700 rounded transition-all"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                autoFocus
                required
              />
              {error && (
                <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} strokeWidth={2} />
                  {error}
                </p>
              )}
            </div>

            {/* Persistence Option */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Remember Me
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPersistFor('day')}
                  className={`flex-1 px-4 py-2.5 border rounded-md font-medium transition-all ${
                    persistFor === 'day'
                      ? 'bg-red-600 text-white border-red-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  For 1 Day
                </button>
                <button
                  type="button"
                  onClick={() => setPersistFor('always')}
                  className={`flex-1 px-4 py-2.5 border rounded-md font-medium transition-all ${
                    persistFor === 'always'
                      ? 'bg-red-600 text-white border-red-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Always
                </button>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-2">
                {persistFor === 'day'
                  ? 'Authentication will expire after 24 hours'
                  : 'You will stay authenticated until you clear browser data'}
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs font-medium text-gray-700 flex items-start gap-2">
                <AlertCircle size={14} strokeWidth={2} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>
                  This is a private section. Only authorized users can access and modify todos.
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-5 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 bg-white border border-gray-300 rounded-md font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-800 rounded-md font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Lock size={16} strokeWidth={2} />
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
