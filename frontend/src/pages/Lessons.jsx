import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Cpu, ArrowRight, Zap, Lock } from 'lucide-react';
import { lessonsAPI } from '../lib/api';

const LEVEL_CONFIG = {
  1: { label: 'Boshlovchi', color: '#00EEFF', dimColor: 'rgba(0,238,255,0.08)', dimBorder: 'rgba(0,238,255,0.15)' },
  2: { label: 'O\'rta',     color: '#9B5DE5', dimColor: 'rgba(155,93,229,0.08)', dimBorder: 'rgba(155,93,229,0.15)' },
  3: { label: 'Murakkab',   color: '#FF6920', dimColor: 'rgba(255,105,32,0.08)', dimBorder: 'rgba(255,105,32,0.15)' },
  4: { label: 'Usta',       color: '#FF2D78', dimColor: 'rgba(255,45,120,0.08)', dimBorder: 'rgba(255,45,120,0.15)' },
};

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0); // 0 = all

  useEffect(() => {
    lessonsAPI.list()
      .then(r => setLessons(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--cyan)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Missiyalar yuklanmoqda...
        </span>
      </div>
    </div>
  );

  const filtered = filter === 0 ? lessons : lessons.filter(l => l.level === filter);
  const completedCount = lessons.filter(l => l.progress?.completed).length;
  const levels = [1, 2, 3, 4];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,238,255,0.04) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow-label mb-3">
            {completedCount}/{lessons.length} missiya bajarildi
          </div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'white', lineHeight: 1.1, marginBottom: 8 }}>
            Missiyalar
            <br />
            <span style={{ color: 'var(--cyan)', textShadow: '0 0 32px rgba(0,238,255,0.4)' }}>Kutubxonasi</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '0.9rem' }}>
            Har bir missiyani bajaring, XP yig'ing va muhandis bo'ling.
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="card mb-6"
          style={{ padding: '16px 20px', background: 'rgba(8,14,28,0.8)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)' }}>
              Umumiy progress
            </span>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan)' }}>
              {lessons.length > 0 ? Math.round(completedCount / lessons.length * 100) : 0}%
            </span>
          </div>
          <div className="xp-bar" style={{ height: 6 }}>
            <div
              className="xp-bar-fill"
              style={{ width: `${lessons.length > 0 ? (completedCount / lessons.length * 100) : 0}%`, height: '100%' }}
            />
          </div>
          <div className="flex gap-4 mt-3">
            {levels.map(lv => {
              const lvLessons = lessons.filter(l => l.level === lv);
              const lvDone = lvLessons.filter(l => l.progress?.completed).length;
              const cfg = LEVEL_CONFIG[lv];
              return (
                <div key={lv} className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
                  <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    LV.{lv} {lvDone}/{lvLessons.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-lg"
          style={{ background: 'rgba(8,14,28,0.8)', border: '1px solid rgba(0,238,255,0.06)', width: 'fit-content' }}
        >
          {[
            { val: 0, label: 'Barchasi', color: 'var(--cyan)' },
            ...levels.map(lv => ({ val: lv, label: `Daraja ${lv}`, color: LEVEL_CONFIG[lv].color })),
          ].map(tab => (
            <button
              key={tab.val}
              onClick={() => setFilter(tab.val)}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                fontFamily: 'Chakra Petch, monospace',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: filter === tab.val ? tab.color : 'var(--text-muted)',
                background: filter === tab.val ? `${tab.color}12` : 'transparent',
                border: filter === tab.val ? `1px solid ${tab.color}30` : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lessons list */}
        <div className="space-y-2">
          {filtered.map((lesson, i) => {
            const cfg = LEVEL_CONFIG[lesson.level] || LEVEL_CONFIG[1];
            const isCompleted = lesson.progress?.completed;
            const isLocked    = lesson.locked;

            if (isLocked) {
              return (
                <div
                  key={lesson.id}
                  className="lesson-card"
                  style={{ opacity: 0.35, pointerEvents: 'none', animationDelay: `${i * 40}ms` }}
                >
                  <div className="icon-box" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Lock className="w-5 h-5" style={{ color: 'rgba(234,243,255,0.2)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.04em', color: 'rgba(234,243,255,0.3)', marginBottom: 2 }}>
                      {lesson.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'DM Sans' }}>
                      Keyingi darajada ochiladi
                    </p>
                  </div>
                  <span className="badge-locked">Qulflangan</span>
                </div>
              );
            }

            return (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className={`lesson-card ${isCompleted ? 'completed' : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Mission number */}
                <div
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: isCompleted ? '#00FF88' : cfg.color,
                    opacity: 0.5,
                    position: 'absolute',
                    top: 10, right: 14,
                    letterSpacing: '0.1em',
                  }}
                >
                  M.{String(lesson.order).padStart(2, '0')}
                </div>

                {/* Icon */}
                <div
                  className="icon-box"
                  style={{
                    background: isCompleted ? 'rgba(0,255,136,0.08)' : cfg.dimColor,
                    border: `1px solid ${isCompleted ? 'rgba(0,255,136,0.2)' : cfg.dimBorder}`,
                  }}
                >
                  {isCompleted
                    ? <CheckCircle className="w-5 h-5" style={{ color: '#00FF88' }} />
                    : <Cpu className="w-5 h-5" style={{ color: cfg.color }} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3
                      style={{
                        fontFamily: 'Chakra Petch, monospace',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        letterSpacing: '0.04em',
                        color: 'rgba(234,243,255,0.9)',
                      }}
                    >
                      {lesson.title}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'DM Sans', marginBottom: 8, lineHeight: 1.5 }}>
                    {lesson.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="badge"
                      style={{
                        background: cfg.dimColor,
                        color: cfg.color,
                        border: `1px solid ${cfg.dimBorder}`,
                        fontFamily: 'Chakra Petch, monospace',
                      }}
                    >
                      <Zap className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                    {lesson.components?.length > 0 && (
                      <span
                        className="badge"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Chakra Petch, monospace' }}
                      >
                        {lesson.components.length} komponent
                      </span>
                    )}
                    {isCompleted && (
                      <span className="badge-xp">✓ {lesson.xpReward} XP yig'ildi</span>
                    )}
                    {!isCompleted && (
                      <span className="badge-energy">+{lesson.xpReward} XP</span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 shrink-0 hidden sm:block" style={{ color: 'rgba(234,243,255,0.2)' }} />
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '2rem', color: 'rgba(0,238,255,0.15)', marginBottom: 12 }}>⚡</div>
            <div style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.78rem' }}>
              Bu darajada missiyalar yo'q
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
