// ArduinoTwin — o'yin burchagidagi jonli mini-plata.
// Bolaning stolidagi haqiqiy Arduino'da qaysi pin signal berayotganini
// ekranda ko'rsatadi: "mening platam ↔ ekran" bog'liqligining vizual isboti.
import useGameStore from '../../stores/gameStore';

const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  fontSize: 9, letterSpacing: '0.08em', color: 'rgba(234,243,255,0.55)',
  marginTop: 5,
};

function PinDot({ active, color }) {
  return (
    <span style={{
      width: 9, height: 9, borderRadius: '50%',
      background: active ? color : 'rgba(255,255,255,0.08)',
      boxShadow: active ? `0 0 8px ${color}, 0 0 16px ${color}66` : 'inset 0 1px 2px rgba(0,0,0,0.6)',
      transition: 'all 0.12s',
    }} />
  );
}

export default function ArduinoTwin({ showLed = true, showBtn = true, showPot = true }) {
  const led = useGameStore((s) => s.serialData.led);
  const btn = useGameStore((s) => s.serialData.btn);
  const pot = useGameStore((s) => s.serialData.pot);
  const connected = useGameStore((s) => s.arduinoConnected);
  const potPct = Math.min(100, Math.round(((pot || 0) / 1023) * 100));

  return (
    <div style={{
      width: 150, borderRadius: 10, padding: '8px 12px 10px',
      background: 'linear-gradient(150deg, #0e3d35 0%, #082a24 60%, #06201b 100%)',
      border: '1px solid rgba(0,238,255,0.22)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      fontFamily: 'Chakra Petch, monospace',
      position: 'relative',
    }}>
      {/* USB notch */}
      <div style={{ position: 'absolute', top: 10, left: -5, width: 8, height: 14, borderRadius: 2, background: '#8a9099', border: '1px solid #3a3f46' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#9adfce' }}>VOLTRA UNO</span>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: connected ? '#00FF88' : '#ef4444',
          boxShadow: connected ? '0 0 8px #00FF88' : 'none',
          animation: connected ? 'pulse 1.6s infinite' : 'none',
        }} />
      </div>

      {/* Pin strip cosmetic */}
      <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} style={{ width: 4, height: 4, background: '#1a1a1a', border: '1px solid #333', borderRadius: 1 }} />
        ))}
      </div>

      {showLed && (
        <div style={rowStyle}>
          <span>D13 · LED</span>
          <PinDot active={connected && led === 1} color="#FFD700" />
        </div>
      )}
      {showBtn && (
        <div style={rowStyle}>
          <span>D2 · BTN</span>
          <PinDot active={connected && btn === 1} color="#FF2D78" />
        </div>
      )}
      {showPot && (
        <div style={rowStyle}>
          <span>A0 · POT</span>
          <span style={{ width: 54, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <span style={{
              display: 'block', height: '100%', width: `${connected ? potPct : 0}%`,
              background: 'linear-gradient(90deg, #00FF88, #00EEFF)',
              boxShadow: '0 0 6px #00FF88',
              transition: 'width 0.15s',
            }} />
          </span>
        </div>
      )}
    </div>
  );
}
