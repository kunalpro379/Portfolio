import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Hand-drawn background elements */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sketch-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10 10 Q 30 5, 50 10 T 90 10" stroke="black" fill="none" strokeWidth="0.5"/>
              <circle cx="20" cy="50" r="15" stroke="black" fill="none" strokeWidth="0.5"/>
              <path d="M60 60 L 80 80 M 80 60 L 60 80" stroke="black" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sketch-pattern)"/>
        </svg>
      </div>

      {/* Floating sketch elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border-2 border-black rounded-full opacity-10 animate-float" 
           style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-black opacity-10 animate-float"
           style={{ animationDelay: '2s', animationDuration: '8s', transform: 'rotate(45deg)' }}></div>
      <div className="absolute top-1/3 right-10 w-16 h-16 border-2 border-black rounded-full opacity-10 animate-float"
           style={{ animationDelay: '4s', animationDuration: '7s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card with hand-drawn border effect */}
        <div className="bg-white relative">
          {/* Hand-drawn border effect */}
          <div className="absolute inset-0 border-4 border-black rounded-3xl transform rotate-1"></div>
          <div className="absolute inset-0 border-4 border-black rounded-3xl transform -rotate-1"></div>
          
          <div className="relative bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Header with sketch icon */}
            <div className="text-center mb-8">
              <div className="inline-block relative mb-4">
                <div className="w-20 h-20 border-4 border-black rounded-full flex items-center justify-center bg-white transform -rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Lock className="w-10 h-10 text-black" strokeWidth={2.5} />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-black animate-pulse" />
              </div>
              
              <h1 className="text-4xl font-black text-black mb-2 tracking-tight" 
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Admin Panel
              </h1>
              <div className="relative inline-block">
                <p className="text-gray-600 font-medium">Sign in to access the dashboard</p>
                <svg className="absolute -bottom-1 left-0 w-full" height="4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 2 Q 50 4, 100 2 T 200 2" stroke="black" fill="none" strokeWidth="1" opacity="0.3"/>
                </svg>
              </div>
            </div>

            {/* Error message with sketch style */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-3 border-black rounded-xl relative transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-black text-sm font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-white border-3 border-black rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/20 transition font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-white border-3 border-black rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/20 transition font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white font-black py-4 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] uppercase tracking-wider"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer with hand-drawn underline */}
        <div className="text-center mt-8 relative">
          <p className="text-gray-600 text-sm font-medium inline-block">
            © 2026 Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
