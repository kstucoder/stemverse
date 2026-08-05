// CastCharacter — ko'p-rolli intro personajlari (cast). Har bir variant o'z palitrasi,
// crest'i va ko'z/og'iz emotsiyalari bilan alohida ko'rinadi. MultiDialogueBox bilan ishlaydi.
// Variantlar: nova (qo'mondon), echo (AI), rix (muhandis), glitch (dushman).

const EYE = {
  normal: { ry: 5, browRot: 0, browY: -3 },
  worried: { ry: 4.2, browRot: 14, browY: -5 },
  excited: { ry: 6.2, browRot: -8, browY: -4 },
  angry: { ry: 4.6, browRot: 22, browY: -4 },
};
const MOUTH = {
  normal: 'M52 79 Q60 84 68 79',
  worried: 'M53 82 Q60 78 67 82',
  excited: 'M50 77 Q60 89 70 77',
  angry: 'M51 84 L60 79 L69 84',
};

// variant palitralari
const V = {
  nova: { b0: '#ff8fd0', b1: '#ff2d95', b2: '#b81667', stroke: '#ff6ec7', eye: '#ffd8f0', glow: 'rgba(255,45,149,0.35)' },
  echo: { b0: '#8ff0ff', b1: '#00d0ff', b2: '#0a78b8', stroke: '#5fe0ff', eye: '#eaffff', glow: 'rgba(0,208,255,0.35)' },
  rix: { b0: '#ffe08a', b1: '#ffab2e', b2: '#c8720f', stroke: '#ffc76a', eye: '#0e1730', glow: 'rgba(255,171,46,0.35)' },
  glitch: { b0: '#c49bff', b1: '#7a2ff7', b2: '#3a0d7a', stroke: '#a24bff', eye: '#ff3b5c', glow: 'rgba(122,47,247,0.4)' },
};

function Crest({ variant, c }) {
  if (variant === 'nova') // qo'mondon toji
    return <path d="M46 12 L52 24 L60 10 L68 24 L74 12 L72 30 L48 30 Z" fill={c.b1} stroke={c.b0} strokeWidth="1" />;
  if (variant === 'echo') // AI halo halqasi
    return <ellipse cx="60" cy="20" rx="26" ry="7" fill="none" stroke={c.stroke} strokeWidth="2.4" opacity="0.85" />;
  if (variant === 'rix') // muhandis antennasi + boltcha
    return <g><rect x="58" y="8" width="4" height="16" rx="2" fill={c.b1} /><circle cx="60" cy="8" r="4" fill={c.b0} stroke={c.b2} strokeWidth="1" /></g>;
  // glitch — buzilgan chaqmoq
  return <path d="M64 6 L50 24 L59 23 L48 40 L70 18 L60 20 Z" fill={c.eye} stroke={c.b0} strokeWidth="0.8" opacity="0.9" />;
}

