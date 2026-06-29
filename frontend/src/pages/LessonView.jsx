import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CircuitBoard, Code, Cpu, Gamepad2, Loader2, Lock } from 'lucide-react';
import { lessonsAPI, progressAPI } from '../lib/api';
import SerialConnector from '../components/SerialConnector';
import { getGameComponent } from '../components/Game/GameEngine';
import StoryMission, { StoryVictory } from '../components/Game/StoryMission';
import useGameStore from '../stores/gameStore';
import toast from 'react-hot-toast';

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('game');
  const [gameStarted, setGameStarted] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winScore, setWinScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completing, setCompleting] = useState(false);
  const { startGame, stopGame } = useGameStore();

  useEffect(() => {
    lessonsAPI.get(id).then(r => setLesson(r.data)).catch(() => { toast.error('Dars topilmadi'); navigate('/lessons'); }).finally(() => setLoading(false));
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
      if (data.newAchievements?.length > 0) data.newAchievements.forEach(a => toast.success(`Yutuq: ${a.title}! +${a.xpReward} XP`, { duration: 5000 }));
      lessonsAPI.get(id).then(r => setLesson(r.data));
    } catch (err) { toast.error('Saqlashda xatolik'); }
    finally { setCompleting(false); }
  }, [id]);

  const startLessonGame = () => {
    if (lesson?.gameConfig) useGameStore.getState().setWinConfig(lesson.winCondition, handleWin);
    startGame();
    setGameStarted(true);
    setShowStory(true);
    setActiveTab('game');
  };

  const handleStoryStart = () => {
    setShowStory(false);
  };

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!lesson) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><p className="text-dark-400">Dars topilmadi</p></div>;
  if (lesson.locked) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4"><Lock className="w-10 h-10 text-dark-500" /></div>
        <h1 className="text-2xl font-game text-dark-400 mb-2">Dars qulflangan</h1>
        <p className="text-dark-500 mb-6">Bu darsni ochish uchun oldingi darslarni bajarib, yetarli XP to'plang.</p>
        <button onClick={() => navigate('/lessons')} className="btn-primary">Darslar ro'yxatiga qaytish</button>
      </div>
    </div>
  );

  const isCompleted = lesson.progress?.completed;
  const GameComponent = getGameComponent(lesson.gameConfig?.gameType);
  const tabs = [
    { id: 'game', label: "O'yin", icon: Gamepad2 },
    { id: 'circuit', label: "Sxema", icon: CircuitBoard },
    { id: 'code', label: "Kod", icon: Code },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/lessons')} className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50"><ArrowLeft className="w-5 h-5" /></button>
            <div><h1 className="text-2xl font-game text-white">{lesson.title}</h1><p className="text-sm text-dark-400">Level {lesson.level} · {lesson.xpReward} XP{isCompleted && ' ✅'}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <SerialConnector compact />
            {!gameStarted && !isCompleted && <button onClick={startLessonGame} className="btn-primary text-sm py-2">O'yinni boshlash</button>}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex gap-1 mb-4 bg-dark-800/50 rounded-xl p-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-white'}`}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              ))}
            </div>
            <div className="game-container min-h-[500px]">
              {activeTab === 'game' && (
                <div className="relative w-full h-full min-h-[500px]">
                  {gameStarted ? <GameComponent /> : (
                    <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                      <Gamepad2 className="w-10 h-10 text-brand-400" />
                      <h3 className="text-xl font-game text-white">Digital Twin O'yin</h3>
                      <p className="text-dark-400 text-center max-w-md">Arduino'ni ulang va o'yinni boshlang!</p>
                      <button onClick={startLessonGame} className="btn-primary">O'yinni boshlash</button>
                    </div>
                  )}
                  {/* Story overlay on top of game */}
                  {gameStarted && showStory && (
                    <StoryMission 
                      gameType={lesson.gameConfig?.gameType} 
                      onStart={handleStoryStart}
                    />
                  )}
                  {gameStarted && !showStory && showWinModal && !completing && (
                    <StoryVictory
                      gameType={lesson.gameConfig?.gameType}
                      score={winScore}
                      xpEarned={xpEarned}
                      onContinue={() => setShowWinModal(false)}
                    />
                  )}
                </div>
              )}
              {activeTab === 'circuit' && (
                <div className="p-6">
                  <h3 className="text-lg font-game text-white mb-4">Sxema</h3>
                  {lesson.components?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lesson.components.map((c, i) => <span key={i} className="badge bg-dark-700 text-dark-200">{c}</span>)}
                    </div>
                  )}
                  <p className="text-dark-400 text-sm">To'plamdagi sxemaga qarang va komponentlarni ulang.</p>
                </div>
              )}
              {activeTab === 'code' && (
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-game text-white">Arduino Kodi</h3>
                    <button onClick={() => { navigator.clipboard.writeText(lesson.codeExample || ''); toast.success('Nusxalandi!'); }} className="text-sm text-brand-400">Nusxa</button>
                  </div>
                  {lesson.codeExample ? (
                    <pre className="bg-dark-950 rounded-xl p-4 border border-dark-700 overflow-x-auto">
                      <code className="text-sm text-neon-green font-mono">{lesson.codeExample}</code>
                    </pre>
                  ) : <p className="text-dark-400">Kod yo'q</p>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-glow">
              <h3 className="font-game text-white mb-3"><Cpu className="w-4 h-4 inline text-neon-cyan" /> Hardware</h3>
              <SerialConnector />
              <p className="text-xs text-dark-500 mt-3">Web Serial uchun Chrome yoki Edge brauzeridan foydalaning.</p>
            </div>
            <div className="card-glow">
              <h3 className="font-game text-white mb-3">Tafsilotlar</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-dark-400">Level</span><span className="text-white font-semibold">{lesson.level}</span></div>
                <div className="flex justify-between"><span className="text-dark-400">XP</span><span className="badge-xp text-xs">+{lesson.xpReward}</span></div>
                <div className="flex justify-between"><span className="text-dark-400">Holat</span>{isCompleted ? <span className="badge-completed text-xs">Bajarildi</span> : <span className="badge-level text-xs">Faol</span>}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
