import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, Plus, Trash2, ArrowLeft, Loader2, Copy } from 'lucide-react';
import { teacherAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ClassroomList() {
  const [classrooms, setSinflar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showYaratish, setShowYaratish] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = () => teacherAPI.classrooms().then(r => setSinflar(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleYaratish = async (e) => {
    e.preventDefault(); if (!name.trim()) return;
    setCreating(true);
      try { const { data } = await teacherAPI.createClassroom(name); toast.success(`"${data.name}" sinfi yaratildi!`); setShowYaratish(false); setName(''); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Xatolik'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sinfni o\'chirish?')) return;
    try { await teacherAPI.deleteClassroom(id); toast.success("O'chirildi"); load(); }
    catch (err) { toast.error("O'chirishda xatolik"); }
  };

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/teacher" className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50"><ArrowLeft className="w-5 h-5" /></Link>
            <div><h1 className="text-2xl font-game text-white"><School className="w-6 h-6 inline text-brand-400 mr-2" />Sinflar</h1><p className="text-sm text-dark-400">{classrooms.length} ta</p></div>
          </div>
          <button onClick={() => setShowYaratish(!showYaratish)} className="btn-primary text-sm py-2"><Plus className="w-4 h-4 inline mr-1" />Yangi sinf</button>
        </div>

        {showYaratish && (
          <div className="card-glow mb-8 animate-slide-down">
            <h3 className="font-game text-white mb-4">Sinf yaratish</h3>
            <form onSubmit={handleYaratish} className="flex gap-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sinf nomi (masalan: 7-A sinf)" className="input-field flex-1" required />
              <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Yaratilmoqda...' : 'Yaratish'}</button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {classrooms.map(c => (
            <div key={c.id} className="card-glow flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0"><School className="w-6 h-6 text-brand-400" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{c.name}</h3>
                <p className="text-xs text-dark-400">
                  <span>{c._count?.students || 0} o'quvchi</span>
                  <span className="ml-4">Kod: <span className="font-mono text-brand-400 cursor-pointer" onClick={() => { navigator.clipboard.writeText(c.inviteCode); toast.success('Nusxalandi!'); }}>{c.inviteCode} <Copy className="w-3 h-3 inline" /></span></span>
                </p>
              </div>
              <button onClick={() => navigate(`/teacher/classroom/${c.id}`)} className="btn-secondary text-xs py-1.5">Ko'rish</button>
              <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg text-dark-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {classrooms.length === 0 && <div className="text-center py-16"><School className="w-12 h-12 text-dark-500 mx-auto mb-4" /><p className="text-dark-400">Hali sinflar yo'q</p></div>}
        </div>
      </div>
    </div>
  );
}
