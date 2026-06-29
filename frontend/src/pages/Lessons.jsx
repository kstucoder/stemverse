import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Cpu, ArrowRight, Loader2, Sparkles, Zap } from 'lucide-react';
import { lessonsAPI } from '../lib/api';

const levelLabels = { 1: "Boshlangich", 2: "O'rta", 3: 'Murakkab' };

export default function Darslar() {
  const [lessons, setDarslar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { lessonsAPI.list().then(r => setDarslar(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-game text-white flex items-center gap-3"><BookOpen className="w-8 h-8 text-brand-400" /> Darslar</h1>
          <p className="text-dark-400 mt-2">Darslarni tugatib, yangi qurilmalarni oching!</p>
        </div>
        <div className="space-y-4">
          {lessons.map((l) => (
            <Link key={l.id} to={`/lessons/${l.id}`}
              className={`block rounded-2xl border p-6 transition-all ${l.progress?.completed ? 'bg-dark-800/50 border-neon-green/30' : 'card-glow'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${l.progress?.completed ? 'bg-neon-green/20' : 'bg-dark-700'}`}>
                  {l.progress?.completed ? <CheckCircle className="w-7 h-7 text-neon-green" /> : <Cpu className="w-7 h-7 text-dark-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-game text-white">{l.title}</h3>
                      <p className="text-sm text-dark-400 mt-1">{l.description}</p>
                    </div>
                    <span className={`badge ${l.progress?.completed ? 'badge-completed' : 'badge-level'}`}>
                      {l.progress?.completed ? 'Bajarildi' : `${l.xpReward} XP`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="badge-level text-xs">
                      <Zap className="w-3 h-3" /> {levelLabels[l.level] || 'Boshlangich'}
                    </span>
                    <span className="badge bg-dark-700 text-dark-300 text-xs">{l.components?.length || 0} parts</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center"><ArrowRight className="w-5 h-5 text-dark-500" /></div>
              </div>
            </Link>
          ))}
        </div>
        {lessons.length === 0 && (
          <div className="text-center py-16"><Sparkles className="w-12 h-12 text-dark-500 mx-auto mb-4" /><h3 className="text-xl font-game text-dark-400">No lessons yet</h3></div>
        )}
      </div>
    </div>
  );
}
