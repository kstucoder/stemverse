import { useState } from 'react';

export default function LandingFooter() {
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = () => {
    const input = document.getElementById('footerEmail');
    if (input && /.+@.+\..+/.test(input.value)) {
      setSubMsg("✅ Obuna bo'ldingiz — rahmat!");
      input.value = '';
    } else if (input) {
      input.focus();
      input.style.borderColor = '#FF7A2C';
      setSubMsg('');
    }
  };

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="#top" className="brand"><span className="brand-mark"></span>VOL<b>TRA</b></a>
            <p>Elektronika — uy vazifasi emas. Bu — sarguzasht. Haqiqiy zanjirlar yig', missiyalarni bajar, muhandis bo'l.</p>
            <div className="socials">
              <a href="#" aria-label="Discord" data-toast="🚀 Discord hamjamiyati tez orada!">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 19, height: 19 }}>
                  <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.8 1.9 12 12 0 0 0-9.2 0A13 13 0 0 1 13.2 4.4L13 4a17 17 0 0 0-4.3 1.3C5.6 9.3 4.8 13.2 5 17a17 17 0 0 0 5.2 2.6l.6-1a11 11 0 0 1-1.8-.9l.4-.3a12 12 0 0 0 10.2 0l.4.3a11 11 0 0 1-1.8.9l.6 1A17 17 0 0 0 19 17c.3-4.5-.6-8.4-2.7-11.7zM9.7 14.6c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7zm4.6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7z"/>
                </svg>
              </a>
              <a href="#" aria-label="Telegram" data-toast="🚀 Telegram kanali tez orada!">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 19, height: 19 }}>
                  <path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.2 13.1l-4.7-1.5c-1-.3-1-1 .2-1.5l18.4-7.1c.9-.3 1.6.2 1.8 1.3z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" data-toast="🚀 Instagram sahifasi tez orada!">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 19, height: 19 }}>
                  <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube" data-toast="🚀 YouTube kanali tez orada!">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 19, height: 19 }}>
                  <path d="M22 7.4a3 3 0 0 0-2-2C18 5 12 5 12 5s-6 0-8 .4a3 3 0 0 0-2 2A31 31 0 0 0 1.6 12 31 31 0 0 0 2 16.6a3 3 0 0 0 2 2C6 19 12 19 12 19s6 0 8-.4a3 3 0 0 0 2-2 31 31 0 0 0 .4-4.6 31 31 0 0 0-.4-4.6zM10 15V9l5 3z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="fcol">
            <h4>O'ynash</h4>
            <a href="#missions" onClick={(e) => { e.preventDefault(); document.querySelector('#missions')?.scrollIntoView({ behavior: 'smooth' }); }}>Missiyalar</a>
            <a href="#path" onClick={(e) => { e.preventDefault(); document.querySelector('#path')?.scrollIntoView({ behavior: 'smooth' }); }}>Ta'lim</a>
            <a href="#achievements" onClick={(e) => { e.preventDefault(); document.querySelector('#achievements')?.scrollIntoView({ behavior: 'smooth' }); }}>Reyting</a>
            <a href="#community" onClick={(e) => { e.preventDefault(); document.querySelector('#community')?.scrollIntoView({ behavior: 'smooth' }); }}>Hamjamiyat</a>
          </div>
          <div className="fcol">
            <h4>To'plam</h4>
            <a href="#hardware" onClick={(e) => { e.preventDefault(); document.querySelector('#hardware')?.scrollIntoView({ behavior: 'smooth' }); }}>VOLTRA to'plami</a>
            <a href="#hardware" onClick={(e) => { e.preventDefault(); document.querySelector('#hardware')?.scrollIntoView({ behavior: 'smooth' }); }}>Detallar</a>
            <a href="#how" onClick={(e) => { e.preventDefault(); document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' }); }}>Qanday ishlaydi</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' }); }}>Yordam</a>
          </div>
          <div className="fcol">
            <h4>Yangiliklar</h4>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', margin: '0 0 10px' }}>Yosh muhandislar uchun yangi missiyalar va maslahatlar.</p>
            <div className="news">
              <input type="email" id="footerEmail" placeholder="Email manzil" aria-label="Email" />
              <button onClick={handleSubscribe}>Qo'shilish</button>
            </div>
            {subMsg && <p style={{ color: 'var(--energy)', fontSize: '.82rem', margin: '8px 0 0' }}>{subMsg}</p>}
            <a href="#" style={{ marginTop: 14 }} data-toast="📄 Hujjatlar sahifasi tez orada!">Hujjatlar</a>
            <a href="#" data-toast="📄 Maxfiylik siyosati tez orada!">Maxfiylik</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 VOLTRA · Yosh muhandislar uchun</span>
          <span><a href="#" data-toast="📄 Maxfiylik siyosati tez orada!">Maxfiylik</a> · <a href="#" data-toast="📄 Foydalanish shartlari tez orada!">Shartlar</a> · <a href="#" onClick={(e) => { e.preventDefault(); document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' }); }}>Yordam</a></span>
        </div>
      </div>
    </footer>
  );
}
