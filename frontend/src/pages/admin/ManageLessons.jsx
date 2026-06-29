import { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Loader2, Save, ArrowLeft } from 'lucide-react';
import { lessonsAPI, adminAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManageLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', level: 1, order: 0, components: '', codeExample: '', xpReward: 50, gameConfig: '{}', winCondition: '{}', published: false });

  useEffect(() => { lessonsAPI.list().then(r => setLessons(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const reset = () => setForm({ title: '', description: '', level: 1, order: 0, components: '', codeExample: '', xpReward: 50, gameConfig: '{}', winCondition: '{}', published: false });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createLesson({ ...form, components: form.components.split(',').map(s => s.trim()).filter(Boolean), gameConfig: JSON.parse(form.gameConfig), winCondition: JSON.parse(form.winCondition) });
      toast.success("Yaratildi!");
      setShowCreate(false);
      reset();
      lessonsAPI.list().then(r => setLessons(r.data));
    } catch (err) { toast.error('Xatolik'); }
  };

  const handleUpdate = async (id) => {
    try { await adminAPI.updateLesson(id, form); toast.success("Yangilandi!"); setEditing(null); lessonsAPI.list().then(r => setLessons(r.data)); }
    catch (err) { toast.error('Xatolik'); }
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirish?")) return;
    try { await adminAPI.deleteLesson(id); toast.success("O'chirildi"); lessonsAPI.list().then(r => setLessons(r.data)); }
    catch (err) { toast.error('Xatolik'); }
  };

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50"><ArrowLeft className="w-5 h-5" /></Link>
            <div><h1 className="text-2xl font-game text-white"><BookOpen className="w-6 h-6 inline text-brand-400" /> Darslar</h1><p className="text-sm text-dark-400">{lessons.length} ta</p></div>
          </div>
          <button onClick={() => { setShowCreate(!showCreate); reset(); }} className="btn-primary text-sm py-2"><Plus className="w-4 h-4 inline mr-1" /> Yangi</button>
        </div>

        {showCreate && (
          <div className="card-glow mb-8">
            <h3 className="font-game text-white mb-4">Dars yaratish</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Nomi" className="input-field" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field h-20" placeholder="Tavsif" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={form.level} onChange={e => setForm({...form, level: +e.target.value})} className="input-field" placeholder="Daraja" />
                <input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} className="input-field" placeholder="Tartib" />
                <input type="number" value={form.xpReward} onChange={e => setForm({...form, xpReward: +e.target.value})} className="input-field" placeholder="XP" />
              </div>
              <input type="text" value={form.components} onChange={e => setForm({...form, components: e.target.value})} className="input-field" placeholder="Komponentlar (vergul bilan)" />
              <button type="submit" className="btn-primary">Yaratish</button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {lessons.map(l => (
            editing === l.id ? (
              <div key={l.id} className="card-glow">
                <h3 className="font-game text-white mb-4">Tahrirlash: {l.title}</h3>
                <div className="space-y-4">
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" />
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field h-20" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={form.level} onChange={e => setForm({...form, level: +e.target.value})} className="input-field" />
                    <input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} className="input-field" />
                    <input type="number" value={form.xpReward} onChange={e => setForm({...form, xpReward: +e.target.value})} className="input-field" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(l.id)} className="btn-primary text-sm py-2"><Save className="w-4 h-4 inline mr-1" /> Saqlash</button>
                    <button onClick={() => setEditing(null)} className="btn-secondary text-sm py-2">Bekor qilish</button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={l.id} className="card-glow flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-dark-700"><BookOpen className="w-5 h-5 text-dark-400" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{l.title}</h3>
                  <p className="text-xs text-dark-400">Lv.{l.level} · {l.xpReward}XP · {l.published ? 'Nashr' : 'Qoralama'}</p>
                </div>
                <button onClick={() => { setEditing(l.id); setForm({ title: l.title, description: l.description, level: l.level, order: l.order, components: Array.isArray(l.components) ? l.components.join(', ') : '', codeExample: l.codeExample || '', xpReward: l.xpReward, gameConfig: JSON.stringify(l.gameConfig || {}), winCondition: JSON.stringify(l.winCondition || {}), published: l.published }); }}
                  className="p-2 rounded-lg text-dark-400 hover:text-brand-400"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg text-dark-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
