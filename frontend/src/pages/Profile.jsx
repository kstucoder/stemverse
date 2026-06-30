import { useState } from 'react';
import { User, Mail, Cpu, Zap, Calendar, Save, ShieldCheck } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const LEVEL_XP = 200;

export default function Profil() {
  const { user, updateProfil } = useAuthStore();
  const [name, setName]   = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const xpInLevel = user.xp % LEVEL_XP;
  const xpPct     = Math.round(xpInLevel / LEVEL_XP * 100);
  const initial   = (user.name || 'U')[0].toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Ism talab qilinadi'); return; }
    setSaving(true);
    try   { await updateProfil({ name }); toast.success('Profil yangilandi!'); }
    catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const stats = [
    { icon: Zap,      label: 'Jami XP',  value: user.xp,    color: '#FFE600' },
    { icon: Cpu,      label: 'Daraja',   value: user.level, color: 'var(--cyan)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 30% 0, rgba(0,238,255,0.04) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow-label mb-3">Shaxsiy Kabinet</div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'white', lineHeight: 1.1 }}>
            Profil
          </h1>
        </div>

        {/* Avatar + stats */}
        <div
          style={{
            borderRadius: 16, padding: '24px',
            background: 'linear-gradient(135deg, rgba(0,238,255,0.04), rgba(255,105,32,0.03))',
            border: '1px solid rgba(0,238,255,0.1)',
            marginBottom: 16,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.25), transparent)' }} />

          {/* Avatar row */}
          <div className="flex items-center gap-5 mb-6">
            <div
              style={{
                width: 68, height: 68, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(145deg, #0b3a4a, #031a26)',
                border: '2px solid rgba(0,238,255,0.3)',
                boxShadow: '0 0 24px rgba(0,238,255,0.15)',
                fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.5rem',
                color: 'var(--cyan)',
              }}
            >
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: 3 }}>
                {user.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>{user.email}</div>
              <div style={{ marginTop: 8 }}>
                <span className="badge-level">{user.role}</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Daraja {user.level} → {user.level + 1}
              </span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 700 }}>
                {xpInLevel}/{LEVEL_XP} XP
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Stat mini cards */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                style={{
                  borderRadius: 12, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.2rem', color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.66rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div
          style={{
            borderRadius: 16, padding: '24px',
            background: 'linear-gradient(135deg, #080E1C, #0B1120)',
            border: '1px solid rgba(0,238,255,0.08)',
            marginBottom: 16, position: 'relative',
          }}
        >
          <h3 style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 20 }}>
            Ma'lumotlarni tahrirlash
          </h3>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>Ism</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 8 }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', opacity: 0.5, cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {saving
                  ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saqlanmoqda...</>
                  : <><Save className="w-4 h-4" /> Saqlash</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Account info */}
        <div
          style={{
            borderRadius: 16, padding: '20px 24px',
            background: 'linear-gradient(135deg, #080E1C, #0B1120)',
            border: '1px solid rgba(0,238,255,0.08)',
          }}
        >
          <h3 style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 16 }}>
            Hisob ma'lumotlari
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', flex: 1 }}>Rol</span>
              <span className="badge-level">{user.role}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', flex: 1 }}>Ro'yxatdan o'tilgan</span>
              <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.8rem', color: 'white' }}>
                {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
