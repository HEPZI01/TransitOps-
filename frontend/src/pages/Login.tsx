import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Truck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0F] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#16161A] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-[#0B0B0F] border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
            TransitOps
          </h2>
          <p className="mt-2 text-center text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Transport Operations System
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[#FF3333]/10 border border-[#FF3333]/20 text-[#FF3333] px-4 py-3 rounded-2xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/5 placeholder-gray-600 text-white rounded-2xl focus:outline-none focus:border-white/20 focus:ring-0 transition-colors text-sm"
                placeholder="admin@transitops.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/5 placeholder-gray-600 text-white rounded-2xl focus:outline-none focus:border-white/20 focus:ring-0 transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white text-black text-sm font-bold rounded-2xl hover:bg-white/90 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="bg-[#0B0B0F] rounded-2xl p-4 border border-white/5 text-center text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-400">Demo credentials:</p>
            <p>admin@transitops.com / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
