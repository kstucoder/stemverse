import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await login(email, password); toast.success('Welcome back!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center"><Zap className="w-8 h-8 text-white" /></div>
          </Link>
          <h1 className="font-game text-3xl text-white">STEM<span className="text-gradient">VERSE</span></h1>
          <p className="text-dark-400 mt-2">Build. Connect. Play. Learn.</p>
        </div>
        <div className="card-glow">
          <h2 className="text-2xl font-game text-white mb-6">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-dark-400">No account? <Link to="/auth/register" className="text-brand-400 hover:text-brand-300 font-semibold">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
