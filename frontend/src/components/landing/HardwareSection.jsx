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
          <svg className="hw-svg" viewBox="0 0 1000 460" xmlns="http://www.w3.org/2000/svg" aria-label="To'plamning ochilgan ko'rinishi: detallar boshqaruv platasiga ulangan">
            <defs>
              <radialGradient id="hwcore" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#0c5e44"/><stop offset="1" stopColor="#042418"/></radialGradient>
              <radialGradient id="hwglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#19E3FF" stopOpacity=".35"/><stop offset="1" stopColor="#19E3FF" stopOpacity="0"/></radialGradient>
            </defs>
            <ellipse cx="500" cy="230" rx="220" ry="170" fill="url(#hwglow)"/>
            <g stroke="#19E3FF" strokeOpacity=".4" strokeWidth="1.6" strokeDasharray="4 6">
              <line x1="500" y1="230" x2="170" y2="90"/><line x1="500" y1="230" x2="830" y2="90"/>
              <line x1="500" y1="230" x2="120" y2="230"/><line x1="500" y1="230" x2="880" y2="230"/>
              <line x1="500" y1="230" x2="170" y2="370"/><line x1="500" y1="230" x2="830" y2="370"/>
            </g>
            <g><rect x="430" y="180" width="140" height="100" rx="12" fill="url(#hwcore)" stroke="#19E3FF" strokeWidth="2"/>
              <rect x="446" y="196" width="108" height="68" rx="6" fill="none" stroke="#19E3FF" strokeOpacity=".4"/>
              <circle cx="500" cy="230" r="20" fill="#19E3FF" opacity=".5"/>
              <text x="500" y="312" textAnchor="middle" fontFamily="Chakra Petch" fontSize="15" fill="#19E3FF" letterSpacing="2">BOSHQARUV PLATASI</text>
            </g>
            <g fontFamily="Chakra Petch" fontSize="13" fill="#cfe0f5">
              <g><rect x="110" y="62" width="120" height="44" rx="10" fill="#0b1120" stroke="#19E3FF" strokeOpacity=".4"/><circle cx="128" cy="84" r="5" fill="#19E3FF"/><text x="144" y="80">LED to'plami</text><text x="144" y="96" fill="#8294B4" fontSize="11">41 missiya</text></g>
              <g><rect x="770" y="62" width="120" height="44" rx="10" fill="#0b1120" stroke="#19E3FF" strokeOpacity=".4"/><circle cx="788" cy="84" r="5" fill="#19E3FF"/><text x="804" y="80">Servo motor</text><text x="804" y="96" fill="#8294B4" fontSize="11">23 missiya</text></g>
              <g><rect x="60" y="208" width="120" height="44" rx="10" fill="#0b1120" stroke="#19E3FF" strokeOpacity=".4"/><circle cx="78" cy="230" r="5" fill="#19E3FF"/><text x="94" y="226">Bredbord</text><text x="94" y="242" fill="#8294B4" fontSize="11">har missiyada</text></g>
              <g><rect x="820" y="208" width="130" height="44" rx="10" fill="#0b1120" stroke="#19E3FF" strokeOpacity=".4"/><circle cx="838" cy="230" r="5" fill="#19E3FF"/><text x="854" y="226">Ultratovush</text><text x="854" y="242" fill="#8294B4" fontSize="11">18 missiya</text></g>
              <g><rect x="110" y="350" width="120" height="44" rx="10" fill="#0b1120" stroke="#19E3FF" strokeOpacity=".4"/><circle cx="128" cy="372" r="5" fill="#19E3FF"/><text x="144" y="368">16×2 LCD</text><text x="144" y="384" fill="#8294B4" fontSize="11">12 missiya</text></g>
              <g><rect x="770" y="350" width="130" height="44" rx="10" fill="#0b1120" stroke="#19E3FF" strokeOpacity=".4"/><circle cx="788" cy="372" r="5" fill="#19E3FF"/><text x="804" y="368">Sensor + RGB</text><text x="804" y="384" fill="#8294B4" fontSize="11">30+ missiya</text></g>
            </g>
          </svg>
          <div className="hw-note">+ jumperlar, tugmalar, rezistorlar, zummer va USB kabel — 100+ missiya uchun hammasi.</div>
        </div>
      </div>
    </section>
  );
}