export default function CastCharacter({ variant = 'echo', emotion = 'normal', size = 108 }) {
  const c = V[variant] || V.echo;
  const e = EYE[emotion] || EYE.normal;
  const mouth = MOUTH[emotion] || MOUTH.normal;
  const gid = `cast_${variant}`;
  const glitchy = variant === 'glitch';

  return (
    <div style={{ width: size, height: size * 1.08, animation: 'guideFloat 3s ease-in-out infinite', filter: `drop-shadow(0 6px 14px ${c.glow})` }}>
      <style>{`
        @keyframes guideFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes castBlink { 0%,90%,100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } }
        @keyframes castGlitch { 0%,100% { transform: translate(0,0); } 48% { transform: translate(0,0); } 50% { transform: translate(-2px,1px); } 52% { transform: translate(2px,-1px); } 54% { transform: translate(0,0); } }
      `}</style>
      <svg viewBox="0 0 120 130" width="100%" height="100%" style={{ animation: glitchy ? 'castGlitch 2.4s steps(1) infinite' : 'none' }}>
        <defs>
          <radialGradient id={`${gid}_glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.glow} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id={`${gid}_body`} cx="42%" cy="34%" r="75%">
            <stop offset="0%" stopColor={c.b0} />
            <stop offset="55%" stopColor={c.b1} />
            <stop offset="100%" stopColor={c.b2} />
          </radialGradient>
          <linearGradient id={`${gid}_face`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={variant === 'rix' ? '#fff4dc' : '#0E1730'} />
            <stop offset="100%" stopColor={variant === 'rix' ? '#ffd98a' : '#080D1C'} />
          </linearGradient>
        </defs>

        <circle cx="60" cy="66" r="54" fill={`url(#${gid}_glow)`} />
        <g><Crest variant={variant} c={c} /></g>

        {/* qo'llar */}
        {emotion === 'excited' || emotion === 'angry' ? (
          <>
            <circle cx="104" cy="48" r="7" fill={c.b1} stroke={c.b2} strokeWidth="1.5" />
            <circle cx="17" cy="82" r="7" fill={c.b1} stroke={c.b2} strokeWidth="1.5" />
          </>
        ) : (
          <>
            <circle cx="19" cy="80" r="7" fill={c.b1} stroke={c.b2} strokeWidth="1.5" />
            <circle cx="101" cy="80" r="7" fill={c.b1} stroke={c.b2} strokeWidth="1.5" />
          </>
        )}

        {/* tana */}
        {variant === 'echo'
          ? <polygon points="60,28 96,52 84,96 36,96 24,52" fill={`url(#${gid}_body)`} stroke={c.stroke} strokeWidth="2" />
          : <circle cx="60" cy="68" r="40" fill={`url(#${gid}_body)`} stroke={c.stroke} strokeWidth="2" />}
        <ellipse cx="46" cy="48" rx="14" ry="8" fill="rgba(255,255,255,0.32)" transform="rotate(-24 46 48)" />

        {/* yuz paneli */}
        <rect x="31" y="50" width="58" height="38" rx={glitchy ? 4 : 17} fill={`url(#${gid}_face)`} stroke={`${c.stroke}55`} strokeWidth="1" />

        {/* ko'zlar */}
        <g style={{ animation: 'castBlink 3.4s infinite', transformOrigin: '60px 66px' }}>
          {glitchy ? (
            <>
              <rect x="43" y={64 - e.ry} width="10" height={e.ry * 2} fill={c.eye} />
              <rect x="67" y={64 - e.ry} width="10" height={e.ry * 2} fill={c.eye} />
            </>
          ) : (
            <>
              <ellipse cx="48" cy="66" rx="5" ry={e.ry} fill={c.eye === '#0e1730' ? '#00a0d0' : c.eye} />
              <ellipse cx="72" cy="66" rx="5" ry={e.ry} fill={c.eye === '#0e1730' ? '#00a0d0' : c.eye} />
              <circle cx="49.5" cy="63.5" r="1.6" fill="#EAF3FF" />
              <circle cx="73.5" cy="63.5" r="1.6" fill="#EAF3FF" />
            </>
          )}
        </g>

        {/* qoshlar */}
        <rect x="42" y={60 + e.browY} width="12" height="2" rx="1" fill={c.stroke} opacity="0.8" transform={`rotate(${e.browRot} 48 ${60 + e.browY})`} />
        <rect x="66" y={60 + e.browY} width="12" height="2" rx="1" fill={c.stroke} opacity="0.8" transform={`rotate(${-e.browRot} 72 ${60 + e.browY})`} />

        {/* og'iz */}
        <path d={mouth} stroke={glitchy ? c.eye : c.stroke} strokeWidth="2.4" fill="none" strokeLinecap="round" />

        {/* glitch scan chiziqlari */}
        {glitchy && <g opacity="0.5"><rect x="24" y="58" width="72" height="1.5" fill={c.eye} /><rect x="24" y="74" width="72" height="1.5" fill={c.stroke} /></g>}
      </svg>
    </div>
  );
}
