import { useEffect, useState } from 'react';
import { Trophy, Loader2, Sparkles, Lock, CheckCircle } from 'lucide-react';
import { achievementsAPI } from '../lib/api';

export default function Achievements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { achievementsAPI.list().then(r => setItems(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const earned = items.filter(a => a.earned).length;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-game text-white flex items-center gap-3"><Trophy className="w-8 h-8 text-neon-yellow" /> Achievements</h1>
        </div>
        <div className="card-glow mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neon-yellow/20 flex items-center justify-center"><Trophy className="w-6 h-6 text-neon-yellow" /></div>
            <div><p className="text-2xl font-game text-white">{earned}/{items.length}</p><p className="text-xs text-dark-400">Earned</p></div>
          </div>
          <div className="w-32">
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-neon-yellow rounded-full" style={{ width: items.length > 0 ? `${(earned / items.length) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <div key={a.id} className={`rounded-2xl border p-5 text-center ${a.earned ? 'bg-dark-800/80 border-neon-yellow/30' : 'bg-dark-800/30 border-dark-700 opacity-60'}`}>
              <div className={`text-4xl mb-3 ${a.earned ? '' : 'grayscale'}`}>{a.icon || '🏆'}</div>
              <h3 className="font-game text-white text-lg">{a.title}</h3>
              <p className="text-sm text-dark-400 mt-1">{a.description}</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                {a.earned ? <><CheckCircle className="w-4 h-4 text-neon-green" /><span className="badge-completed text-xs">Earned!</span></> : <><Lock className="w-4 h-4 text-dark-500" /><span className="badge-locked text-xs">Locked</span></>}
                {a.xpReward && <span className="badge-xp text-xs">+{a.xpReward} XP</span>}
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="text-center py-16"><Sparkles className="w-12 h-12 text-dark-500 mx-auto mb-4" /><h3 className="text-xl font-game text-dark-400">No achievements yet</h3></div>
        )}
      </div>
    </div>
  );
}
