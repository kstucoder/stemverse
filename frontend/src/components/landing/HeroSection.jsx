import { Link } from 'react-router-dom';
import PosterSvg from './PosterSvg';

export default function HeroSection({ sceneRef }) {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-copy">
          <div className="hero-tag">
            <span className="eyebrow">Missiya 00 · Quvvat ber</span>
          </div>
          <h1>
            Elektronika<br />
            <span className="strike">uy vazifasi emas.</span>
            <br />Bu — <span className="blue">sarguzasht.</span>
          </h1>
          <p className="sub">
            Haqiqiy zanjirlar yig'. Platangni ula. <b>Shaharlarni qutqar.</b>{' '}
            Missiyalarni bajar. Muhandis bo'l — har bir uchqun bilan.
          </p>
          <div className="hero-cta">
            <button className="btn btn-amber" style={{ fontSize: '1rem' }} data-buy>
              <span className="ico">🛒</span> To'plamni olish — $49
            </button>
            <Link to="/auth/register" className="btn btn-primary">
              <span className="ico">▶</span> Sarguzashtni boshlash
            </Link>
            <button className="btn btn-ghost">
              <span className="ico">🎥</span> Treyler
            </button>
          </div>
          <div className="hero-trust">
            <span className="t-pill"><b>★ 4.9</b> ota-ona bahosi</span>
            <span className="t-pill">100+ missiya</span>
            <span className="t-pill">↩ 30 kun ichida qaytarish</span>
            <span className="t-pill">🚚 Bepul yetkazib berish</span>
          </div>
        </div>
        <div className="scene" id="scene" ref={sceneRef}>
          <div className="poster-layer layer" data-depth="16">
            <PosterSvg />
          </div>
          <div className="floating-kit layer" data-depth="40">
            <div className="kit-box">
              <div className="kit-face front">VOLTRA TO'PLAMI</div>
              <div className="kit-face back">100+ MISSIYA</div>
              <div className="kit-face right">USB · PLATA</div>
              <div className="kit-face left">SENSORLAR</div>
            </div>
            <div className="kit-label">
              <b>VOLTRA to'plami</b>100+ interaktiv missiyani och
            </div>
            <Link to="/activate" className="kit-cta">Hozir faollashtir</Link>
          </div>
        </div>
      </div>
      <div className="scroll-hint"><i></i>Pastga aylantiring</div>
    </section>
  );
}
