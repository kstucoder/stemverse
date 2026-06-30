import { Link } from 'react-router-dom';

export default function FinalCta() {
  return (
    <section className="finalcta">
      <div className="wrap">
        <h2>Shahar seni kutyapti.<br /><span className="blue">Quvvat berish</span> vaqti keldi.</h2>
        <p>VOLTRA to'plamini ol, kompyuterda kodni kirit va chiroqlarni qaytar — bittadan haqiqiy zanjir bilan.</p>
        <div className="price-chip">
          <span>VOLTRA to'plami</span> <b>$49</b> <s>$69</s> <span>· bepul yetkazib berish*</span>
        </div>
        <div className="guarantee">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z"/><path d="m9 12 2 2 4-4"/></svg>
            30 kun ichida qaytarish
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
            Xavfsiz to'lov
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/></svg>
            Bepul yetkazib berish
          </span>
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: 14, position: 'relative' }}>Boshlang'ich narx — cheklangan vaqt uchun.</p>
        <div className="hero-cta">
          <Link to="/activate" className="btn btn-amber" style={{ fontSize: '1rem' }}>
            <span className="ico">🔑</span> To'plamni faollashtirish
          </Link>
          <Link to="/auth/register" className="btn btn-primary">
            <span className="ico">▶</span> Sarguzashtni boshlash
          </Link>
        </div>
      </div>
    </section>
  );
}
