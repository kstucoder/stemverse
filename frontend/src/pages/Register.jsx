import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Parollar mos kelmadi'); return; }
    if (form.password.length < 6) { toast.error("Parol kamida 6 belgidan iborat bo'lishi kerak"); return; }
    try {
      await register(form.name, form.email, form.password);
      toast.success('Hisob yaratildi!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fields = [
    { key: 'name',            label: 'Ismingiz',        type: 'text',     icon: User,  placeholder: 'To\'liq ismingiz'      },
    { key: 'email',           label: 'Email',           type: 'email',    icon: Mail,  placeholder: 'email@example.com'     },
    { key: 'password',        label: 'Parol',           type: 'password', icon: Lock,  placeholder: 'Kamida 6 belgi'        },
    { key: 'confirmPassword', label: 'Parolni takror',  type: 'password', icon: Lock,  placeholder: 'Parolni qayta kiriting' },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,238,255,0.05), transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,93,229,0.04), transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,238,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.02) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
      </div>

      <div className="relative w-full max-w-md py-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div
              style={{
                width: 64, height: 64, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                background: 'linear-gradient(145deg, #0b3a4a, #04202e)',
                border: '2px solid rgba(0,238,255,0.4)',
                boxShadow: '0 0 32px rgba(0,238,255,0.25)',
              }}
            >
              <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,238,255,0.6), transparent 70%)' }} />
              <Zap className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.1em', lineHeight: 1 }}>
                <span className="text-white">STEM</span>
                <span style={{ color: 'var(--cyan)', textShadow: '0 0 12px rgba(0,238,255,0.6)' }}>VERSE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Chakra Petch, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>
                Muhandis bo'lish vaqti keldi
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
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,105,32,0.3), transparent)', borderRadius: '16px 16px 0 0' }} />

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.05em', color: 'white', marginBottom: 6 }}>
              Hisob yaratish
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>
              Sarguzashtni boshlash uchun ro'yxatdan o'ting
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>
                    {label}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={type === 'password' ? (showPw ? 'text' : 'password') : type}
                      value={form[key]}
                      onChange={e => u(key, e.target.value)}
                      placeholder={placeholder}
                      className="input-field"
                      style={{ paddingLeft: '2.5rem', paddingRight: type === 'password' && key === 'password' ? '2.5rem' : undefined }}
                      required
                    />
                    {key === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                style={{ marginTop: 8 }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Yaratilmoqda...</>
                  : 'Hisob yaratish →'
                }
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(0,238,255,0.06)', paddingTop: '1.25rem' }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>
              Hisobingiz bormi?{' '}
            </span>
            <Link
              to="/auth/login"
              style={{ color: 'var(--cyan)', fontFamily: 'Chakra Petch, monospace', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.04em' }}
            >
              Kirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
