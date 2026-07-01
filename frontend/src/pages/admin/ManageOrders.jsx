import { useEffect, useState } from 'react';
import { ShoppingCart, Loader2, ArrowLeft, Phone, MapPin, Package } from 'lucide-react';
import { orderAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_LABEL = {
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlandi',
  SHIPPED: "Jo'natildi",
  DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor qilindi',
};
const STATUS_BADGE = {
  PENDING: 'badge-locked',
  CONFIRMED: 'badge-level',
  SHIPPED: 'badge-energy',
  DELIVERED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};
const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    orderAPI.list().then(r => setOrders(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await orderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      toast.success('Holat yangilandi');
    } catch (err) {
      toast.error("Xatolik — holatni yangilab bo'lmadi");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalPrice, 0);
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const visible = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-2xl font-game text-white"><ShoppingCart className="w-6 h-6 inline text-neon-orange" /> Buyurtmalar</h1>
              <p className="text-sm text-dark-400">{orders.length} ta buyurtma · {pending} kutilmoqda · ${totalRevenue} jami tushum</p>
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {['ALL', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                filter === s ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {s === 'ALL' ? `Barchasi (${orders.length})` : `${STATUS_LABEL[s]} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="card-glow text-center py-12 text-dark-400">Bu bo'limda buyurtmalar yo'q</div>
        ) : (
          <div className="space-y-3">
            {visible.map(o => (
              <div key={o.id} className="card-glow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{o.fullName}</h3>
                      <span className="text-xs text-dark-500 font-mono">#{o.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-dark-300 mt-1.5">
                      <Phone className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
                      <a href={`tel:${o.phone}`} className="hover:text-neon-cyan">{o.phone}</a>
                      {o.email && <span className="text-dark-500">· {o.email}</span>}
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-dark-300 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neon-green flex-shrink-0 mt-0.5" />
                      <span>{o.region}, {o.city} — {o.address}</span>
                    </div>
                    {o.notes && <div className="text-xs text-dark-500 italic mt-1.5">"{o.notes}"</div>}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-dark-300">
                    <Package className="w-3.5 h-3.5 text-neon-yellow flex-shrink-0" /> {o.quantity} ta
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-game text-neon-yellow">${o.totalPrice}</div>
                    <div className="text-xs text-dark-500">{new Date(o.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`${STATUS_BADGE[o.status]} text-xs`}>{STATUS_LABEL[o.status]}</span>
                    <select
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                      className="input-field !py-1.5 !px-2 text-xs w-auto"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
