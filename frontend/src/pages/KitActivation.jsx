import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Zap, CheckCircle, ArrowLeft } from 'lucide-react';
import { kitAPI } from '../lib/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function KitActivation() {
  const [code,      setCode]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [activated, setActivated] = useState(false);
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Kodni kiriting'); return; }
    setLoading(true);
    try {
      const { data } = await kitAPI.activate(code.trim().toUpperCase());
      setActivated(true);
      toast.success(`To'plam aktivlashtirildi! +${data.xpEarned} XP`);
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,196,0,0.04), transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,238,255,0.04), transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,196,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,196,0,0.015) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
      </div>

      <div className="relative w-full max-w-lg">

        {activated ? (
          /* ── Success state ── */
          <div
            style={{
              borderRadius: 20, padding: '48px 32px',
              background: 'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,238,255,0.03))',
              border: '1px solid rgba(0,255,136,0.15)',
              textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)' }} />
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}>
              <CheckCircle className="w-8 h-8" style={{ color: '#00FF88' }} />
            </div>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: 12, letterSpacing: '0.04em' }}>
              To'plam Aktivlashtirildi!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', marginBottom: 28, lineHeight: 1.6 }}>
              VOLTRA to'plamingiz muvaffaqiyatli ulandi. Endi barcha missiyalarga kirish ochiq!
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Asosiy →
              </button>
              <button onClick={() => navigate('/lessons')} className="btn-secondary">
                Missiyalar
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div
                style={{
                  width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(145deg, rgba(255,196,0,0.12), rgba(255,105,32,0.08))',
                  border: '1px solid rgba(255,196,0,0.25)',
                  boxShadow: '0 0 40px rgba(255,196,0,0.1)',
                }}
              >
                <Gift className="w-8 h-8" style={{ color: '#FFC400' }} />
              </div>
              <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '0.05em', color: 'white', marginBottom: 8 }}>
                KITni Aktivlashtirish
              </h1>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', lineHeight: 1.55 }}>
                STEMVERSE to'plam qutisidagi kodni kiriting va missiyalarni oching
              </p>
            </div>

            {/* Card */}
            <div
              style={{
                borderRadius: 16, padding: '2rem',
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: '1px solid rgba(255,196,0,0.1)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,196,0,0.25), transparent)', borderRadius: '16px 16px 0 0' }} />

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 10 }}>
                    Aktivlashtirish kodi
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="SV-XXXX-XXXX"
                    maxLength={20}
                    autoFocus
                    required
                    style={{
                      display: 'block', width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,196,0,0.15)',
                      borderRadius: 12, padding: '18px 20px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600, fontSize: '1.5rem',
                      letterSpacing: '0.25em', textAlign: 'center',
                      color: '#FFC400',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      caretColor: '#FFC400',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(255,196,0,0.4)'; e.target.style.boxShadow = '0 0 20px rgba(255,196,0,0.1)'; }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(255,196,0,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', marginTop: 8, textAlign: 'center' }}>
                    STEMVERSE to'plam qutisi ichidagi stikerda topishingiz mumkin
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 3}
                  style={{
                    width: '100%', padding: '14px 24px',
                    borderRadius: 12, border: 'none', cursor: code.length < 3 ? 'not-allowed' : 'pointer',
                    background: code.length < 3 ? 'rgba(255,196,0,0.1)' : 'linear-gradient(135deg, #FFC400, #FF9F1C)',
                    color: code.length < 3 ? 'var(--text-muted)' : '#1a1300',
                    fontFamily: 'Chakra Petch, monospace', fontWeight: 700,
                    fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: code.length < 3 ? 'none' : '0 8px 24px rgba(255,159,28,0.35)',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Aktivlashtirilmoqda...</>
                    : <><Zap className="w-4 h-4" /> Aktivlashtirish</>
                  }
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.25rem' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Keyinroq
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
