export default function MissionsSection() {
  const scrollRail = (dir) => {
    const r = document.getElementById('rail-m');
    if (r) r.scrollBy({ left: r.clientWidth * 0.8 * dir, behavior: 'smooth' });
  };

  return (
    <section className="section-pad" id="missions">
      <div className="wrap head">
        <div><span className="eyebrow">Missiyalar kutubxonasi</span><h2>Missiyangni tanla</h2></div>
        <a href="#" className="link">Barcha 20 tasi →</a>
      </div>
      <div className="rail-wrap">
        <button className="rail-btn prev" onClick={() => scrollRail(-1)} aria-label="Oldingi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="rail-btn next" onClick={() => scrollRail(1)} aria-label="Keyingi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <div className="rail" id="rail-m">
          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 20% 0,#0a2a3d,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(25,227,255,.5),transparent 70%)'}}></div><div className="art-glyph">💡</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.01</span><span className="mcard-diff easy">Tadqiqotchi</span>
            <div className="mcard-body"><h3>LEDni Yondirish</h3><p>Arduino bilan birinchi LEDingizni yoqing — ilk ishlaydigan sxemangiz.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">LED</span><span className="chip">RESISTOR</span></div><span className="mcard-reward">★ 50 XP</span><span className="t">⏱ 10daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 80% 10%,#3a2a0f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,196,0,.45),transparent 70%)'}}></div><div className="art-glyph">🚦</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.02</span><span className="mcard-diff easy">Tadqiqotchi</span>
            <div className="mcard-body"><h3>Svetafor Boshqaruvi</h3><p>3 xil LED bilan svetafor yasang va transport oqimini boshqaring.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">3×LED</span><span className="chip">BTN</span></div><span className="mcard-reward">★ 75 XP</span><span className="t">⏱ 12daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 30% 100%,#2a0f33,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(204,122,255,.4),transparent 70%)'}}></div><div className="art-glyph">🎨</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.03</span><span className="mcard-diff easy">Tadqiqotchi</span>
            <div className="mcard-body"><h3>RGB Ranglar Sehri</h3><p>3 potensiometr bilan RGB LEDni boshqarib, ranglarni aralashtiring.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">RGB</span><span className="chip">3×POT</span></div><span className="mcard-reward">★ 100 XP</span><span className="t">⏱ 15daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 70% 0,#3a1510,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,122,44,.45),transparent 70%)'}}></div><div className="art-glyph">✨</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.04</span><span className="mcard-diff easy">Tadqiqotchi</span>
            <div className="mcard-body"><h3>Yorug'lik Shousi</h3><p>4 LED va tugma yordamida ajoyib yorug'lik patternlarini yarating.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">4×LED</span><span className="chip">BTN</span></div><span className="mcard-reward">★ 100 XP</span><span className="t">⏱ 15daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 50% 100%,#1a1f3d,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(120,140,255,.4),transparent 70%)'}}></div><div className="art-glyph">🔐</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.05</span><span className="mcard-diff easy">Tadqiqotchi</span>
            <div className="mcard-body"><h3>Maxfiy Kodli Eshik</h3><p>Tugma ketma-ketligi va LED yordamida maxfiy kodli qulf yarating.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">BTN</span><span className="chip">BUZ</span></div><span className="mcard-reward">★ 125 XP</span><span className="t">⏱ 18daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 20% 10%,#0f3320,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(74,222,128,.4),transparent 70%)'}}></div><div className="art-glyph">🏃</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.06</span><span className="mcard-diff med">Ixtirochi</span>
            <div className="mcard-body"><h3>Tezlik Poygasi</h3><p>Potensiometr bilan yuguruvchini boshqaring — tugma bilan sakrating.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">POT</span><span className="chip">BTN</span></div><span className="mcard-reward">★ 150 XP</span><span className="t">⏱ 20daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 30% 0,#0f2d33,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(25,227,255,.45),transparent 70%)'}}></div><div className="art-glyph">🎵</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.07</span><span className="mcard-diff med">Ixtirochi</span>
            <div className="mcard-body"><h3>Yorug'lik Theremini</h3><p>LDR sensor yordamida yorug'lik bilan musiqa yarating.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">LDR</span><span className="chip">BUZ</span></div><span className="mcard-reward">★ 150 XP</span><span className="t">⏱ 20daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 70% 20%,#0f3320,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(74,222,128,.4),transparent 70%)'}}></div><div className="art-glyph">🌱</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.08</span><span className="mcard-diff med">Ixtirochi</span>
            <div className="mcard-body"><h3>Harorat Bog'i</h3><p>Haroratni kuzating va virtual bog'ingizni sog'lom saqlang.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">TEMP</span><span className="chip">3×LED</span></div><span className="mcard-reward">★ 175 XP</span><span className="t">⏱ 22daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 80% 80%,#23304f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(120,140,255,.4),transparent 70%)'}}></div><div className="art-glyph">📡</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.09</span><span className="mcard-diff med">Ixtirochi</span>
            <div className="mcard-body"><h3>Masofa Radari</h3><p>Ultrasonic sensor yordamida masofani aniqlang va o'lchang.</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">US</span><span className="chip">4×LED</span></div><span className="mcard-reward">★ 175 XP</span><span className="t">⏱ 22daq</span></div></div></article>

          <article className="mcard"><div className="mcard-art" style={{background: 'radial-gradient(120% 120% at 50% 100%,#3a2a0f,#05101c)'}}><div className="art-grid"></div><div className="art-orb" style={{background: 'radial-gradient(circle,rgba(255,196,0,.4),transparent 70%)'}}></div><div className="art-glyph">⚡</div></div><div className="mcard-grad"></div>
            <span className="mcard-num">M.10</span><span className="mcard-diff med">Ixtirochi</span>
            <div className="mcard-body"><h3>Reaksiya Chempioni</h3><p>Ikki o'yinchili reaksiya o'yini — kim birinchi bosadi?</p>
            <div className="mcard-meta"><div className="chips"><span className="chip">2×BTN</span><span className="chip">BUZ</span></div><span className="mcard-reward">★ 200 XP</span><span className="t">⏱ 25daq</span></div></div></article>
        </div>
      </div>
    </section>
  );
}
