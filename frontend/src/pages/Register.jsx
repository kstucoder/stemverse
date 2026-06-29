import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try { await register(form.name, form.email, form.password); toast.success('Account created! 🚀'); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
  };

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-2"><Zap className="w-8 h-8 text-white" /></div>
          <h1 className="font-game text-3xl text-white">STEM<span className="text-gradient">VERSE</span></h1>
          <p className="text-dark-400 mt-2">Begin your electronics adventure!</p>
        </div>
        <div className="card-glow">
          <h2 className="text-2xl font-game text-white mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-300 mb-1.5">Name</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" /><input type="text" value={form.name} onChange={e => u('name', e.target.value)} placeholder="Your name" className="input-field pl-10" required /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-300 mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" /><input type="email" value={form.email} onChange={e => u('email', e.target.value)} placeholder="your@email.com" className="input-field pl-10" required /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => u('password', e.target.value)} placeholder="Min 6 characters" className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-300 mb-1.5">Confirm Password</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" /><input type="password" value={form.confirmPassword} onChange={e => u('confirmPassword', e.target.value)} placeholder="Repeat password" className="input-field pl-10" required /></div>
            </div>
            <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-dark-400">Have an account? <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
