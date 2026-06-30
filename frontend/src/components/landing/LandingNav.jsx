import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`nav${scrolled ? ' solid' : ''}`} id="nav">
      <div className="wrap">
        <a href="#top" className="brand">
          <span className="brand-mark"></span>VOL<b>TRA</b>
        </a>
        <nav className="menu">
          <a href="#top" onClick={(e) => { e.preventDefault(); scrollTo('#top'); }}>Bosh sahifa</a>
          <a href="#missions" onClick={(e) => { e.preventDefault(); scrollTo('#missions'); }}>O'yinlar</a>
          <a href="#hardware" onClick={(e) => { e.preventDefault(); scrollTo('#hardware'); }}>To'plam</a>
          <a href="#path" onClick={(e) => { e.preventDefault(); scrollTo('#path'); }}>Ta'lim</a>
          <a href="#community" onClick={(e) => { e.preventDefault(); scrollTo('#community'); }}>Hamjamiyat</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('#faq'); }}>Yordam</a>
        </nav>
        <div className="nav-right">
          <Link to="/auth/login" className="login">Kirish</Link>
          <Link to="/activate" className="btn-activate">
            <span className="ico">🔑</span>
            <span className="lbl">To'plamni faollashtirish</span>
          </Link>
          <button
            className="icon-btn nav-toggle"
            onClick={() => document.getElementById('missions')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Menyu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
