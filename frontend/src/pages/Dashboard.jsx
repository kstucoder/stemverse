import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, Trophy, Cpu, CheckCircle, TrendingUp, ArrowRight, Lock } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { progressAPI, lessonsAPI, kitAPI } from '../lib/api';

export default function Dashboard() {
  const { user, fetchUser } = useAuthStore();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [kit, setKit]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([progressAPI.overview(), lessonsAPI.list(), kitAPI.myKit()])
      .then(([p, l, k]) => {
        setStats(p.data);
        setRecent(l.data.slice(0, 5));
        setKit(k.data.kit);
        fetchUser();
      })
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

  const xpInLevel = (user?.xp || 0) - ((user?.level || 1) * 200 - 200);
  const levelProgress = Math.min((xpInLevel / 200) * 100, 100);
  const nextLevelXp = (user?.level || 1) * 200;

  const statItems = [
    {
      label: 'Jami XP',
      value: user?.xp || 0,
      sub: `Daraja ${user?.level}`,
      icon: Zap,
      color: '#00EEFF',
      dimColor: 'rgba(0,238,255,0.08)',
      dimBorder: 'rgba(0,238,255,0.15)',
      progress: levelProgress,
    },
    {
      label: 'Bajarilgan',
      value: stats?.completedLessons || 0,
      sub: `${stats?.totalLessons || 0} darsdan`,
      icon: CheckCircle,
      color: '#00FF88',
      dimColor: 'rgba(0,255,136,0.08)',
      dimBorder: 'rgba(0,255,136,0.15)',
    },
    {
      label: 'Progress',
      value: `${stats?.progress || 0}%`,
      sub: 'Umumiy',
      icon: TrendingUp,
      color: '#9B5DE5',
      dimColor: 'rgba(155,93,229,0.08)',
      dimBorder: 'rgba(155,93,229,0.15)',
      progress: stats?.progress || 0,
    },
    {
      label: "To'plam",
      value: kit ? 'Faol' : '—',
      sub: kit ? kit.name || 'VOLTRA Kit' : "Faollashtiring",
      icon: Cpu,
      color: '#FF6920',
      dimColor: 'rgba(255,105,32,0.08)',
      dimBorder: 'rgba(255,105,32,0.15)',
    },
  ];

  return (
    <div className="min-h-screen bg-circuit" style={{ background: 'var(--bg-void)' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(0,238,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(155,93,229,0.03) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow-label mb-2">Mission Control</div>
            <h1
              className="text-3xl sm:text-4xl font-display text-white mb-1"
              style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700 }}
            >
              Xush kelibsiz,{' '}
              <span style={{ color: 'var(--cyan)', textShadow: '0 0 24px rgba(0,238,255,0.4)' }}>
                {user?.name?.split(' ')[0]}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>
              Keyingi missiyaga tayyormisiz?
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!kit && (
              <Link to="/activate" className="btn-primary text-xs">
                <Cpu className="w-3.5 h-3.5" />
                To'plamni aktivlashtirish
              </Link>
            )}
            <Link to="/lessons" className="btn-secondary text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              Missiyalar
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {statItems.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: stat.dimColor, border: `1px solid ${stat.dimBorder}` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div
                className="text-2xl sm:text-3xl font-display font-bold mb-0.5"
                style={{ fontFamily: 'Orbitron, monospace', color: stat.color, lineHeight: 1 }}
              >
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'Chakra Petch, monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
              {stat.progress !== undefined && (
                <div className="mt-2 xp-bar" style={{ background: `${stat.dimColor}` }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${stat.progress}%`,
                      background: `linear-gradient(90deg, ${stat.color}, ${stat.color}aa)`,
                      boxShadow: `0 0 6px ${stat.color}66`,
                    }}
                  />
                </div>
              )}
              <div style={{ color: 'rgba(234,243,255,0.35)', fontSize: '0.68rem', marginTop: 4, fontFamily: 'Chakra Petch, monospace' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent lessons */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.7)' }}>
                So'nggi missiyalar
              </h2>
              <Link
                to="/lessons"
                className="flex items-center gap-1 text-xs transition-all"
                style={{ color: 'var(--cyan)', fontFamily: 'Chakra Petch, monospace', letterSpacing: '0.05em' }}
              >
                Hammasi <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {recent.map((lesson, i) => {
                const isCompleted = lesson.progress?.completed;
                const isLocked    = lesson.locked;
                return (
                  <Link
                    key={lesson.id}
                    to={isLocked ? '#' : `/lessons/${lesson.id}`}
                    className={`lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className={`icon-box ${isCompleted ? 'icon-box-green' : isLocked ? '' : 'icon-box-cyan'}`}
                      style={isLocked ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' } : {}}
                    >
                      {isCompleted
                        ? <CheckCircle className="w-5 h-5" style={{ color: '#00FF88' }} />
                        : isLocked
                          ? <Lock className="w-5 h-5" style={{ color: 'rgba(234,243,255,0.2)' }} />
                          : <Cpu className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className="font-semibold mb-0.5 truncate"
                            style={{ color: isLocked ? 'rgba(234,243,255,0.3)' : 'rgba(234,243,255,0.9)', fontFamily: 'Chakra Petch, monospace', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em' }}
                          >
                            {lesson.title}
                          </h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'DM Sans, sans-serif' }}>
                            Daraja {lesson.level}
                          </p>
                        </div>
                        {isCompleted
                          ? <span className="badge-completed shrink-0">✓ Bajarildi</span>
                          : !isLocked && <span className="badge-energy shrink-0">+{lesson.xpReward} XP</span>
                        }
                      </div>
                    </div>
                    {!isLocked && <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(234,243,255,0.2)' }} />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Level card */}
            <div
              className="card-glow text-center"
              style={{ background: 'linear-gradient(135deg, #080E1C, #0D1729)' }}
            >
              <div className="eyebrow-label justify-center mb-4">Muhandis darajasi</div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,238,255,0.15), rgba(155,93,229,0.1))',
                  border: '2px solid rgba(0,238,255,0.3)',
                  boxShadow: '0 0 32px rgba(0,238,255,0.2)',
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(0,238,255,0.5), transparent 60%)' }}
                />
                <span
                  className="text-3xl font-display font-black relative z-10"
                  style={{ fontFamily: 'Orbitron, monospace', color: 'var(--cyan)', textShadow: '0 0 16px rgba(0,238,255,0.6)' }}
                >
                  {user?.level}
                </span>
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: 4 }}>
                Level {user?.level}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'DM Sans', marginBottom: 12 }}>
                {xpInLevel} / 200 XP keyingi levelga
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>

            {/* Quick links */}
            <div className="card-glow">
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)', marginBottom: 12 }}>
                Tezkor havolalar
              </div>
              <div className="space-y-1.5">
                {[
                  { to: '/lessons',      icon: BookOpen, label: 'Missiyalarni ko\'rish', color: 'var(--cyan)' },
                  { to: '/achievements', icon: Trophy,   label: 'Yutuqlarim',           color: '#FFE600'     },
                  { to: '/activate',     icon: Cpu,      label: "To'plam aktivlashtirish", color: '#FF6920'  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,238,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(0,238,255,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.83rem', color: 'rgba(234,243,255,0.7)' }}>
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" style={{ color: 'rgba(234,243,255,0.2)' }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Kit status */}
            <div
              className="card"
              style={{
                background: kit
                  ? 'linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,238,255,0.04))'
                  : 'linear-gradient(135deg, rgba(255,105,32,0.06), rgba(255,45,120,0.04))',
                border: `1px solid ${kit ? 'rgba(0,255,136,0.12)' : 'rgba(255,105,32,0.15)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="icon-box"
                  style={{
                    background: kit ? 'rgba(0,255,136,0.08)' : 'rgba(255,105,32,0.08)',
                    border: `1px solid ${kit ? 'rgba(0,255,136,0.2)' : 'rgba(255,105,32,0.2)'}`,
                  }}
                >
                  <Cpu className="w-5 h-5" style={{ color: kit ? '#00FF88' : '#FF6920' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.8rem', fontWeight: 600, color: kit ? '#00FF88' : '#FF6920', letterSpacing: '0.04em' }}>
                    {kit ? '● Ulangan' : '○ Ulanmagan'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'DM Sans' }}>
                    {kit ? 'VOLTRA Kit faol' : "Arduino to'plami yo'q"}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
