import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { School, Users, BookCheck, Plus, Loader2 } from 'lucide-react';
import { teacherAPI } from '../lib/api';

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([teacherAPI.stats(), teacherAPI.classrooms()])
      .then(([s, c]) => { setStats(s.data); setClassrooms(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-game text-white"><School className="w-8 h-8 inline text-brand-400 mr-2" />O'qituvchi paneli</h1><p className="text-dark-400 mt-2">Sinflarni boshqarish va o'quvchilar progressini kuzatish</p></div>
          <Link to="/teacher/classrooms" className="btn-primary text-sm py-2"><Plus className="w-4 h-4 inline mr-1" />Sinflarni boshqarish</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="card-glow text-center"><div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mx-auto mb-3"><School className="w-6 h-6 text-brand-400" /></div><p className="text-3xl font-game text-white">{stats?.classrooms || 0}</p><p className="text-xs text-dark-400">Sinflar</p></div>
          <div className="card-glow text-center"><div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center mx-auto mb-3"><Users className="w-6 h-6 text-neon-cyan" /></div><p className="text-3xl font-game text-white">{stats?.students || 0}</p><p className="text-xs text-dark-400">O'quvchilar</p></div>
          <div className="card-glow text-center"><div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center mx-auto mb-3"><BookCheck className="w-6 h-6 text-neon-green" /></div><p className="text-3xl font-game text-white">{stats?.completedLessons || 0}</p><p className="text-xs text-dark-400">Bajarilgan darslar</p></div>
        </div>

        <h2 className="text-xl font-game text-white mb-4">Sizning sinflaringiz</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(c => (
            <Link key={c.id} to={`/teacher/classroom/${c.id}`} className="card-glow hover:border-brand-500/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-game text-white text-lg">{c.name}</h3>
                <span className="badge-level text-xs">{c._count?.students || c.students?.length || 0} o'quvchi</span>
              </div>
              <p className="text-xs text-dark-500">Code: <span className="font-mono text-brand-400">{c.inviteCode}</span></p>
              {c.students?.slice(0, 5).map(s => (
                <div key={s.student.id} className="flex items-center gap-2 mt-2 text-xs text-dark-400">
                  <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center"><span className="text-[8px] font-bold text-white">{s.student.name[0]}</span></div>
                  <span>{s.student.name}</span>
                  <span className="ml-auto">Lv.{s.student.level} · {s.student.xp}XP</span>
                </div>
              ))}
            </Link>
          ))}
          {classrooms.length === 0 && <div className="card-glow text-center col-span-full py-8 text-dark-400">Hali sinflar yo'q. Birinchi sinfingizni yarating!</div>}
        </div>
      </div>
    </div>
  );
}
