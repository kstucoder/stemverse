import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { School, Users, BookCheck, Plus, ArrowRight } from 'lucide-react';
import { teacherAPI } from '../lib/api';

export default function TeacherDashboard() {
  const [stats,      setStats]     = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading,    setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([teacherAPI.stats(), teacherAPI.classrooms()])
      .then(([s, c]) => { setStats(s.data); setClassrooms(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--cyan)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Yuklanmoqda...</span>
      </div>
    </div>
  );

  const statCards = [
    { icon: School,    label: 'Sinflar',            value: stats?.classrooms     || 0, color: 'var(--cyan)',   bg: 'rgba(0,238,255,0.08)'   },
    { icon: Users,     label: "O'quvchilar",         value: stats?.students       || 0, color: '#A855F7',       bg: 'rgba(168,85,247,0.08)'  },
    { icon: BookCheck, label: 'Bajarilgan darslar',  value: stats?.completedLessons || 0, color: '#00FF88',    bg: 'rgba(0,255,136,0.08)'   },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 15% 0, rgba(168,85,247,0.04) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="eyebrow-label mb-3">O'qituvchi Paneli</div>
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', color: 'white', lineHeight: 1.1 }}>
              Mission<br />
              <span style={{ color: 'var(--cyan)', textShadow: '0 0 32px rgba(0,238,255,0.4)' }}>Control</span>
            </h1>
          </div>
          <Link to="/teacher/classrooms" className="btn-primary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <Plus className="w-4 h-4" /> Sinflarni boshqarish
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              style={{
                borderRadius: 14, padding: '22px 24px',
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: `1px solid ${color}15`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}25, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border: `1px solid ${color}20`, flexShrink: 0 }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.8rem', color, lineHeight: 1, textShadow: `0 0 16px ${color}40` }}>{value}</div>
                  <div style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Classrooms */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', color: 'white' }}>
              Sinflarim
            </h2>
            <Link to="/teacher/classrooms" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Barchasi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map(c => {
              const count = c._count?.students ?? c.students?.length ?? 0;
              return (
                <Link
                  key={c.id}
                  to={`/teacher/classroom/${c.id}`}
                  style={{
                    borderRadius: 14, padding: '20px',
                    background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                    border: '1px solid rgba(0,238,255,0.06)',
                    textDecoration: 'none', display: 'block',
                    transition: 'all 0.25s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,238,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,238,255,0.06)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.12), transparent)' }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.95rem', color: 'white', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                      {c.name}
                    </h3>
                    <span className="badge-level" style={{ fontSize: '0.65rem', flexShrink: 0, marginLeft: 8 }}>{count} o'q</span>
                  </div>

                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    Kod: <span style={{ color: 'var(--cyan)', letterSpacing: '0.1em' }}>{c.inviteCode}</span>
                  </div>

                  {c.students?.slice(0, 4).map(s => (
                    <div key={s.student.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(0,238,255,0.12)', border: '1px solid rgba(0,238,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.6rem', color: 'var(--cyan)', flexShrink: 0 }}>
                        {s.student.name[0]}
                      </div>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'rgba(234,243,255,0.6)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.student.name}
                      </span>
                      <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        Lv.{s.student.level} · {s.student.xp}XP
                      </span>
                    </div>
                  ))}

                  {count > 4 && (
                    <div style={{ marginTop: 6, fontFamily: 'Chakra Petch, monospace', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      +{count - 4} ta boshqa o'quvchi
                    </div>
                  )}
                </Link>
              );
            })}

            {classrooms.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1', borderRadius: 14, padding: '48px 24px',
                  background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                  border: '1px dashed rgba(0,238,255,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,238,255,0.06)', border: '1px solid rgba(0,238,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <School className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                </div>
                <p style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Hali sinflar yo'q
                </p>
                <Link to="/teacher/classrooms" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '9px 18px' }}>
                  Birinchi sinfni yaratish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
