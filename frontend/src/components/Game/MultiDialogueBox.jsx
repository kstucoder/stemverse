// MultiDialogueBox — ko'p-rolli dialog: har replikada boshqa personaj (rol) gapiradi.
// Har speaker o'z avatari (CastCharacter), nomi, roli, rangi va tomoni (chap/o'ng) bilan.
// lines: [{ speaker, text, emotion }]; cast: { id: { name, role, accent, variant, side } }.
import { useEffect, useRef, useState } from 'react';
import CastCharacter from './CastCharacter';
import { playClick } from './gameAudio';

export default function MultiDialogueBox({ cast, lines, actionLabel, onAction }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const line = lines[idx];
  const spk = cast[line.speaker] || { name: '???', role: '', accent: '#00e5ff', variant: 'echo', side: 'left' };
  const right = spk.side === 'right';
  const doneTyping = shown.length >= line.text.length;
  const last = idx === lines.length - 1;
  const ivRef = useRef(null);

  useEffect(() => {
    setShown('');
    const text = lines[idx].text;
    ivRef.current = setInterval(() => {
      setShown((s) => { if (s.length >= text.length) { clearInterval(ivRef.current); return s; } return text.slice(0, s.length + 1); });
    }, 20);
    return () => clearInterval(ivRef.current);
  }, [idx, lines]);

  const advance = () => {
    if (!doneTyping) { clearInterval(ivRef.current); setShown(line.text); return; }
    if (!last) { playClick(); setIdx((i) => i + 1); }
  };

  const accent = spk.accent;
  return (
    <div className={`flex items-end gap-3 ${right ? 'flex-row-reverse' : ''}`} style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ flexShrink: 0 }}>
        <CastCharacter variant={spk.variant} emotion={line.emotion || 'normal'} size={104} />
      </div>

      <div
        onClick={advance}
        style={{
          flex: 1, cursor: last && doneTyping ? 'default' : 'pointer',
          background: 'rgba(8,10,24,0.93)',
          border: `1px solid ${accent}55`,
          borderRadius: right ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '14px 18px 12px', backdropFilter: 'blur(12px)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 26px ${accent}22`,
          position: 'relative', minHeight: 96, userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexDirection: right ? 'row-reverse' : 'row', textAlign: right ? 'right' : 'left' }}>
          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 12, letterSpacing: '0.14em', color: accent, textShadow: `0 0 10px ${accent}66` }}>
            {spk.name}
          </span>
          <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
            {spk.role}
          </span>
          <span style={{ marginLeft: right ? 0 : 'auto', marginRight: right ? 'auto' : 0, fontFamily: 'Chakra Petch, monospace', fontSize: 9, color: '#475569' }}>
            {idx + 1}/{lines.length}
          </span>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14.5, lineHeight: 1.55, color: '#EAF3FF', minHeight: 44, margin: 0, textAlign: right ? 'right' : 'left' }}>
          {shown}{!doneTyping && <span style={{ opacity: 0.7 }}>▌</span>}
        </p>

        {doneTyping && !last && (
          <div className="animate-pulse" style={{ position: 'absolute', bottom: 8, right: right ? 'auto' : 14, left: right ? 14 : 'auto', color: accent, fontSize: 14 }}>{right ? '◂' : '▸'}</div>
        )}
        {doneTyping && last && actionLabel && (
          <div style={{ textAlign: right ? 'left' : 'right' }}>
            <button
              onClick={(ev) => { ev.stopPropagation(); onAction?.(); }}
              className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#0a0620', background: `linear-gradient(135deg, ${accent}, #ffffff)`, boxShadow: `0 0 20px ${accent}55`, border: 'none', cursor: 'pointer' }}
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
