export default function HowItWorks() {
  return (
    <section className="section-pad tint" id="how">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Qanday ishlaydi</span>
          <h2>Qutidan missiyagacha — 4 qadam</h2>
        </div>
        <div className="steps">
          <div className="step glass reveal">
            <div className="n">1</div>
            <h3>To'plamni xarid qil</h3>
            <p>VOLTRA to'plamini barcha haqiqiy detallari bilan buyurtma qil.</p>
          </div>
          <div className="step glass reveal">
            <div className="n">2</div>
            <h3>To'plamni faollashtir</h3>
            <p>Maxsus kodni bir marta kirit va barcha mos missiyalarni och.</p>
          </div>
          <div className="step glass reveal">
            <div className="n">3</div>
            <h3>Zanjirni yig'</h3>
            <p>Missiyaga amal qilib, haqiqiy LED, sensor va motorlarni bredbordga ula.</p>
          </div>
          <div className="step key glass reveal">
            <div className="n">4</div>
            <h3>Missiya jonlanadi</h3>
            <p>USB orqali ula — haqiqiy zanjiring ekrandagi o'yin dunyosini boshqaradi.</p>
          </div>
        </div>
        {/* Kit exploded view — "what's inside" visual */}
        <div className="kit-showcase reveal">
          <img
            src="/images/kit-exploded.jpeg"
            alt="VOLTRA to'plami ichidagi barcha komponentlar — Arduino, sensorlar, LED, servo, breadboard"
            className="kit-showcase-img"
          />
          <div className="kit-showcase-caption">
            <span>40+ haqiqiy komponent</span>
            <span className="dot" />
            <span>Arduino Uno R3</span>
            <span className="dot" />
            <span>Sensorlar · Servo · LED</span>
          </div>
        </div>

        <div className="usb-strip reveal">
          <span className="node">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M10 6h4M10 10h4M10 14h4"/></svg>
            Haqiqiy plata
          </span>
          <span className="wire"></span>
          <span className="node">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 2v6m0 0 3-3m-3 3-3-3"/><rect x="5" y="8" width="14" height="8" rx="1"/><path d="M8 16v3m4-3v3m4-3v3"/></svg>
            USB kabel
          </span>
          <span className="wire"></span>
          <span className="node">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Kompyuter
          </span>
          <span className="wire"></span>
          <span className="node" style={{ borderColor: 'var(--energy)', color: '#fff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--energy)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Missiya jonli javob beradi
          </span>
        </div>
      </div>
    </section>
  );
}
