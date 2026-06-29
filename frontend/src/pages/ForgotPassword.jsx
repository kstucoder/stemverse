import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); toast.success('Reset link sent!'); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-2"><Zap className="w-8 h-8 text-white" /></div>
          <h1 className="font-game text-3xl text-white">STEM<span className="text-gradient">VERSE</span></h1>
        </div>
        <div className="card-glow">
          {sent ? (
            <div className="text-center py-6">
              <h2 className="text-xl font-game text-white mb-2">Check Your Email</h2>
              <p className="text-dark-400 mb-6">Reset link sent to <strong className="text-white">{email}</strong></p>
              <Link to="/auth/login" className="text-brand-400 hover:text-brand-300">Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-game text-white mb-2">Reset Password</h2>
              <p className="text-dark-400 mb-6">Enter your email to get a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field pl-10" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
              </form>
              <div className="mt-6">
                <Link to="/auth/login" className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" /> Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
