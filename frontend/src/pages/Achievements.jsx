import { useEffect, useState } from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { achievementsAPI } from '../lib/api';

export default function Achievements() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementsAPI.list()
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--cyan)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Yuklanmoqda...
        </span>
      </div>
    </div>
  );

  const earned = items.filter(a => a.earned).length;
  const pct    = items.length > 0 ? Math.round(earned / items.length * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,230,0,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow-label mb-3">Muhandis medallari</div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'white', lineHeight: 1.1, marginBottom: 8 }}>
            Yutuqlar
            <br />
            <span style={{ color: '#FFE600', textShadow: '0 0 32px rgba(255,230,0,0.4)' }}>Do'koni</span>
          </h1>
        </div>

        {/* Progress card */}
        <div
          className="card mb-8"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(255,230,0,0.05), rgba(255,105,32,0.04))',
            border: '1px solid rgba(255,230,0,0.1)',
          }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div style={{ width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,230,0,0.1)', border: '1px solid rgba(255,230,0,0.2)' }}>
                <Trophy className="w-6 h-6" style={{ color: '#FFE600' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.6rem', color: '#FFE600', lineHeight: 1, textShadow: '0 0 12px rgba(255,230,0,0.4)' }}>
                  {earned}<span style={{ fontSize: '1rem', opacity: 0.5 }}>/{items.length}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'Chakra Petch, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                  Qo'lga kiritilgan
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progress</span>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.85rem', color: '#FFE600', fontWeight: 700 }}>{pct}%</span>
              </div>
              <div className="xp-bar" style={{ height: 6 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #FFE600, #FF6920)', borderRadius: 4, boxShadow: '0 0 8px rgba(255,230,0,0.5)', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <div
              key={a.id}
              style={{
                borderRadius: 12,
                padding: '20px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: a.earned
                  ? 'linear-gradient(135deg, rgba(255,230,0,0.06), rgba(255,105,32,0.04))'
                  : 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: a.earned
                  ? '1px solid rgba(255,230,0,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
                opacity: a.earned ? 1 : 0.5,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = a.earned ? '1' : '0.5'; }}
            >
              {/* Top glow for earned */}
              {a.earned && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,230,0,0.3), transparent)' }} />
              )}

              {/* Icon */}
              <div style={{
                fontSize: '2.8rem',
                marginBottom: 12,
                filter: a.earned ? 'none' : 'grayscale(1) brightness(0.4)',
                textShadow: a.earned ? '0 0 20px rgba(255,230,0,0.4)' : 'none',
              }}>
                {a.icon || '🏆'}
              </div>

              {/* Title */}
              <h3 style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em', color: a.earned ? 'white' : 'rgba(234,243,255,0.4)', marginBottom: 6 }}>
                {a.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5, marginBottom: 14 }}>
                {a.description}
              </p>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {a.earned
                  ? <><CheckCircle className="w-3.5 h-3.5" style={{ color: '#00FF88' }} /><span className="badge-xp">Qo'lga kiritilgan</span></>
                  : <><Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /><span className="badge-locked">Yopiq</span></>
                }
                {a.xpReward && <span className="badge-energy">+{a.xpReward}</span>}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20">
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '2rem', color: 'rgba(255,230,0,0.15)', marginBottom: 12 }}>🏆</div>
            <div style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.78rem' }}>
              Hali yutuqlar yo'q
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
