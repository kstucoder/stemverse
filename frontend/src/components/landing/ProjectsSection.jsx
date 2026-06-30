export default function ProjectsSection() {
  return (
    <section className="section-pad" id="projects">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow">Haqiqatda qur</span>
            <h2>Loyihalar ko'rgazmasi</h2>
          </div>
          <a href="#" className="link">Barcha loyihalar →</a>
        </div>
        <div className="proj-grid">
          {[
            { glyph: '🚦', title: 'Svetofor', tag: 'LED · Mantiq', bg: 'radial-gradient(120% 120% at 30% 0,#3a2a0f,#05101c)' },
            { glyph: '🦾', title: "Robot qo'l", tag: 'Servo · Boshqaruv', bg: 'radial-gradient(120% 120% at 70% 0,#0f2d33,#05101c)' },
            { glyph: '🏠', title: 'Aqlli uy', tag: 'Sensor · Rele', bg: 'radial-gradient(120% 120% at 30% 100%,#1a1f3d,#05101c)' },
            { glyph: '⛅', title: "Ob-havo stansiyasi", tag: 'Harorat · LCD', bg: 'radial-gradient(120% 120% at 70% 100%,#0a2a3d,#05101c)' },
            { glyph: '🌱', title: 'Issiqxona', tag: 'Tuproq · Nasos', bg: 'radial-gradient(120% 120% at 30% 0,#0f3320,#05101c)' },
            { glyph: '🚨', title: 'Signalizatsiya', tag: 'PIR · Zummer', bg: 'radial-gradient(120% 120% at 70% 0,#3a1510,#05101c)' },
            { glyph: '🚗', title: 'Robot mashina', tag: 'Motor · Ultratovush', bg: 'radial-gradient(120% 120% at 30% 100%,#23304f,#05101c)' },
            { glyph: '🎛️', title: "O'zing qur", tag: 'Erkin rejim', bg: 'radial-gradient(120% 120% at 70% 100%,#2a0f33,#05101c)' },
          ].map((p, i) => (
            <div key={i} className="prj reveal">
              <div className="prj-art" style={{ background: p.bg }}><span className="glyph">{p.glyph}</span></div>
              <div className="prj-body"><h3>{p.title}</h3><span>{p.tag}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
