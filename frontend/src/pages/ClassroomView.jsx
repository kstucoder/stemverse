import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, BookOpen, Loader2, Copy, TrendingUp, CheckCircle } from 'lucide-react';
import { teacherAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ClassroomView() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getClassroom(id).then(r => setClassroom(r.data)).catch(() => toast.error('Classroom not found')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!classroom) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><p className="text-dark-400">Not found</p></div>;

  const students = classroom.students || [];
  const totalXP = students.reduce((sum, e) => sum + (e.student?.xp || 0), 0);
  const avgLevel = students.length > 0 ? (students.reduce((sum, e) => sum + (e.student?.level || 0), 0) / students.length) : 0;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/teacher/classrooms" className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-game text-white">{classroom.name}</h1>
              <span className="badge-level text-xs">{students.length} students</span>
            </div>
            <p className="text-sm text-dark-400 mt-1">Invite code: <span className="font-mono text-brand-400 cursor-pointer" onClick={() => { navigator.clipboard.writeText(classroom.inviteCode); toast.success('Copied!'); }}>{classroom.inviteCode} <Copy className="w-3 h-3 inline" /></span></p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-glow text-center"><Users className="w-5 h-5 text-brand-400 mx-auto mb-2" /><p className="text-2xl font-game text-white">{students.length}</p><p className="text-xs text-dark-400">O'quvchilar</p></div>
          <div className="card-glow text-center"><TrendingUp className="w-5 h-5 text-neon-cyan mx-auto mb-2" /><p className="text-2xl font-game text-white">{totalXP}</p><p className="text-xs text-dark-400">Total XP</p></div>
          <div className="card-glow text-center"><Trophy className="w-5 h-5 text-neon-yellow mx-auto mb-2" /><p className="text-2xl font-game text-white">{avgLevel.toFixed(1)}</p><p className="text-xs text-dark-400">Avg Level</p></div>
        </div>

        <div className="card-glow">
          <h3 className="font-game text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-brand-400" /> O'quvchilar</h3>
          {students.length === 0 ? (
            <p className="text-dark-400 text-sm">Hali o'quvchilar yo'q. Share the invite code with your students!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-dark-700"><th className="text-left py-3 text-dark-400 font-semibold">O'quvchi</th><th className="text-center py-3 text-dark-400 font-semibold">Level</th><th className="text-center py-3 text-dark-400 font-semibold">XP</th><th className="text-center py-3 text-dark-400 font-semibold">Progress</th><th className="text-center py-3 text-dark-400 font-semibold">Achievements</th></tr></thead>
                <tbody>
                  {students.map(e => {
                    const s = e.student;
                    const progress = s?.progress || [];
                    const completed = progress.filter(p => p.completed).length;
                    const totalLessons = 20;
                    return (
                      <tr key={e.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                        <td className="py-3 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center"><span className="text-[10px] font-bold text-white">{s?.name?.[0]}</span></div>
                          <div><span className="text-white font-semibold">{s?.name}</span><br /><span className="text-dark-500 text-[10px]">{s?.email}</span></div>
                        </td>
                        <td className="text-center"><span className="badge-level text-xs">Lv.{s?.level}</span></td>
                        <td className="text-center"><span className="badge-xp text-xs">{s?.xp} XP</span></td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-dark-700 rounded-full h-1.5"><div className="h-full bg-neon-green rounded-full" style={{ width: `${(completed/totalLessons)*100}%` }} /></div>
                            <span className="text-xs text-dark-400">{completed}/{totalLessons}</span>
                          </div>
                        </td>
                        <td className="text-center"><span className="text-xs text-neon-yellow">{s?.achievements?.length || 0}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
