import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, LogOut, Trophy, BookOpen, LayoutDashboard, Menu, X, Cpu, School } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'Lessons' },
    { to: '/achievements', icon: Trophy, label: 'Achievements' },
  ];
  if (user.role === 'ADMIN') navItems.push({ to: '/admin', icon: Cpu, label: 'Admin' });
  if (user.role === 'TEACHER' || user.role === 'ADMIN') navItems.push({ to: '/teacher', icon: School, label: 'Teacher' });

  return (
    <header className="sticky top-0 z-50 glass border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-game text-xl text-white hidden sm:block">STEM<span className="text-gradient">VERSE</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="flex items-center gap-2 px-4 py-2 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all">
                <item.icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-700/50 hover:bg-dark-700">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                  <span className="text-xs font-bold">{user.name?.[0]}</span>
                </div>
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-700/50">
                <span className="badge-level text-xs">Lv.{user.level}</span>
                <span className="badge-xp text-xs">{user.xp} XP</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-xl text-dark-400 hover:text-red-400 hover:bg-dark-700/50">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-dark-700 bg-dark-900/95 backdrop-blur-md animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50">
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
            <hr className="border-dark-700 my-2" />
            <Link to="/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50">
              <User className="w-5 h-5" />
              <div>
                <span className="font-semibold">{user.name}</span>
                <div className="flex gap-2 text-xs text-dark-400"><span>Lv.{user.level}</span><span>{user.xp} XP</span></div>
              </div>
            </Link>
            <button onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full">
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
