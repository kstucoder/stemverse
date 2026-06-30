import { Link } from 'react-router-dom';
import PosterSvg from './PosterSvg';

export default function HeroSection({ sceneRef }) {
  return (
    <section className="hero" id="top">
      {/* Background orb */}
      <div className="hero-orb" />

      <div className="wrap">
        {/* ─── Copy ─── */}
        <div className="hero-copy">

          {/* Eyebrow */}
          <div className="hero-tag">
            <span className="eyebrow">
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--energy)', boxShadow: '0 0 8px var(--energy)', animation: 'eyeBlink 3s steps(1) infinite' }} />
              Missiya — 00 · Quvvat ber
            </span>
          </div>

          {/* Headline */}
          <h1>
            Elektronika<br />
            <span className="strike">uy vazifasi emas.</span>
            <br />
            Bu —{' '}
            <span className="blue">sarguzasht.</span>
          </h1>

          {/* Sub */}
          <p className="sub">
            Haqiqiy zanjirlar yig'. Arduino'ni ula.{' '}
            <b>Shaharlarni qutqar.</b>{' '}
            Missiyalarni bajar. Muhandis bo'l — har bir uchqun bilan.
          </p>

          {/* CTAs */}
          <div className="hero-cta">
            <button className="btn btn-amber" data-buy>
              <span className="ico">🛒</span>
              To'plamni olish — $49
            </button>
            <Link to="/auth/register" className="btn btn-primary">
              <span className="ico">▶</span>
              Sarguzashtni boshlash
            </Link>
            <button className="btn btn-ghost">
              <span className="ico">🎥</span>
              Treyler
            </button>
          </div>

          {/* Trust pills */}
          <div className="hero-trust">
            <span className="t-pill"><b>★ 4.9</b> ota-ona bahosi</span>
            <span className="t-pill">20 ta o'yin missiyasi</span>
            <span className="t-pill">↩ 30 kun qaytarish</span>
            <span className="t-pill">🚚 Bepul yetkazish</span>
          </div>

          {/* Feature badges */}
          <div className="hero-badges" style={{ marginTop: 20 }}>
            {['Arduino Uno', 'Web Serial API', '20 ta dars', 'XP tizimi', 'Teacher panel'].map(tag => (
              <span key={tag}><i />{tag}</span>
            ))}
          </div>
        </div>

        {/* ─── Scene ─── */}
        <div className="scene" id="scene" ref={sceneRef}>
          <div className="poster-layer layer" data-depth="16">
            <PosterSvg />
          </div>
          <div className="floating-kit layer" data-depth="40">
            <div className="kit-box">
              <div className="kit-face front">VOLTRA TO'PLAMI</div>
              <div className="kit-face back">20+ MISSIYA</div>
              <div className="kit-face right">USB · ARDUINO</div>
              <div className="kit-face left">SENSORLAR</div>
            </div>
            <div className="kit-label">
              <b>VOLTRA to'plami</b>
              20+ interaktiv missiyani och
            </div>
            <Link to="/activate" className="kit-cta">Hozir faollashtir</Link>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="scroll-hint">
        <i />
        Pastga aylantiring
      </div>
    </section>
  );
}
