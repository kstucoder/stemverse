export default function PosterSvg() {
  return (
    <svg className="poster-svg" viewBox="0 0 1000 1250" preserveAspectRatio="xMidYMid meet" aria-label="Yosh muhandis yonayotgan futuristik shahar fonida nurafshon platani ushlab turibdi, ortida ulkan himoyachi robot">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03040A"/>
          <stop offset="0.4" stopColor="#06112b"/>
          <stop offset="0.68" stopColor="#14264a"/>
          <stop offset="0.83" stopColor="#46243a"/>
          <stop offset="1" stopColor="#7a3018"/>
        </linearGradient>
        <radialGradient id="emberGlow" cx="0.5" cy="1" r="0.95">
          <stop offset="0" stopColor="#FFB02C" stopOpacity="0.7"/>
          <stop offset="0.35" stopColor="#FF6A2C" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#FF5A2C" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#E8FCFF"/>
          <stop offset="0.3" stopColor="#18E0FF"/>
          <stop offset="1" stopColor="#0A84FF" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#18E0FF" stopOpacity="1"/>
          <stop offset="0.5" stopColor="#18E0FF" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#18E0FF" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="bigGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0A84FF" stopOpacity="0.35"/>
          <stop offset="1" stopColor="#0A84FF" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="vig" cx="0.5" cy="0.4" r="0.78">
          <stop offset="0.45" stopColor="#000" stopOpacity="0"/>
          <stop offset="1" stopColor="#000" stopOpacity="0.72"/>
        </radialGradient>
        <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="soft2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
        <filter id="haze" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="24"/></filter>
      </defs>

      <rect width="1000" height="1250" fill="url(#sky)"/>
      <rect x="0" y="640" width="1000" height="610" fill="url(#emberGlow)"/>

      <g fill="#bfe6ff">
        <circle cx="120" cy="90" r="1.6" opacity=".7"/><circle cx="300" cy="60" r="1.1" opacity=".5"/>
        <circle cx="520" cy="120" r="1.4" opacity=".5"/><circle cx="780" cy="70" r="1.2" opacity=".5"/>
        <circle cx="900" cy="160" r="1.6" opacity=".7"/><circle cx="660" cy="40" r="1" opacity=".4"/>
        <circle cx="200" cy="180" r="1" opacity=".4"/><circle cx="430" cy="210" r="1.2" opacity=".5"/>
        <circle cx="60" cy="240" r="1.1" opacity=".4"/><circle cx="940" cy="300" r="1.2" opacity=".4"/>
      </g>

      <g stroke="#d6f6ff" strokeWidth="3.4" fill="none" filter="url(#soft2)" opacity=".95">
        <path d="M225,30 L208,140 L246,150 L214,300"/>
      </g>
      <g stroke="#a8e9ff" strokeWidth="2.2" fill="none" filter="url(#soft2)" opacity=".75">
        <path d="M840,24 L824,118 L856,128 L834,236"/>
      </g>

      <g fill="#0a1426">
        <rect x="20" y="560" width="74" height="500"/>
        <rect x="104" y="490" width="54" height="570"/>
        <rect x="168" y="610" width="86" height="450"/>
        <rect x="746" y="540" width="68" height="520"/>
        <rect x="820" y="600" width="50" height="460"/>
        <rect x="876" y="500" width="92" height="560"/>
      </g>
      <g fill="#0b1730">
        <path d="M268,724 q44,-150 88,0 z"/><rect x="268" y="718" width="88" height="342"/>
        <rect x="306" y="640" width="12" height="84"/>
        <path d="M648,700 q50,-160 100,0 z"/><rect x="648" y="694" width="100" height="366"/>
        <rect x="692" y="610" width="12" height="90"/>
      </g>
      <g fill="#FFA13C" opacity=".85">
        <rect x="40" y="600" width="9" height="11"/><rect x="64" y="650" width="9" height="11"/>
        <rect x="120" y="540" width="9" height="11"/><rect x="135" y="610" width="9" height="11"/>
        <rect x="894" y="540" width="9" height="11"/><rect x="922" y="610" width="9" height="11"/>
        <rect x="762" y="580" width="9" height="11"/><rect x="788" y="640" width="9" height="11"/>
        <rect x="190" y="650" width="9" height="11"/>
      </g>

      <g fill="#191d2c" opacity=".42" filter="url(#haze)">
        <ellipse cx="130" cy="500" rx="140" ry="120"/>
        <ellipse cx="730" cy="480" rx="160" ry="140"/>
        <ellipse cx="470" cy="560" rx="200" ry="110"/>
      </g>
      <path d="M522,660 L300,300 L420,300 Z" fill="#18E0FF" opacity=".06" filter="url(#soft)"/>
      <path d="M522,660 L700,300 L580,300 Z" fill="#18E0FF" opacity=".06" filter="url(#soft)"/>

      <g>
        <ellipse cx="520" cy="640" rx="300" ry="360" fill="url(#bigGlow)" filter="url(#haze)"/>
        <g fill="#0c1a32" stroke="#18E0FF" strokeOpacity=".28" strokeWidth="2.4">
          <rect x="430" y="860" width="52" height="210" rx="16"/>
          <rect x="560" y="860" width="52" height="210" rx="16"/>
          <path d="M408,560 q114,-50 228,0 l30,300 q-144,52 -288,0 z"/>
          <rect x="350" y="582" width="60" height="250" rx="26"/>
          <rect x="634" y="582" width="60" height="250" rx="26"/>
          <path d="M392,560 q128,-66 256,0 l-12,40 q-116,-50 -232,0 z"/>
          <path d="M468,478 L466,432 L488,400 L556,400 L578,432 L576,478 q-54,30 -108,0 z"/>
          <path d="M506,400 L538,400 L522,366 z"/>
          <rect x="448" y="430" width="18" height="40" rx="6"/>
          <rect x="578" y="430" width="18" height="40" rx="6"/>
        </g>
        <path d="M474,448 L518,442 L518,452 L474,456 z" fill="#0a1426"/>
        <path d="M570,448 L526,442 L526,452 L570,456 z" fill="#0a1426"/>
        <g className="pf-eyes"><path d="M480,458 L512,452 L512,468 L480,470 z" fill="#18E0FF"/>
        <path d="M564,458 L532,452 L532,468 L564,470 z" fill="#18E0FF"/>
        <circle cx="496" cy="462" r="20" fill="#18E0FF" opacity=".4" filter="url(#soft2)"/>
        <circle cx="548" cy="462" r="20" fill="#18E0FF" opacity=".4" filter="url(#soft2)"/></g>
        <g className="pf-core"><circle cx="522" cy="660" r="96" fill="url(#coreGlow)"/>
        <circle cx="522" cy="660" r="34" fill="#E8FCFF"/>
        <circle cx="522" cy="660" r="50" fill="none" stroke="#18E0FF" strokeWidth="3" opacity=".7"/></g>
      </g>

      <g fill="#0c1a32" stroke="#18E0FF" strokeOpacity=".4">
        <g className="pf-drone" transform="translate(150,300)"><rect x="-28" y="-9" width="56" height="18" rx="9"/><circle cx="0" cy="0" r="4.4" fill="#FF5A2C" stroke="none"/></g>
        <g className="pf-drone" style={{animationDelay:'.6s'}} transform="translate(335,235)"><rect x="-22" y="-7" width="44" height="14" rx="7"/><circle cx="0" cy="0" r="3.4" fill="#FF5A2C" stroke="none"/></g>
        <g className="pf-drone" style={{animationDelay:'1.1s'}} transform="translate(855,330)"><rect x="-25" y="-8" width="50" height="16" rx="8"/><circle cx="0" cy="0" r="3.8" fill="#FF5A2C" stroke="none"/></g>
        <g className="pf-drone" style={{animationDelay:'1.6s'}} transform="translate(740,205)"><rect x="-20" y="-6" width="40" height="12" rx="6"/><circle cx="0" cy="0" r="3" fill="#FF5A2C" stroke="none"/></g>
      </g>

      <path d="M0,1050 L1000,1050 L1000,1250 L0,1250 Z" fill="#04070F"/>
      <rect x="0" y="1050" width="1000" height="6" fill="#18E0FF" opacity=".22"/>
      <rect x="496" y="1056" width="52" height="120" fill="#18E0FF" opacity=".1" filter="url(#soft)"/>
      <g fill="#0a1020">
        <path d="M120,1050 l44,-30 l32,30 z"/><path d="M840,1050 l52,-32 l38,32 z"/>
        <path d="M300,1050 l26,-18 l22,18 z"/><path d="M700,1050 l30,-20 l24,20 z"/>
      </g>

      <rect className="pf-beam" x="494" y="600" width="56" height="290" rx="28" fill="url(#beam)" filter="url(#soft)" opacity=".9"/>
      <rect x="512" y="610" width="18" height="270" fill="#E8FCFF" opacity=".85"/>
      <g stroke="#18E0FF" strokeWidth="2.4" fill="none" opacity=".6" filter="url(#soft2)">
        <path d="M522,820 q-50,-30 -70,-90"/>
        <path d="M522,820 q50,-30 70,-90"/>
        <path d="M522,760 q-34,-20 -40,-70"/>
        <path d="M522,760 q34,-20 40,-70"/>
      </g>

      <g fill="#04070E">
        <path d="M484,1050 l6,-150 l24,0 l3,150 z"/>
        <path d="M520,1050 l3,-150 l24,0 l6,150 z"/>
        <path d="M480,768 q42,-24 92,0 l-8,140 q-38,16 -76,0 z"/>
        <circle cx="518" cy="734" r="34"/>
        <path d="M484,792 q-26,16 -28,70 l18,4 q6,-44 26,-58 z"/>
        <path d="M572,792 q26,16 28,70 l-18,4 q-6,-44 -26,-58 z"/>
      </g>
      <g transform="translate(518,882)">
        <circle cx="0" cy="-2" r="52" fill="#18E0FF" opacity=".5" filter="url(#soft)"/>
        <rect x="-48" y="-30" width="96" height="58" rx="9" fill="#0c4e3a" stroke="#18E0FF" strokeWidth="2.4"/>
        <g fill="#18E0FF" opacity=".9"><rect x="-40" y="-22" width="6" height="6"/><rect x="-28" y="-22" width="6" height="6"/><rect x="32" y="-22" width="6" height="6"/><rect x="-40" y="14" width="6" height="6"/></g>
        <circle cx="0" cy="-1" r="9" fill="#E8FCFF"/>
      </g>
      <g stroke="#18E0FF" strokeWidth="3.2" fill="none" opacity=".85" filter="url(#soft2)">
        <path d="M486,706 q-3,46 -8,92"/>
        <path d="M550,706 q3,46 8,92"/>
        <path d="M495,712 a30 30 0 0 1 46 0" opacity=".5"/>
      </g>

      <g fill="#FFA13C">
        <circle cx="360" cy="900" r="2.6" opacity=".85"/><circle cx="660" cy="940" r="2.2" opacity=".7"/>
        <circle cx="300" cy="800" r="1.8" opacity=".6"/><circle cx="740" cy="820" r="2.4" opacity=".7"/>
        <circle cx="420" cy="980" r="1.8" opacity=".6"/><circle cx="600" cy="1000" r="1.6" opacity=".55"/>
      </g>
      <g fill="#a8e9ff">
        <circle cx="470" cy="600" r="2.2" opacity=".85"/><circle cx="572" cy="540" r="1.8" opacity=".7"/>
        <circle cx="452" cy="700" r="1.6" opacity=".6"/><circle cx="590" cy="700" r="1.6" opacity=".6"/>
      </g>

      <rect width="1000" height="1250" fill="url(#vig)"/>
    </svg>
  );
}
