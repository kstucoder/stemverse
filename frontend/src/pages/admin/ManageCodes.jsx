import { useEffect, useState } from 'react';
import { Key, Plus, Loader2, Copy, ArrowLeft } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManageCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { adminAPI.listCodes().then(r => setCodes(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await adminAPI.generateCodes(count);
      toast.success(`${data.generated} codes generated!`);
      adminAPI.listCodes().then(r => setCodes(r.data));
    } catch (err) { toast.error('Failed'); }
    finally { setGenerating(false); }
  };

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const used = codes.filter(c => c.used).length;
  const avail = codes.filter(c => !c.used).length;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50"><ArrowLeft className="w-5 h-5" /></Link>
            <div><h1 className="text-2xl font-game text-white"><Key className="w-6 h-6 inline text-neon-cyan" /> Codes</h1><p className="text-sm text-dark-400">{codes.length} total · {avail} avail · {used} used</p></div>
          </div>
        </div>

        <div className="card-glow mb-8 flex items-center gap-3">
          <input type="number" min="1" max="100" value={count} onChange={e => setCount(+e.target.value)} className="input-field w-24" />
          <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {generating ? '...' : 'Generate'}
          </button>
        </div>

        <div className="card-glow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-2 text-dark-400">Code</th>
                <th className="text-left py-3 px-2 text-dark-400">Status</th>
                <th className="text-left py-3 px-2 text-dark-400">Used By</th>
                <th className="text-right py-3 px-2 text-dark-400">Copy</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} className="border-b border-dark-800">
                  <td className="py-3 px-2 font-mono text-white">{c.code}</td>
                  <td className="py-3 px-2">{c.used ? <span className="badge-completed text-xs">Used</span> : <span className="badge-level text-xs">Available</span>}</td>
                  <td className="py-3 px-2 text-dark-400">{c.usedBy?.name || '—'}</td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!'); }} className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400"><Copy className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codes.length === 0 && <div className="text-center py-8 text-dark-400">No codes yet</div>}
        </div>
      </div>
    </div>
  );
}
