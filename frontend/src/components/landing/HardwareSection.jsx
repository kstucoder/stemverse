export default function HardwareSection() {
  return (
    <section className="section-pad hw" id="hardware">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Haqiqiy jihoz</span>
          <h2>To'plamni och</h2>
          <p className="sub">Har bir missiya haqiqiy detallarni boshqaradi. Detal ustiga olib boring va u nechta missiyada ishlatilishini ko'ring.</p>
        </div>
        <div className="hw-stage glass reveal">
          <img
            src="/images/kit-exploded.jpeg"
            alt="VOLTRA to'plami ochiq — Arduino, sensorlar, LED, servo, breadboard va barcha komponentlar"
            className="hw-exploded-img"
          />
          <div className="hw-note">+ jumperlar, tugmalar, rezistorlar, zummer va USB kabel — 100+ missiya uchun hammasi.</div>
        </div>
      </div>
    </section>
  );
}
