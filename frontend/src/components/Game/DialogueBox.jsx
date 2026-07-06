// DialogueBox — personaj dialogi: yozuv mashinkasi effekti, bosib o'tish,
// oxirgi replikada harakat tugmasi. GuideCharacter bilan birga barcha
// o'yinlarning kirish hikoyalarida qayta ishlatiladi.
import { useEffect, useRef, useState } from 'react';
import GuideCharacter from './GuideCharacter';
import { playClick } from './gameAudio';

export default function DialogueBox({
  name = 'ELECTRA',
  role = 'Energiya muhandisi',
  lines,               // [{ text, emotion }]
  actionLabel,         // oxirgi replikadan keyingi tugma matni
  onAction,
  accent = '#FFD700',
}) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const line = lines[idx];
  const doneTyping = shown.length >= line.text.length;
  const last = idx === lines.length - 1;
  const ivRef = useRef(null);

  useEffect(() => {
    setShown('');
    const text = lines[idx].text;
    ivRef.current = setInterval(() => {
      setShown((s) => {
        if (s.length >= text.length) { clearInterval(ivRef.current); return s; }
        return text.slice(0, s.length + 1);
      });
    }, 22);
    return () => clearInterval(ivRef.current);
  }, [idx, lines]);

  const advance = () => {
    if (!doneTyping) { clearInterval(ivRef.current); setShown(line.text); return; }
    if (!last) { playClick(); setIdx((i) => i + 1); }
  };

  return (
    <div className="flex items-end gap-3" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ flexShrink: 0 }}>
        <GuideCharacter emotion={line.emotion || 'normal'} size={104} />
      </div>

      <div
        onClick={advance}
        style={{
          flex: 1,
          cursor: last && doneTyping ? 'default' : 'pointer',
          background: 'rgba(8,14,28,0.92)',
          border: `1px solid ${accent}44`,
          borderRadius: '16px 16px 16px 4px',
          padding: '14px 18px 12px',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${accent}18`,
          position: 'relative',
          minHeight: 96,
          userSelect: 'none',
        }}
      >
        {/* nom chizig'i */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 12, letterSpacing: '0.14em', color: accent, textShadow: `0 0 10px ${accent}66` }}>
            ⚡ {name}
          </span>
          <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
            {role}
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'Chakra Petch, monospace', fontSize: 9, color: '#475569' }}>
            {idx + 1}/{lines.length}
          </span>
        </div>

        {/* matn */}
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14.5, lineHeight: 1.55, color: '#EAF3FF', minHeight: 44, margin: 0 }}>
          {shown}
          {!doneTyping && <span style={{ opacity: 0.7 }}>▌</span>}
        </p>

        {/* davom ko'rsatkichi / harakat tugmasi */}
        {doneTyping && !last && (
          <div className="animate-pulse" style={{ position: 'absolute', bottom: 8, right: 14, color: accent, fontSize: 14 }}>▸</div>
        )}
        {doneTyping && last && actionLabel && (
          <button
            onClick={(ev) => { ev.stopPropagation(); onAction?.(); }}
            className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105"
            style={{
              fontFamily: 'Chakra Petch, monospace',
              color: '#1a1300',
              background: `linear-gradient(135deg, ${accent}, #FF9F1C)`,
              boxShadow: `0 0 20px ${accent}55`,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
