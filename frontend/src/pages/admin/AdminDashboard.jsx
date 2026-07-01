import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Key, Users, Loader2, ShoppingCart, Package, School, ChevronDown, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([
      adminAPI.stats(),
      api.get('/admin/teachers'),
    ]).then(([s, t]) => {
      setStats(s.data);
      setTeachers(t.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const cards = [
    { label: 'Foydalanuvchilar', value: stats?.users?.total || 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/20' },
    { label: "O'quvchilar", value: stats?.users?.students || 0, icon: Users, color: 'text-neon-cyan', bg: 'bg-neon-cyan/20' },
    { label: "O'qituvchilar", value: stats?.users?.teachers || 0, icon: School, color: 'text-neon-purple', bg: 'bg-neon-purple/20' },
    { label: 'Darslar', value: stats?.lessons?.total || 0, icon: BookOpen, color: 'text-neon-green', bg: 'bg-neon-green/20' },
    { label: 'Buyurtmalar', value: stats?.orders?.total || 0, icon: ShoppingCart, color: 'text-neon-pink', bg: 'bg-neon-pink/20' },
    { label: 'Kodlar', value: `${stats?.codes?.used || 0}/${stats?.codes?.total || 0}`, icon: Key, color: 'text-neon-orange', bg: 'bg-neon-orange/20' },
  ];

  const pendingOrders = stats?.orders?.pending || 0;
  const totalStudents = teachers.reduce((sum, t) => sum + t._count.classrooms, 0);

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-game text-white"><LayoutDashboard className="w-8 h-8 inline text-brand-400" /> Admin paneli</h1>
          <p className="text-dark-400 mt-1">Platformani boshqarish</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {cards.map((c, i) => (
            <div key={i} className="card-glow text-center">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mx-auto mb-3`}><c.icon className={`w-5 h-5 ${c.color}`} /></div>
              <p className="text-2xl font-game text-white">{c.value}</p>
              <p className="text-xs text-dark-400">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          <Link to="/admin/orders" className="card-glow flex items-center gap-4 relative">
            <ShoppingCart className="w-6 h-6 text-neon-orange" />
            <div>
              <h3 className="font-semibold text-white">Buyurtmalar</h3>
              <p className="text-xs text-dark-400">{pendingOrders > 0 ? `${pendingOrders} ta kutilmoqda` : 'Barcha buyurtmalar'}</p>
            </div>
            {pendingOrders > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-5 px-1.5 rounded-full bg-neon-orange text-dark-900 text-[11px] font-bold flex items-center justify-center shadow-lg">{pendingOrders}</span>
            )}
          </Link>
          <Link to="/admin/lessons" className="card-glow flex items-center gap-4">
            <BookOpen className="w-6 h-6 text-brand-400" />
            <div><h3 className="font-semibold text-white">Darslar</h3><p className="text-xs text-dark-400">Boshqarish</p></div>
          </Link>
          <Link to="/admin/codes" className="card-glow flex items-center gap-4">
            <Key className="w-6 h-6 text-neon-cyan" />
            <div><h3 className="font-semibold text-white">Aktivatsiya kodlari</h3><p className="text-xs text-dark-400">Yaratish</p></div>
          </Link>
          <div className="card-glow flex items-center gap-4 opacity-50 pointer-events-none">
            <Package className="w-6 h-6 text-dark-400" />
            <div><h3 className="font-semibold text-white">Mahsulotlar</h3><p className="text-xs text-dark-400">Tez kunda</p></div>
          </div>
        </div>

        {/* O'qituvchilar bo'limi */}
        <div className="mb-6">
          <h2 className="text-xl font-game text-white flex items-center gap-2 mb-4">
            <School className="w-5 h-5 text-neon-purple" />
            O'qituvchilar
            <span className="text-sm font-normal text-dark-400 font-body">({teachers.length} ta)</span>
          </h2>
          <div className="space-y-2">
            {teachers.map((t) => (
              <div key={t.id} className="rounded-xl border border-dark-700 overflow-hidden bg-dark-800/30">
                <button
                  onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-dark-700/30 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-cyan/20 flex items-center justify-center text-sm font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-dark-400 truncate">{t.email}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-400">
                    <span><strong className="text-neon-cyan">{t.classrooms.length}</strong> ta sinf</span>
                    <span><strong className="text-neon-green">{t.classrooms.reduce((s, c) => s + c._count.students, 0)}</strong> ta o'quvchi</span>
                  </div>
                  {expanded === t.id ? <ChevronDown className="w-4 h-4 text-dark-400" /> : <ChevronRight className="w-4 h-4 text-dark-400" />}
                </button>
                {expanded === t.id && (
                  <div className="px-5 pb-4 pt-1 border-t border-dark-700/50">
                    {t.classrooms.length === 0 ? (
                      <p className="text-sm text-dark-500 py-2">Hali sinflar yo'q</p>
                    ) : (
                      <div className="space-y-1.5">
                        {t.classrooms.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-800/50 text-sm">
                            <School className="w-4 h-4 text-brand-400 shrink-0" />
                            <span className="text-dark-200 font-medium">{c.name}</span>
                            <span className="text-dark-500 text-xs ml-1">({c.inviteCode})</span>
                            <span className="ml-auto text-xs text-dark-400">
                              <strong className="text-neon-cyan">{c._count.students}</strong> o'quvchi
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {teachers.length === 0 && (
              <div className="text-center py-8 text-dark-500 text-sm">Hali o'qituvchilar yo'q</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}