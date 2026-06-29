import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Zap, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { kitAPI } from '../lib/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function KitActivation() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activated, setAktivlashtirishd] = useState(false);
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Kodni kiriting'); return; }
    setLoading(true);
    try {
      const { data } = await kitAPI.activate(code.trim().toUpperCase());
      setAktivlashtirishd(true);
      toast.success(`To'plam aktivlashtirildi! +${data.xpEarned} XP`);
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4"><Gift className="w-10 h-10 text-white" /></div>
          <h1 className="text-3xl font-game text-white">KITni aktivlashtirish</h1>
          <p className="text-dark-400 mt-2">STEMVERSE to'plamingizdagi kodni kiriting</p>
        </div>
        {activated ? (
          <div className="card-glow text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-neon-green/20 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10 text-neon-green" /></div>
            <h2 className="text-2xl font-game text-white mb-4">To'plam Aktivlashtirildi! 🎉</h2>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Asosiy</button>
              <button onClick={() => navigate('/lessons')} className="btn-secondary">Darslar</button>
            </div>
          </div>
        ) : (
          <div className="card-glow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2">Aktivlashtirish kodi</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="SV-XXXX" className="input-field text-center text-2xl font-game tracking-widest" maxLength={20} autoFocus />
                <p className="text-xs text-dark-500 mt-2">STEMVERSE to'plam qutisi ichida topishingiz mumkin</p>
              </div>
              <button type="submit" disabled={loading || code.length < 3} className="btn-neon w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {loading ? 'Aktivlashtirilmoqda...' : 'Aktivlashtirish'}
              </button>
            </form>
            <div className="mt-6">
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" /> Keyinroq</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
