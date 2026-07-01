import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Key, Users, Loader2, ShoppingCart, Package } from 'lucide-react';
import { adminAPI } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminAPI.stats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const cards = [
    { label: 'Foydalanuvchilar', value: stats?.users?.total || 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/20' },
    { label: "O'quvchilar", value: stats?.users?.students || 0, icon: Users, color: 'text-neon-cyan', bg: 'bg-neon-cyan/20' },
    { label: 'Darslar', value: stats?.lessons?.total || 0, icon: BookOpen, color: 'text-neon-green', bg: 'bg-neon-green/20' },
    { label: 'Nashr qilingan', value: stats?.lessons?.published || 0, icon: BookOpen, color: 'text-neon-yellow', bg: 'bg-neon-yellow/20' },
    { label: 'Buyurtmalar', value: stats?.orders?.total || 0, icon: ShoppingCart, color: 'text-neon-pink', bg: 'bg-neon-pink/20' },
    { label: 'Kodlar', value: `${stats?.codes?.used || 0}/${stats?.codes?.total || 0}`, icon: Key, color: 'text-neon-orange', bg: 'bg-neon-orange/20' },
  ];

  const pendingOrders = stats?.orders?.pending || 0;

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

        <div className="grid sm:grid-cols-4 gap-4">
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
          <Link to="/admin" className="card-glow flex items-center gap-4 opacity-50 pointer-events-none">
            <Package className="w-6 h-6 text-dark-400" />
            <div><h3 className="font-semibold text-white">Mahsulotlar</h3><p className="text-xs text-dark-400">Tez kunda</p></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
