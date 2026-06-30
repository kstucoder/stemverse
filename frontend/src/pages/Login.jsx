import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const { login, loading }      = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Xush kelibsiz!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,238,255,0.06), transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,93,229,0.05), transparent 70%)', filter: 'blur(40px)' }} />
        {/* Circuit grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,238,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.025) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(145deg, #0b3a4a, #04202e)',
                border: '2px solid rgba(0,238,255,0.4)',
                boxShadow: '0 0 32px rgba(0,238,255,0.25)',
              }}
            >
              <div
                className="absolute inset-3 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(0,238,255,0.6), transparent 70%)' }}
              />
              <Zap className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <div
                style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.1em', lineHeight: 1 }}
              >
                <span className="text-white">STEM</span>
                <span style={{ color: 'var(--cyan)', textShadow: '0 0 12px rgba(0,238,255,0.6)' }}>VERSE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Chakra Petch, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>
                Yasang · Ulang · O'rganing
              </p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #080E1C, #0B1120)',
            border: '1px solid rgba(0,238,255,0.12)',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,238,255,0.04)',
            position: 'relative',
          }}
        >
          {/* Top glow line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.25), transparent)', borderRadius: '16px 16px 0 0' }} />

          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.05em', color: 'white', marginBottom: 6 }}
            >
              Kirish
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>
              Missiyalaringizni davom ettiring
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>
                  Parol
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div style={{ textAlign: 'right' }}>
                <Link
                  to="/auth/forgot-password"
                  style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', color: 'var(--cyan)', letterSpacing: '0.05em' }}
                >
                  Parolni unutdingizmi?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                style={{ marginTop: 8 }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Kirish...</>
                  : 'Kirish →'
                }
              </button>
            </div>
          </form>

          <div
            style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(0,238,255,0.06)', paddingTop: '1.25rem' }}
          >
            <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>
              Hisobingiz yo'qmi?{' '}
            </span>
            <Link
              to="/auth/register"
              style={{ color: 'var(--cyan)', fontFamily: 'Chakra Petch, monospace', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.04em' }}
            >
              Ro'yxatdan o'ting
            </Link>
          </div>
        </div>

        {/* Demo creds */}
        <div
          style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(0,238,255,0.04)', border: '1px solid rgba(0,238,255,0.08)', textAlign: 'center' }}
        >
          <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Demo: student@stemverse.io / student123
          </span>
        </div>
      </div>
    </div>
  );
}
