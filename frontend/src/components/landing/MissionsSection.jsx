export default function MissionsSection() {
  const scrollRail = (dir) => {
    const r = document.getElementById('rail-m');
    if (r) r.scrollBy({ left: r.clientWidth * 0.8 * dir, behavior: 'smooth' });
  };

  return (
    <section className="section-pad" id="missions">
      <div className="wrap head">
        <div><span className="eyebrow">🔥 Missiyalar kutubxonasi</span><h2>Missiyangni tanla</h2></div>
        <a href="#" className="link">Barcha 100 tasi →</a>
      </div>
      <div className="rail-wrap">
        <button className="rail-btn prev" onClick={() => scrollRail(-1)} aria-label="Oldingi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="rail-btn next" onClick={() => scrollRail(1)} aria-label="Keyingi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <div className="rail" id="rail-m">
          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 20% 0,#0a2a3d,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(25,227,255,.5),transparent 70%)'}}></div><div className="art-glyph">🏙️</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.01</span><span className="mcard-diff easy">Boshlovchi</span>
            <div className="mcard-body"><h3>Shaharni qutqar</h3><p>Tarmoq o'ldi. Birinchi LED'ni ula va quvvatni qaytar.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">LED</span><span className="chip">BTN</span></div><span className="mcard-reward">★ 120 XP</span><span className="t">⏱ 15daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 80% 10%,#23304f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(25,227,255,.45),transparent 70%)'}}></div><div className="art-glyph">🤖</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.02</span><span className="mcard-diff easy">Boshlovchi</span>
            <div className="mcard-body"><h3>Robot zavodi</h3><p>Konveyerni aylanuvchi servo va sensor bilan jonlantir.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">SERVO</span><span className="chip">US</span></div><span className="mcard-reward">★ 160 XP</span><span className="t">⏱ 22daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 30% 100%,#3a2a0f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,196,0,.4),transparent 70%)'}}></div><div className="art-glyph">🌉</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.03</span><span className="mcard-diff med">Tadqiqotchi</span>
            <div className="mcard-body"><h3>Ko'prikni qutqar</h3><p>Sinik ko'prikni servo bilan ko'tar — omon qolganlar o'tsin.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">SERVO</span><span className="chip">BTN</span></div><span className="mcard-reward">★ 220 XP</span><span className="t">⏱ 30daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 70% 0,#3a1510,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,122,44,.45),transparent 70%)'}}></div><div className="art-glyph">🔥</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.04</span><span className="mcard-diff med">Tadqiqotchi</span>
            <div className="mcard-body"><h3>Yong'in qutqaruvi</h3><p>Issiqlikni sez va tarqalmasdan oldin signal hamda sovutgichni yoq.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">TMP</span><span className="chip">FAN</span></div><span className="mcard-reward">★ 260 XP</span><span className="t">⏱ 35daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 50% 100%,#1a1f3d,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(120,140,255,.4),transparent 70%)'}}></div><div className="art-glyph">🛰️</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.05</span><span className="mcard-diff hard">Muhandis</span>
            <div className="mcard-body"><h3>Kosmik stansiya</h3><p>LCD'da kislorod ko'rsatkichini chiqar va ekipajni saqlab qol.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">LCD</span><span className="chip">POT</span></div><span className="mcard-reward">★ 320 XP</span><span className="t">⏱ 45daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 20% 10%,#0f3320,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(74,222,128,.4),transparent 70%)'}}></div><div className="art-glyph">🌱</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.06</span><span className="mcard-diff hard">Muhandis</span>
            <div className="mcard-body"><h3>Aqlli issiqxona</h3><p>Tuproq namligini o'qib, o'simlikni avtomatik sug'or.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">SOIL</span><span className="chip">PUMP</span></div><span className="mcard-reward">★ 360 XP</span><span className="t">⏱ 50daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 80% 80%,#3a1a0f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,122,44,.4),transparent 70%)'}}></div><div className="art-glyph">🪐</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.07</span><span className="mcard-diff hard">Muhandis</span>
            <div className="mcard-body"><h3>Mars koloniyasi</h3><p>Rover'ning to'siq sensorini qurib, qizil chang ichidan yo'l top.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">US</span><span className="chip">RGB</span></div><span className="mcard-reward">★ 400 XP</span><span className="t">⏱ 55daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 30% 0,#0f2d33,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(25,227,255,.45),transparent 70%)'}}></div><div className="art-glyph">🌊</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.08</span><span className="mcard-diff med">Tadqiqotchi</span>
            <div className="mcard-body"><h3>Okeanni tozalash</h3><p>Yig'uvchi qo'lni dasturlab, suvdan chiqindini saralab ko'tar.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">SERVO</span><span className="chip">IR</span></div><span className="mcard-reward">★ 280 XP</span><span className="t">⏱ 40daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 70% 20%,#1a1f3d,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(120,140,255,.4),transparent 70%)'}}></div><div className="art-glyph">🚁</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.09</span><span className="mcard-diff hard">Muhandis</span>
            <div className="mcard-body"><h3>Dron missiyasi</h3><p>Harakat sensori bilan to'dani kuzat va ushlash zummerini chal.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">PIR</span><span className="chip">BUZ</span></div><span className="mcard-reward">★ 380 XP</span><span className="t">⏱ 50daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 50% 100%,#3a2a0f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,196,0,.4),transparent 70%)'}}></div><div className="art-glyph">⚡</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.10</span><span className="mcard-diff hard">Usta</span>
            <div className="mcard-body"><h3>Elektrostansiya</h3><p>Reaktorni barqarorlashtir: haroratni jonli o'qib, sovutishni boshqar.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">TMP</span><span className="chip">LCD</span><span className="chip">FAN</span></div><span className="mcard-reward">★ 450 XP</span><span className="t">⏱ 60daq</span></div></div></article>
        </div>
      </div>
    </section>
  );
}
