import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, TrendingUp, Copy } from 'lucide-react';
import { teacherAPI } from '../lib/api';
import toast from 'react-hot-toast';

const TOTAL_LESSONS = 20;

export default function ClassroomView() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    teacherAPI.getClassroom(id)
      .then(r => setClassroom(r.data))
      .catch(() => toast.error('Sinf topilmadi'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--cyan)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Yuklanmoqda...</span>
      </div>
    </div>
  );

  if (!classroom) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'Chakra Petch, monospace' }}>Sinf topilmadi</p>
    </div>
  );

  const students  = classroom.students || [];
  const totalXP   = students.reduce((s, e) => s + (e.student?.xp || 0), 0);
  const avgLevel  = students.length > 0
    ? (students.reduce((s, e) => s + (e.student?.level || 0), 0) / students.length).toFixed(1)
    : '—';

  const statCards = [
    { icon: Users,    label: "O'quvchilar",   value: students.length, color: 'var(--cyan)'  },
    { icon: TrendingUp, label: 'Umumiy XP',   value: totalXP,         color: '#FFE600'      },
    { icon: Trophy,   label: "O'rt. Daraja",  value: avgLevel,        color: '#A855F7'      },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 80% 0, rgba(168,85,247,0.04) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 flex-wrap">
          <Link
            to="/teacher/classrooms"
            style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)', transition: 'all 0.2s', flexShrink: 0, marginTop: 4 }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(0,238,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div style={{ flex: 1 }}>
            <div className="eyebrow-label mb-2">Sinf ko'rinishi</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'white', letterSpacing: '0.04em' }}>
                {classroom.name}
              </h1>
              <span className="badge-level">{students.length} o'quvchi</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(classroom.inviteCode); toast.success('Nusxalandi!'); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--cyan)', background: 'rgba(0,238,255,0.06)', border: '1px solid rgba(0,238,255,0.12)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Taklif kodi: {classroom.inviteCode} <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              style={{
                borderRadius: 14, padding: '18px 20px',
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: `1px solid ${color}12`,
                display: 'flex', alignItems: 'center', gap: 14,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}20, transparent)` }} />
              <div style={{ width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}10`, border: `1px solid ${color}20`, flexShrink: 0 }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color, lineHeight: 1, textShadow: `0 0 14px ${color}30` }}>{value}</div>
                <div style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Students table */}
        <div
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, #080E1C, #0B1120)',
            border: '1px solid rgba(0,238,255,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.15), transparent)' }} />

          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
            <span style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.6)' }}>
              O'quvchilar ro'yxati
            </span>
          </div>

          {students.length === 0 ? (
            <div style={{ padding: '48px 22px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>
                Hali o'quvchilar yo'q. Taklif kodini ulashing: <strong style={{ color: 'var(--cyan)' }}>{classroom.inviteCode}</strong>
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {["O'quvchi", "Daraja", "XP", "Progress", "Yutuqlar"].map(h => (
                      <th key={h} style={{ padding: '12px 22px', textAlign: h === "O'quvchi" ? 'left' : 'center', fontFamily: 'Chakra Petch, monospace', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(e => {
                    const s = e.student;
                    const completed = (s?.progress || []).filter(p => p.completed).length;
                    const pct       = Math.round((completed / TOTAL_LESSONS) * 100);
                    return (
                      <tr
                        key={e.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                        onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(0,238,255,0.02)'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                      >
                        {/* Name */}
                        <td style={{ padding: '14px 22px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,238,255,0.1)', border: '1px solid rgba(0,238,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.7rem', color: 'var(--cyan)', flexShrink: 0 }}>
                              {s?.name?.[0]}
                            </div>
                            <div>
                              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{s?.name}</div>
                              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s?.email}</div>
                            </div>
                          </div>
                        </td>
                        {/* Level */}
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--cyan)' }}>
                            {s?.level}
                          </span>
                        </td>
                        {/* XP */}
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <span className="badge-xp">{s?.xp}</span>
                        </td>
                        {/* Progress */}
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <div style={{ width: 72, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--cyan), #00FF88)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {completed}/{TOTAL_LESSONS}
                            </span>
                          </div>
                        </td>
                        {/* Achievements */}
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.9rem', color: '#FFE600' }}>
                            {s?.achievements?.length || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
