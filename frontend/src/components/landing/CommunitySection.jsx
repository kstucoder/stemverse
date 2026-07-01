export default function CommunitySection() {
  return (
    <section
      className="section-pad"
      id="community"
      style={{ backgroundImage: 'url(/images/community.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
    >
      <div className="comm-overlay" />
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="head">
          <div>
            <span className="eyebrow">O'yinchilar yaratgan</span>
            <h2>Hamjamiyat ijodlari</h2>
          </div>
          <a href="#" className="link" data-toast="🖼️ Galereya tez orada ochiladi!">Galereyani ko'rish →</a>
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
                  <button
                    aria-label={`Yoqtirish — ${p.likes}`}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      const count = btn.querySelector('.c');
                      btn.classList.toggle('liked');
                      count.textContent = btn.classList.contains('liked')
                        ? +count.textContent + 1
                        : +count.textContent - 1;
                      btn.setAttribute('aria-label', `Yoqtirish — ${count.textContent}`);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span className="c">{p.likes}</span>
                  </button>
                  <button aria-label={`Izohlar — ${p.comments}`} data-toast="💬 Izohlar tez orada ochiladi!">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {p.comments}
                  </button>
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--energy)" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    {p.cat}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

