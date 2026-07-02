import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Zap, Lock, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Parollar mos kelmadi');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      toast.success('Parol yangilandi!');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-void)' }}
    >
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,238,255,0.05), transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,238,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.02) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #0b3a4a, #04202e)', border: '2px solid rgba(0,238,255,0.35)', boxShadow: '0 0 24px rgba(0,238,255,0.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,238,255,0.55), transparent 70%)' }} />
              <Zap className="w-6 h-6 text-white relative z-10" />
            </div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.1em' }}>
              <span className="text-white">VOL</span>
              <span style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(0,238,255,0.5)' }}>TRA</span>
            </div>
          </Link>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #080E1C, #0B1120)',
            border: '1px solid rgba(0,238,255,0.12)',
            borderRadius: 16, padding: '2rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.2), transparent)', borderRadius: '16px 16px 0 0' }} />

          {done ? (
            <div className="text-center py-4">
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle className="w-7 h-7" style={{ color: '#00FF88' }} />
              </div>
              <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.2rem', color: 'white', marginBottom: 10 }}>
                Parol yangilandi
              </h2>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Kirish sahifasiga yo'naltirilmoqda...
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.04em', color: 'white', marginBottom: 6 }}>
                  Yangi parol
                </h2>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', lineHeight: 1.55 }}>
                  Hisobingiz uchun yangi parol o'rnating.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>
                      Yangi parol
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>
                      Parolni tasdiqlang
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading
                      ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Yangilanmoqda...</>
                      : 'Parolni yangilash'
                    }
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '1.5rem' }}>
                <Link
                  to="/auth/login"
                  style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kirishga qaytish
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
