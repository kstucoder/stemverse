export default function LearningPath() {
  return (
    <section className="section-pad" id="path">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow">Daraja oshir</span>
            <h2>Muhandislik yo'ling</h2>
          </div>
        </div>
        <div className="path">
          <div className="lcard glass reveal" style={{ '--lc': '#4ade80' }}>
            <span className="lv">Daraja 01</span>
            <h3>Tadqiqotchi</h3>
            <p>Birinchi uchqunlar — LED, tugma va birinchi ishlaydigan zanjir.</p>
            <div className="lbar"><i data-w="100"></i></div>
            <span className="xp">0 – 500 XP</span>
          </div>
          <div className="lcard glass reveal" style={{ '--lc': '#19E3FF' }}>
            <span className="lv">Daraja 02</span>
            <h3>Ixtirochi</h3>
            <p>Sensor va motorlar — dunyoni yorug'lik, ovoz va harakatga javob bergiz.</p>
            <div className="lbar"><i data-w="62"></i></div>
            <span className="xp">500 – 1 800 XP</span>
          </div>
          <div className="lcard glass reveal" style={{ '--lc': '#FFC400' }}>
            <span className="lv">Daraja 03</span>
            <h3>Muhandis</h3>
            <p>Haqiqiy tizimlar — mantiq, displey va kodni birlashtirib missiyani yech.</p>
            <div className="lbar"><i data-w="30"></i></div>
            <span className="xp">1 800 – 4 000 XP</span>
          </div>
          <div className="lcard glass reveal" style={{ '--lc': '#FF7A2C' }}>
            <span className="lv">Daraja 04</span>
            <h3>Usta muhandis</h3>
            <p>O'z mashinangni ixtiro qilib, hamjamiyatga e'lon qil.</p>
            <div className="lbar"><i data-w="9"></i></div>
            <span className="xp">4 000+ XP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
