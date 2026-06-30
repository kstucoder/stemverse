import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNav() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); }
  };

  const navLinks = [
    { href: '#missions',  label: "O'yinlar"   },
    { href: '#hardware',  label: "To'plam"    },
    { href: '#path',      label: "Ta'lim"     },
    { href: '#community', label: 'Hamjamiyat' },
    { href: '#faq',       label: 'Yordam'     },
  ];

  return (
    <>
      <header className={`nav${scrolled ? ' solid' : ''}`} id="nav">
        <div className="wrap">

          {/* Brand */}
          <a href="#top" className="brand" onClick={e => { e.preventDefault(); scrollTo('#top'); }}>
            <span className="brand-mark" />
            VOL<b>TRA</b>
          </a>

          {/* Desktop nav */}
          <nav className="menu">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={e => { e.preventDefault(); scrollTo(href); }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="nav-right">
            <Link to="/auth/login" className="login">Kirish</Link>
            <Link to="/activate" className="btn-activate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span className="lbl">Faollashtirish</span>
            </Link>
            <button
              className="icon-btn nav-toggle"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menyu"
            >
              {mobileOpen
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--nav-h)',
            left: 0, right: 0,
            zIndex: 190,
            background: 'rgba(4,6,14,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,238,255,0.1)',
            padding: '16px 18px 24px',
          }}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={e => { e.preventDefault(); scrollTo(href); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 8px',
                borderBottom: '1px solid rgba(0,238,255,0.05)',
                fontFamily: 'Chakra Petch, monospace',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(234,243,255,0.6)',
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <Link
              to="/auth/login"
              style={{
                flex: 1, textAlign: 'center', padding: '12px', borderRadius: 10,
                background: 'rgba(0,238,255,0.06)',
                border: '1px solid rgba(0,238,255,0.2)',
                fontFamily: 'Chakra Petch, monospace',
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--energy)', letterSpacing: '0.06em', textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Kirish
            </Link>
            <Link
              to="/auth/register"
              style={{
                flex: 1, textAlign: 'center', padding: '12px', borderRadius: 10,
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                fontFamily: 'Chakra Petch, monospace',
                fontSize: '0.82rem', fontWeight: 700,
                color: '#1a1300', letterSpacing: '0.06em', textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Boshlash ⚡
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
