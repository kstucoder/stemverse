import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, Plus, Trash2, ArrowLeft, Copy, X } from 'lucide-react';
import { teacherAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ClassroomList() {
  const [classrooms,   setSinflar]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [name,         setName]         = useState('');
  const [creating,     setCreating]     = useState(false);
  const navigate = useNavigate();

  const load = () =>
    teacherAPI.classrooms().then(r => setSinflar(r.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { data } = await teacherAPI.createClassroom(name);
      toast.success(`"${data.name}" sinfi yaratildi!`);
      setShowForm(false); setName(''); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Sinfni o'chirish?")) return;
    try { await teacherAPI.deleteClassroom(id); toast.success("O'chirildi"); load(); }
    catch  { toast.error("O'chirishda xatolik"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span style={{ fontFamily: 'Chakra Petch, monospace', color: 'var(--cyan)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Yuklanmoqda...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 20% 0, rgba(168,85,247,0.04) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/teacher"
              style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(0,238,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="eyebrow-label mb-1">O'qituvchi paneli</div>
              <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color: 'white', letterSpacing: '0.04em' }}>
                Sinflar{' '}
                <span style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ({classrooms.length} ta)
                </span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className={showForm ? 'btn-secondary' : 'btn-primary'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
          >
            {showForm ? <><X className="w-4 h-4" /> Yopish</> : <><Plus className="w-4 h-4" /> Yangi sinf</>}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div
            style={{
              borderRadius: 14, padding: '22px 24px', marginBottom: 20,
              background: 'linear-gradient(135deg, rgba(0,238,255,0.04), rgba(0,238,255,0.01))',
              border: '1px solid rgba(0,238,255,0.15)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,238,255,0.3), transparent)' }} />
            <div className="eyebrow-label mb-4">Yangi sinf yaratish</div>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10 }}>
              <div className="relative" style={{ flex: 1 }}>
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sinf nomi (masalan: 7-A sinf)"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  autoFocus
                  required
                />
              </div>
              <button type="submit" disabled={creating} className="btn-primary" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {creating
                  ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Yaratilmoqda...</>
                  : 'Yaratish'
                }
              </button>
            </form>
          </div>
        )}

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classrooms.map(c => {
            const count = c._count?.students ?? 0;
            return (
              <div
                key={c.id}
                style={{
                  borderRadius: 14, padding: '18px 20px',
                  background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                  border: '1px solid rgba(0,238,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'border-color 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,238,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,238,255,0.06)'}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(0,238,255,0.08)', border: '1px solid rgba(0,238,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <School className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.95rem', color: 'white', letterSpacing: '0.03em', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      {count} o'quvchi
                    </span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(c.inviteCode); toast.success('Nusxalandi!'); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--cyan)', background: 'rgba(0,238,255,0.06)', border: '1px solid rgba(0,238,255,0.12)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Nusxa olish"
                    >
                      {c.inviteCode} <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/teacher/classroom/${c.id}`)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '8px 16px' }}
                  >
                    Ko'rish
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.1)', color: 'rgba(255,59,48,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.12)'; e.currentTarget.style.color = '#FF3B30'; e.currentTarget.style.borderColor = 'rgba(255,59,48,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.06)'; e.currentTarget.style.color = 'rgba(255,59,48,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,59,48,0.1)'; }}
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {classrooms.length === 0 && (
            <div
              style={{
                borderRadius: 14, padding: '60px 24px',
                background: 'linear-gradient(135deg, #080E1C, #0B1120)',
                border: '1px dashed rgba(0,238,255,0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,238,255,0.06)', border: '1px solid rgba(0,238,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <School className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Hali sinflar yo'q
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
