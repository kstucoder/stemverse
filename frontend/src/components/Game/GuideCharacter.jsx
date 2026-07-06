// GuideCharacter — "Electra" ⚡ yo'l ko'rsatuvchi personaj.
// SVG bilan chizilgan uchuvchi uchqun-robot: emotsiyalar (normal / worried /
// excited), suzish va ko'z pirpiratish animatsiyalari. Barcha o'yinlarda
// hikoyani aytib beruvchi sifatida qayta ishlatiladi.

const EYE = {
  normal: { ry: 5, browRot: 0, browY: -3 },
  worried: { ry: 4.2, browRot: 14, browY: -5 },
  excited: { ry: 6.2, browRot: -8, browY: -4 },
};

const MOUTH = {
  normal: 'M52 79 Q60 84 68 79',
  worried: 'M53 82 Q60 78 67 82',
  excited: 'M50 77 Q60 89 70 77',
};

export default function GuideCharacter({ emotion = 'normal', size = 120, float = true }) {
  const e = EYE[emotion] || EYE.normal;
  const mouth = MOUTH[emotion] || MOUTH.normal;

  return (
    <div style={{ width: size, height: size * 1.08, animation: float ? 'guideFloat 3s ease-in-out infinite' : 'none', filter: 'drop-shadow(0 6px 14px rgba(255,215,0,0.25))' }}>
      <style>{`
        @keyframes guideFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes guideBlink { 0%, 90%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } }
        @keyframes guideBoltPulse { 0%,100% { opacity: 0.85; } 50% { opacity: 1; filter: drop-shadow(0 0 6px #FFD700); } }
        @keyframes guideWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-18deg); } }
      `}</style>
      <svg viewBox="0 0 120 130" width="100%" height="100%">
        <defs>
          <radialGradient id="gGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,215,0,0.35)" />
            <stop offset="100%" stopColor="rgba(255,215,0,0)" />
          </radialGradient>
          <radialGradient id="gBody" cx="42%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="55%" stopColor="#FFC700" />
            <stop offset="100%" stopColor="#E89400" />
          </radialGradient>
          <linearGradient id="gFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E1730" />
            <stop offset="100%" stopColor="#080D1C" />
          </linearGradient>
        </defs>

        {/* orqa nur */}
        <circle cx="60" cy="66" r="54" fill="url(#gGlow)" />

        {/* antenna — chaqmoq belgisi */}
        <g style={{ animation: 'guideBoltPulse 1.8s ease-in-out infinite' }}>
          <path d="M63 4 L52 22 L60 21 L51 38 L66 18 L58 19 Z" fill="#FFD700" stroke="#FFF3B0" strokeWidth="0.8" />
        </g>

        {/* qo'llar */}
        {emotion === 'excited' ? (
          <>
            <g style={{ animation: 'guideWave 0.8s ease-in-out infinite', transformOrigin: '99px 62px' }}>
              <circle cx="104" cy="48" r="7" fill="#FFC700" stroke="#E89400" strokeWidth="1.5" />
            </g>
            <circle cx="17" cy="82" r="7" fill="#FFC700" stroke="#E89400" strokeWidth="1.5" />
          </>
        ) : emotion === 'worried' ? (
          <>
            <circle cx="26" cy="58" r="7" fill="#FFC700" stroke="#E89400" strokeWidth="1.5" />
            <circle cx="94" cy="58" r="7" fill="#FFC700" stroke="#E89400" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <circle cx="19" cy="80" r="7" fill="#FFC700" stroke="#E89400" strokeWidth="1.5" />
            <circle cx="101" cy="80" r="7" fill="#FFC700" stroke="#E89400" strokeWidth="1.5" />
          </>
        )}

        {/* tana */}
        <circle cx="60" cy="68" r="40" fill="url(#gBody)" stroke="#FFB700" strokeWidth="2" />
        {/* tana ustidagi yaltiroq */}
        <ellipse cx="46" cy="48" rx="14" ry="8" fill="rgba(255,255,255,0.35)" transform="rotate(-24 46 48)" />

        {/* yuz paneli */}
        <rect x="31" y="50" width="58" height="38" rx="17" fill="url(#gFace)" stroke="rgba(0,238,255,0.25)" strokeWidth="1" />

        {/* ko'zlar */}
        <g style={{ animation: 'guideBlink 3.4s infinite', transformOrigin: '60px 66px' }}>
          <ellipse cx="48" cy="66" rx="5" ry={e.ry} fill="#00EEFF" />
          <ellipse cx="72" cy="66" rx="5" ry={e.ry} fill="#00EEFF" />
          <circle cx="49.5" cy="63.5" r="1.6" fill="#EAF3FF" />
          <circle cx="73.5" cy="63.5" r="1.6" fill="#EAF3FF" />
          {emotion === 'excited' && (
            <>
              <circle cx="46" cy="68.5" r="1" fill="#EAF3FF" opacity="0.8" />
              <circle cx="70" cy="68.5" r="1" fill="#EAF3FF" opacity="0.8" />
            </>
          )}
        </g>

        {/* qoshlar */}
        <rect x="42" y={60 + e.browY} width="12" height="2" rx="1" fill="#00EEFF" opacity="0.7" transform={`rotate(${e.browRot} 48 ${60 + e.browY})`} />
        <rect x="66" y={60 + e.browY} width="12" height="2" rx="1" fill="#00EEFF" opacity="0.7" transform={`rotate(${-e.browRot} 72 ${60 + e.browY})`} />

        {/* og'iz */}
        <path d={mouth} stroke="#00EEFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />

        {/* yonoqlar (excited) */}
        {emotion === 'excited' && (
          <>
            <circle cx="38" cy="74" r="3.4" fill="#FF2D78" opacity="0.4" />
            <circle cx="82" cy="74" r="3.4" fill="#FF2D78" opacity="0.4" />
          </>
        )}

        {/* pastki uchqun izi */}
        <path d="M60 108 L56 118 L61 116 L58 126" stroke="#FFD700" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round" />
      </svg>
    </div>
  );
}
