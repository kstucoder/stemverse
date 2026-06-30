import { useEffect, useState } from 'react';

export default function MobileModal() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handlers = [];
    document.querySelectorAll('[data-play]').forEach((btn) => {
      const handler = (e) => {
        e.preventDefault();
        const isMobile = window.matchMedia('(max-width: 1024px)').matches || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) setOpen(true);
      };
      btn.addEventListener('click', handler);
      handlers.push({ btn, handler });
    });
    return () => handlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
  }, []);

  const close = () => {
    setOpen(false);
    setSent(false);
  };

  const handleSend = () => {
    const input = document.getElementById('modalEmail');
    if (input && input.value && /.+@.+\..+/.test(input.value)) {
      setSent(true);
    } else if (input) {
      input.focus();
      input.style.borderColor = '#FF7A2C';
    }
  };

  if (!open) return null;

  return (
    <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal-card glass">
        <button className="modal-close" onClick={close} aria-label="Yopish">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <div className="mi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8M12 18v4"/>
          </svg>
        </div>
        <h3 id="modalTitle">Sarguzasht kompyuterda o'ynaladi</h3>
        <p>Missiyalar haqiqiy to'plamni USB orqali ishlatadi — buni telefon ishonchli bajara olmaydi. O'ynash uchun saytni noutbuk yoki kompyuterda oching.</p>
        {!sent ? (
          <>
            <div className="modal-form">
              <input type="email" id="modalEmail" placeholder="Email manzilingiz" aria-label="Email" />
              <button onClick={handleSend}>Havolani yubor</button>
            </div>
            <button className="modal-skip" onClick={close}>Telefonda ko'rishda davom etish</button>
          </>
        ) : (
          <div className="modal-ok" style={{ display: 'block' }}>✓ Tayyor — kompyuteringizda pochtangizni tekshiring.</div>
        )}
      </div>
    </div>
  );
}
