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
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close password drawer"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-[460px] bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.16)] border-l border-slate-200 flex flex-col">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <Lock size={18} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{getTitle()}</h2>
                <p className="text-sm text-slate-500">{getDescription()}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Remember Me
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPersistFor('day')}
                  className={`flex-1 px-4 py-3 border rounded-xl font-medium transition-colors ${
                    persistFor === 'day'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  For 1 Day
                </button>
                <button
                  type="button"
                  onClick={() => setPersistFor('always')}
                  className={`flex-1 px-4 py-3 border rounded-xl font-medium transition-colors ${
                    persistFor === 'always'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Always
                </button>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-2">
                {persistFor === 'day'
                  ? 'Authentication will expire after 24 hours'
                  : 'You will stay authenticated until you clear browser data'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-medium text-slate-600 flex items-start gap-2">
                <AlertCircle size={14} strokeWidth={2} className="text-slate-500 flex-shrink-0 mt-0.5" />
                <span>
                  This is a private section. Only authorized users can access and modify todos.
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 p-5 bg-white flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-slate-900 text-white border border-slate-900 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
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
