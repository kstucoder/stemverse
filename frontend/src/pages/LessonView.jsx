import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CircuitBoard, Code, Cpu, Gamepad2, Lock, Copy, CheckCircle2 } from 'lucide-react';
import { lessonsAPI, progressAPI } from '../lib/api';
import SerialConnector from '../components/SerialConnector';
import { getGameComponent } from '../components/Game/GameEngine';
import StoryMission, { StoryVictory } from '../components/Game/StoryMission';
import useGameStore from '../stores/gameStore';
import toast from 'react-hot-toast';

const LEVEL_COLOR = { 1: 'var(--cyan)', 2: '#A855F7', 3: '#FF6920', 4: '#EC4899' };

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson,       setLesson]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('game');
  const [gameStarted,  setGameStarted]  = useState(false);
  const [showStory,    setShowStory]    = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winScore,     setWinScore]     = useState(0);
  const [xpEarned,     setXpEarned]    = useState(0);
  const [completing,   setCompleting]   = useState(false);
  // Energy City maxsus flow
  const [videoPhase,   setVideoPhase]   = useState('idle'); // idle | video | dialog | playing
  const { startGame, stopGame } = useGameStore();

  useEffect(() => {
    lessonsAPI.get(id)
      .then(r => setLesson(r.data))
      .catch(() => { toast.error('Dars topilmadi'); navigate('/lessons'); })
      .finally(() => setLoading(false));
    return () => stopGame();
  }, [id]);

  const handleWin = useCallback(async (score) => {
    setWinScore(score);
    setCompleting(true);
    try {
      const { data } = await progressAPI.complete(id, score);
      setXpEarned(data.xpEarned);
      setShowWinModal(true);
      toast.success(`Bajarildi! +${data.xpEarned} XP`);
      if (data.newAchievements?.length > 0)
        data.newAchievements.forEach(a => toast.success(`Yutuq: ${a.title}! +${a.xpReward} XP`, { duration: 5000 }));
      lessonsAPI.get(id).then(r => setLesson(r.data));
    } catch { toast.error('Saqlashda xatolik'); }
    finally { setCompleting(false); }
  }, [id]);

  const startLessonGame = () => {
    if (lesson?.gameConfig) useGameStore.getState().setWinConfig(lesson.winCondition, handleWin);
    startGame();
    setGameStarted(true);
    setActiveTab('game');
    // Energy City maxsus flow: video → dialog → o'yin
    if (lesson?.gameConfig?.gameType === 'energy_city') {
      setVideoPhase('video');
      setShowStory(false);
    } else {
      setShowStory(true);
      setVideoPhase('idle');
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--cyan)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Yuklanmoqda...</span>
      </div>
    </div>
  );

  /* ── Locked ── */
  if (lesson?.locked) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-void)' }}>
      <div className="text-center max-w-md">
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
        <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.4rem', color: 'white', marginBottom: 10 }}>Missiya qulflangan</h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginBottom: 24, lineHeight: 1.6 }}>
          Bu missiyani ochish uchun oldingi darslarni bajarib, yetarli XP to'plang.
        </p>
        <button onClick={() => navigate('/lessons')} className="btn-primary">← Missiyalarga qaytish</button>
      </div>
    </div>
  );

  const isCompleted  = lesson?.progress?.completed;
  const GameComponent = getGameComponent(lesson?.gameConfig?.gameType);
  const lvColor      = LEVEL_COLOR[lesson?.level] || 'var(--cyan)';

  const tabs = [
    { id: 'game',    label: "O'yin",  icon: Gamepad2   },
    { id: 'circuit', label: 'Sxema',  icon: CircuitBoard },
    { id: 'code',    label: 'Kod',    icon: Code        },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 50% at 50% 0, ${lvColor}08 0%, transparent 60%)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/lessons')}
              style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(0,238,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: 'white', letterSpacing: '0.04em', marginBottom: 3 }}>
                {lesson?.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', color: lvColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Daraja {lesson?.level}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />
                <span className="badge-xp">+{lesson?.xpReward} XP</span>
                {isCompleted && <span className="badge-completed">Bajarildi</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SerialConnector compact />
            {!gameStarted && !isCompleted && (
              <button onClick={startLessonGame} className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                ▶ O'yinni boshlash
              </button>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Left — game panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(8,14,28,0.8)', borderRadius: 12, padding: 4, border: '1px solid rgba(0,238,255,0.06)' }}>
              {tabs.map(t => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '10px 12px', borderRadius: 9,
                      background: active ? 'rgba(0,238,255,0.08)' : 'transparent',
                      border: active ? '1px solid rgba(0,238,255,0.18)' : '1px solid transparent',
                      color: active ? 'white' : 'var(--text-muted)',
                      fontFamily: 'Chakra Petch, monospace', fontWeight: 600,
                      fontSize: '0.8rem', letterSpacing: '0.04em',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                  >
                    <t.icon className="w-4 h-4" style={{ color: active ? 'var(--cyan)' : 'inherit' }} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Panel */}
            <div
              style={{
                borderRadius: 16, overflow: 'hidden', minHeight: 520,
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: '1px solid rgba(0,238,255,0.08)',
                position: 'relative',
              }}
            >
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${lvColor}30, transparent)` }} />

              {/* GAME tab */}
              {activeTab === 'game' && (
                <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 520 }}>
                  {!gameStarted ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 520, gap: 16, padding: 24 }}>
                      <div style={{ width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${lvColor}12`, border: `1px solid ${lvColor}30` }}>
                        <Gamepad2 className="w-8 h-8" style={{ color: lvColor }} />
                      </div>
                      <h3 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.2rem', color: 'white', textAlign: 'center' }}>
                        Digital Twin Missiya
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
                        Arduino'ni USB orqali ulab, o'yinni boshlang. Haqiqiy sensorlar ma'lumotlari o'yinni boshqaradi.
                      </p>
                      <button onClick={startLessonGame} className="btn-primary" style={{ marginTop: 8 }}>
                        ▶ Missiyani boshlash
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* O'yin (har doim fonda ishlaydi) */}
                      <GameComponent />

                      {/* === ENERGY CITY maxsus flow === */}
                      {lesson?.gameConfig?.gameType === 'energy_city' && (
                        <>
                          {/* 1. Video intro */}
                          {videoPhase === 'video' && (
                            <div className="absolute inset-0 z-30 bg-black">
                              <video
                                src="/cutscenes/1.mp4"
                                autoPlay muted playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                                onEnded={() => setVideoPhase('dialog')}
                              />
                              <button
                                onClick={() => setVideoPhase('dialog')}
                                className="absolute bottom-6 right-6 z-40 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider"
                                style={{ fontFamily: 'Chakra Petch, monospace', color: '#EAF3FF', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,238,255,0.3)', backdropFilter: 'blur(8px)' }}
                              >
                                ⏭ O'tkazish
                              </button>
                            </div>
                          )}

                          {/* 2. Dialog: missiya topshirig'i */}
                          {videoPhase === 'dialog' && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(4,6,14,0.95)', backdropFilter: 'blur(8px)' }}>
                              <div className="text-center max-w-md px-8 py-10" style={{ borderRadius: 20, border: '1px solid rgba(255,215,0,0.15)', background: 'rgba(11,17,32,0.8)' }}>
                                <div className="text-5xl mb-4">⚡</div>
                                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Oswald, sans-serif', color: '#EAF3FF', letterSpacing: 1 }}>
                                  Energy City — Tinch kechada
                                </h2>
                                <p className="text-base mb-2" style={{ color: '#bcd0ea', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                                  Shahar chiroqlari o'chdi. LED'ni plataga ulab,
                                  shaharga quvvat qaytaring.
                                </p>
                                <p className="text-sm font-bold mt-4" style={{ color: '#FFD700', fontFamily: 'Chakra Petch, monospace' }}>
                                  "Electra — shaharni qutqar!"
                                </p>
                                <button
                                  onClick={() => setVideoPhase('playing')}
                                  className="mt-6 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider"
                                  style={{ fontFamily: 'Chakra Petch, monospace', color: '#1a1300', background: 'linear-gradient(135deg, #FFD700, #FF9F1C)', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}
                                >
                                  ▶ Sxemani ulash
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. O'yin (videoPhase === 'playing') — GameComponent fonda ishlaydi, LED=1 bo'lganda chiroqlar yonadi */}
                        </>
                      )}

                      {/* === Boshqa o'yinlar uchun eski cutscene === */}
                      {lesson?.gameConfig?.gameType !== 'energy_city' && gameStarted && showStory && (
                        <StoryMission gameType={lesson?.gameConfig?.gameType} onStart={() => setShowStory(false)} />
                      )}

                      {/* Win modal */}
                      {gameStarted && !showStory && showWinModal && !completing && (
                        <StoryVictory
                          gameType={lesson?.gameConfig?.gameType}
                          score={winScore}
                          xpEarned={xpEarned}
                          onContinue={() => setShowWinModal(false)}
                        />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* CIRCUIT tab */}
              {activeTab === 'circuit' && (
                <div style={{ padding: 28 }}>
                  <div className="eyebrow-label mb-4">Zanjir sxemasi</div>
                  {lesson?.components?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {lesson.components.map((c, i) => (
                        <span key={i} className="badge-level" style={{ fontSize: '0.75rem' }}>{c}</span>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      borderRadius: 12, padding: 24, marginBottom: 16,
                      background: 'rgba(0,238,255,0.03)',
                      border: '1px solid rgba(0,238,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <CircuitBoard className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--cyan)' }} />
                      <div>
                        <h4 style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, color: 'white', marginBottom: 8 }}>
                          Ulash ko'rsatmasi
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', lineHeight: 1.65 }}>
                          To'plamdagi sxema jadvaliga qarang va komponentlarni Arduino platasiga ko'rsatilgan tartibda ulang. Har bir pin raqami muhim!
                        </p>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>
                    Ulashni tugatganingizdan so'ng "O'yin" tabiga o'ting va missiyani boshlang.
                  </p>
                </div>
              )}

              {/* CODE tab */}
              {activeTab === 'code' && (
                <div style={{ padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div className="eyebrow-label">Arduino Kodi</div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(lesson?.codeExample || ''); toast.success('Nusxalandi!'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Chakra Petch, monospace', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cyan)', background: 'rgba(0,238,255,0.06)', border: '1px solid rgba(0,238,255,0.15)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <Copy className="w-3.5 h-3.5" /> Nusxa
                    </button>
                  </div>
                  {lesson?.codeExample
                    ? (
                      <pre
                        style={{
                          background: '#020408', borderRadius: 12, padding: '20px',
                          border: '1px solid rgba(0,238,255,0.08)',
                          overflow: 'auto', maxHeight: 400,
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem',
                          color: '#00FF88', lineHeight: 1.65,
                        }}
                      >
                        <code>{lesson.codeExample}</code>
                      </pre>
                    )
                    : <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>Kod hozircha mavjud emas.</p>
                  }
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hardware / SerialConnector */}
            <div
              style={{
                borderRadius: 14, padding: '18px',
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: '1px solid rgba(0,238,255,0.08)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.15), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Cpu className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                <span style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.6)' }}>Hardware</span>
              </div>
              <SerialConnector />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'DM Sans, sans-serif', marginTop: 10, lineHeight: 1.5 }}>
                Web Serial API: Chrome yoki Edge brauzeridan foydalaning.
              </p>
            </div>

            {/* Lesson details */}
            <div
              style={{
                borderRadius: 14, padding: '18px',
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: '1px solid rgba(0,238,255,0.08)',
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)' }}>Missiya tafsilotlari</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Daraja',   value: <span style={{ color: lvColor, fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.9rem' }}>{lesson?.level}</span> },
                  { label: 'Mukofot',  value: <span className="badge-xp">+{lesson?.xpReward} XP</span> },
                  { label: 'Holat',    value: isCompleted ? <span className="badge-completed">Bajarildi ✓</span> : <span className="badge-level">Faol</span> },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem' }}>{label}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Components */}
            {lesson?.components?.length > 0 && (
              <div
                style={{
                  borderRadius: 14, padding: '18px',
                  background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                  border: '1px solid rgba(0,238,255,0.08)',
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(234,243,255,0.5)' }}>Komponentlar</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {lesson.components.map((c, i) => (
                    <span key={i}
                      style={{
                        fontFamily: 'Chakra Petch, monospace', fontSize: '0.7rem', letterSpacing: '0.06em',
                        color: 'var(--cyan)', padding: '5px 10px', borderRadius: 7,
                        background: 'rgba(0,238,255,0.06)', border: '1px solid rgba(0,238,255,0.12)',
                      }}
                    >{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Win condition */}
            {lesson?.winCondition && (
              <div
                style={{
                  borderRadius: 14, padding: '16px 18px',
                  background: 'linear-gradient(135deg, rgba(255,230,0,0.04), rgba(255,105,32,0.03))',
                  border: '1px solid rgba(255,230,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#FFE600', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFE600', marginBottom: 3 }}>G'alaba sharti</div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem' }}>
                      {lesson.winCondition.type?.replace(/_/g, ' ')}: {lesson.winCondition.count ?? lesson.winCondition.value}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
