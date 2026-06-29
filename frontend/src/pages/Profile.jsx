import { useState } from 'react';
import { User, Mail, Cpu, Zap, Calendar, Save, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try { await updateProfile({ name }); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><h1 className="text-3xl font-game text-white flex items-center gap-3"><User className="w-8 h-8 text-brand-400" /> Profile</h1></div>
        <div className="space-y-6">
          <div className="card-glow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center"><span className="text-2xl font-game text-white">{user.name?.[0]}</span></div>
              <div><h2 className="text-xl font-game text-white">{user.name}</h2><p className="text-sm text-dark-400">{user.email}</p></div>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-dark-300 mb-1.5 block">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-dark-300 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="email" value={user.email} disabled className="input-field pl-10 opacity-60" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
          <div className="card-glow">
            <h3 className="font-game text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-neon-yellow mx-auto mb-2" />
                <p className="text-2xl font-game text-white">{user.xp}</p>
                <p className="text-xs text-dark-400">XP</p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                <Cpu className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                <p className="text-2xl font-game text-white">{user.level}</p>
                <p className="text-xs text-dark-400">Level</p>
              </div>
            </div>
          </div>
          <div className="card-glow">
            <h3 className="font-game text-white mb-4">Account</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3"><User className="w-4 h-4 text-dark-400" /><span className="text-dark-400">Role:</span><span className="badge-level text-xs">{user.role}</span></div>
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-dark-400" /><span className="text-dark-400">Joined:</span><span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
