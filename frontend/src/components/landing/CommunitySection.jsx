export default function CommunitySection() {
  return (
    <section className="section-pad" id="community">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow">O'yinchilar yaratgan</span>
            <h2>Hamjamiyat ijodlari</h2>
          </div>
          <a href="#" className="link">Galereyani ko'rish →</a>
        </div>
        <div className="comm-grid">
          {[
            { badge: 'Eng faol ijodkor', glyph: '🛰️', title: 'Mini ob-havo stansiyasi', by: 'Diyora, 13 yosh', cat: 'Aqlli dehqonchilik', likes: 214, comments: 38 },
            { badge: 'Hafta chempioni', glyph: '🤖', title: "Yo'l kuzatuvchi robot", by: 'Jasur, 14 yosh', cat: 'Robototexnika', likes: 389, comments: 71 },
            { badge: 'Tanlangan', glyph: '🏠', title: 'Avtomatik tungi chiroq', by: 'Malika, 11 yosh', cat: 'Aqlli uy', likes: 156, comments: 22 },
          ].map((p, i) => (
            <article key={i} className="cproj reveal">
              <div className="cproj-art" style={{ background: `radial-gradient(120% 120% at ${['20% 0','80% 0','50% 100%'][i]},${['#0a2a3d','#23304f','#2a0f33'][i]},#05101c)` }}>
                <span className="badge">{p.badge}</span>
                <span className="glyph">{p.glyph}</span>
              </div>
              <div className="cproj-body">
                <h3>{p.title}</h3>
                <div className="by">{p.by}</div>
                <div className="cproj-foot">
                  <button onClick={(e) => {
                    const btn = e.currentTarget;
                    const count = btn.querySelector('.c');
                    const heart = btn.querySelector('span:first-child');
                    btn.classList.toggle('liked');
                    if (btn.classList.contains('liked')) {
                      count.textContent = +count.textContent + 1;
                      heart.textContent = '♥';
                    } else {
                      count.textContent = +count.textContent - 1;
                      heart.textContent = '♡';
                    }
                  }}>
                    <span>♡</span> <span className="c">{p.likes}</span>
                  </button>
                  <button>💬 {p.comments}</button>
                  <span style={{ marginLeft: 'auto' }}>⚡ {p.cat}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
