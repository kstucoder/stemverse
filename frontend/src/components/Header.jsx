import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, User, LogOut, Trophy, BookOpen, LayoutDashboard, Menu, X, School, ShoppingCart, Key } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  const isAdmin = user.role === 'ADMIN';

  const navItems = isAdmin
    ? [
        { to: '/admin', icon: LayoutDashboard, label: 'Panel' },
        { to: '/admin/orders', icon: ShoppingCart, label: 'Buyurtmalar' },
        { to: '/admin/lessons', icon: BookOpen, label: 'Darslar' },
        { to: '/admin/codes', icon: Key, label: 'Kodlar' },
      ]
    : [
        { to: '/dashboard',   icon: LayoutDashboard, label: 'Bosh sahifa' },
        { to: '/lessons',     icon: BookOpen,         label: 'Missiyalar'   },
        { to: '/achievements',icon: Trophy,           label: 'Yutuqlar'     },
      ];
  if (user.role === 'TEACHER')
    navItems.push({ to: '/teacher', icon: School, label: "O'qituvchi" });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const xpInLevel = (user.xp || 0) - ((user.level || 1) * 200 - 200);
  const levelProgress = Math.min((xpInLevel / 200) * 100, 100);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: 'var(--nav-h)',
          background: 'rgba(4,6,14,0.85)',
          backdropFilter: 'blur(20px) saturate(130%)',
          WebkitBackdropFilter: 'blur(20px) saturate(130%)',
          borderBottom: '1px solid rgba(0,238,255,0.08)',
          boxShadow: '0 1px 0 rgba(0,238,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-6">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(145deg, #0b3a4a, #04202e)',
                border: '1.5px solid rgba(0,238,255,0.5)',
                boxShadow: '0 0 16px rgba(0,238,255,0.3)',
              }}
            >
              <div
                className="absolute inset-2 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(0,238,255,0.6), transparent 70%)' }}
              />
              <Zap className="w-4 h-4 text-white relative z-10" />
            </div>
            <span
              className="hidden sm:block font-game text-base tracking-wider"
              style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.9rem' }}
            >
              <span className="text-white">VOL</span>
              <span style={{ color: 'var(--cyan)', textShadow: '0 0 8px rgba(0,238,255,0.6)' }}>TRA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">

            {/* XP / Level pill — desktop (faqat student/teacher) */}
            {!isAdmin && (
              <div
                className="hidden sm:flex flex-col items-end pr-3 border-r"
                style={{ borderColor: 'rgba(0,238,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-ui text-xs font-semibold tracking-widest uppercase"
                    style={{ color: 'var(--cyan)', fontFamily: 'Chakra Petch, monospace' }}
                  >
                    LV.{user.level}
                  </span>
                  <span
                    className="font-ui text-xs font-semibold tracking-widest uppercase"
                    style={{ color: '#00FF88', fontFamily: 'Chakra Petch, monospace' }}
                  >
                    {user.xp} XP
                  </span>
                </div>
                <div className="xp-bar w-24">
                  <div className="xp-bar-fill" style={{ width: `${levelProgress}%` }} />
                </div>
              </div>
            )}

            {/* Avatar */}
            <Link
              to="/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(0,238,255,0.05)', border: '1px solid rgba(0,238,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,238,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,238,255,0.05)'; }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--cyan) 0%, #9B5DE5 100%)' }}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span
                className="hidden sm:block text-sm font-medium text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {user.name?.split(' ')[0]}
              </span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(234,243,255,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FF2D78'; e.currentTarget.style.background = 'rgba(255,45,120,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(234,243,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
              title="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-all"
              style={{ color: 'rgba(234,243,255,0.5)', border: '1px solid rgba(0,238,255,0.1)' }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 'var(--nav-h)' }} />

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 z-40 md:hidden animate-slide-down"
          style={{
            top: 'var(--nav-h)',
            background: 'rgba(4,6,14,0.98)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(0,238,255,0.08)',
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.to) ? 'active' : ''}`}
                style={{
                  fontFamily: 'Chakra Petch, monospace',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive(item.to) ? 'var(--cyan)' : 'rgba(234,243,255,0.5)',
                  background: isActive(item.to) ? 'rgba(0,238,255,0.06)' : 'transparent',
                }}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}

            <div style={{ height: 1, background: 'rgba(0,238,255,0.06)', margin: '8px 0' }} />

            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={{ color: 'rgba(234,243,255,0.5)' }}
            >
              <User className="w-4 h-4" />
                  <div>
                    <div className="text-white text-sm font-semibold" style={{ fontFamily: 'DM Sans' }}>{user.name}</div>
                    {!isAdmin && (
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--cyan)', fontFamily: 'Chakra Petch, monospace' }}
                      >
                        Lv.{user.level} · {user.xp} XP
                      </div>
                    )}
                  </div>
            </Link>

            <button
              onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all"
              style={{ color: '#FF2D78' }}
            >
              <LogOut className="w-4 h-4" />
              <span
                style={{ fontFamily: 'Chakra Petch, monospace', fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}
              >
                Chiqish
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
