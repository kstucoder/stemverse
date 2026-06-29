import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Key, Users, BarChart3, Loader2 } from 'lucide-react';
import { adminAPI } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminAPI.stats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const cards = [
    { label: 'Users', value: stats?.users?.total || 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/20' },
    { label: 'Students', value: stats?.users?.students || 0, icon: Users, color: 'text-neon-cyan', bg: 'bg-neon-cyan/20' },
    { label: 'Lessons', value: stats?.lessons?.total || 0, icon: BookOpen, color: 'text-neon-green', bg: 'bg-neon-green/20' },
    { label: 'Published', value: stats?.lessons?.published || 0, icon: BarChart3, color: 'text-neon-yellow', bg: 'bg-neon-yellow/20' },
    { label: 'Kits', value: stats?.kits?.activated || 0, icon: Key, color: 'text-neon-pink', bg: 'bg-neon-pink/20' },
    { label: 'Codes Used', value: `${stats?.codes?.used || 0}/${stats?.codes?.total || 0}`, icon: Key, color: 'text-neon-orange', bg: 'bg-neon-orange/20' },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><h1 className="text-3xl font-game text-white"><LayoutDashboard className="w-8 h-8 inline text-brand-400" /> Admin Panel</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {cards.map((c, i) => (
            <div key={i} className="card-glow text-center">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mx-auto mb-3`}><c.icon className={`w-5 h-5 ${c.color}`} /></div>
              <p className="text-2xl font-game text-white">{c.value}</p>
              <p className="text-xs text-dark-400">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/admin/lessons" className="card-glow flex items-center gap-4"><BookOpen className="w-6 h-6 text-brand-400" /><div><h3 className="font-semibold text-white">Lessons</h3><p className="text-xs text-dark-400">Manage</p></div></Link>
          <Link to="/admin/codes" className="card-glow flex items-center gap-4"><Key className="w-6 h-6 text-neon-cyan" /><div><h3 className="font-semibold text-white">Codes</h3><p className="text-xs text-dark-400">Generate</p></div></Link>
          <div className="card-glow flex items-center gap-4"><BarChart3 className="w-6 h-6 text-neon-green" /><div><h3 className="font-semibold text-white">{stats?.progress?.completedLessons || 0}</h3><p className="text-xs text-dark-400">Completed</p></div></div>
        </div>
      </div>
    </div>
  );
}
