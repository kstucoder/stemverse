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
        <div className="usb-strip reveal">
          <span className="node">🧩 Haqiqiy plata</span>
          <span className="wire"></span>
          <span className="node">🔌 USB kabel</span>
          <span className="wire"></span>
          <span className="node">💻 Kompyuter</span>
          <span className="wire"></span>
          <span className="node" style={{ borderColor: 'var(--energy)', color: '#fff' }}>🎮 Missiya jonli javob beradi</span>
        </div>
      </div>
    </section>
  );
}
