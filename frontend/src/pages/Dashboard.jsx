import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, Trophy, Cpu, CheckCircle, TrendingUp, Loader2, ArrowRight, Gift } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { progressAPI, lessonsAPI, kitAPI } from '../lib/api';

export default function Dashboard() {
  const { user, fetchUser } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([progressAPI.overview(), lessonsAPI.list(), kitAPI.myKit()])
      .then(([p, l, k]) => { setStats(p.data); setRecent(l.data.slice(0, 3)); setKit(k.data.kit); fetchUser(); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const xpInLevel = (user?.xp || 0) - ((user?.level || 1) * 200 - 200);
  const levelProgress = Math.min((xpInLevel / 200) * 100, 100);

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-game text-white">Welcome, <span className="text-gradient">{user?.name}</span></h1>
            <p className="text-dark-400 mt-1">Keyingi darsga tayyormisiz?</p>
          </div>
          {!kit && <Link to="/activate" className="btn-secondary flex items-center gap-2 text-sm"><Gift className="w-4 h-4" /> KITni aktivlashtirish</Link>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-glow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center"><Zap className="w-5 h-5 text-brand-400" /></div>
              <div><p className="text-2xl font-game text-white">{user?.xp || 0}</p><p className="text-xs text-dark-400">Umumiy XP</p></div>
            </div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="text-xs text-dark-500 mt-1">Lv.{user?.level}</p>
          </div>
          <div className="card-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-neon-green" /></div>
              <div><p className="text-2xl font-game text-white">{stats?.completedLessons || 0}</p><p className="text-xs text-dark-400">Bajarilgan</p></div>
            </div>
            <p className="text-xs text-dark-500 mt-3">of {stats?.totalLessons || 0} lessons</p>
          </div>
          <div className="card-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-neon-cyan" /></div>
              <div><p className="text-2xl font-game text-white">{stats?.progress || 0}%</p><p className="text-xs text-dark-400">Progress</p></div>
            </div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-neon-cyan rounded-full" style={{ width: `${stats?.progress || 0}%` }} />
            </div>
          </div>
          <div className="card-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center"><Cpu className="w-5 h-5 text-neon-pink" /></div>
              <div><p className="text-2xl font-game text-white">{kit ? 'Active' : '—'}</p><p className="text-xs text-dark-400">Hardware Kit</p></div>
            </div>
            {kit && <p className="text-xs text-dark-500 mt-3">{kit.name}</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-game text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-brand-400" /> So'nggi darslar</h2>
              <Link to="/lessons" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">Hammasini ko'rish <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-3">
              {recent.map((l) => (
                <Link key={l.id} to={`/lessons/${l.id}`} className="card-glow flex items-center gap-4 block">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${l.progress?.completed ? 'bg-neon-green/20' : 'bg-dark-700'}`}>
                    {l.progress?.completed ? <CheckCircle className="w-6 h-6 text-neon-green" /> : <Cpu className="w-6 h-6 text-dark-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{l.title}</h3>
                    <p className="text-xs text-dark-400">Level {l.level} · {l.xpReward} XP</p>
                  </div>
                  <span className={`badge ${l.progress?.completed ? 'badge-completed' : 'badge-level'}`}>{l.progress?.completed ? 'Done' : `${l.progress?.score || 0} pts`}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="card-glow mb-6">
              <div className="space-y-2">
                <Link to="/lessons" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-dark-700/50 hover:bg-dark-700 text-sm">
                  <BookOpen className="w-4 h-4 text-brand-400" /><span className="text-dark-200">Darsni boshlash</span>
                </Link>
                {!kit && <Link to="/activate" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-dark-700/50 hover:bg-dark-700 text-sm">
                  <Gift className="w-4 h-4 text-neon-cyan" /><span className="text-dark-200">Activate kit</span>
                </Link>}
              </div>
            </div>
            <div className="card-glow text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-game text-white">{user?.level}</span>
              </div>
              <h3 className="font-game text-white text-lg">Level {user?.level}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
