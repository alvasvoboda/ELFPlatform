import { useState } from 'react';
import { LogIn, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
              <Zap className="text-white" size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
            CAISO Load Forecasting
          </h1>
          <p className="text-slate-500 text-center mb-8">
            Day-ahead bidding intelligence platform
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleDemoLogin}
              type="button"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-all"
            >
              Use Demo Account
            </button>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 mb-2">Available accounts:</p>
              <p className="text-xs text-slate-600">Demo: demo@example.com / demo123</p>
              <p className="text-xs text-slate-600">Admin: admin@elfp.com / admin123</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Secure access to day-ahead market analytics
        </p>
      </div>
    </div>
  );
}
