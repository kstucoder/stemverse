export default function BootScreen({ onSkip, done }) {
  return (
    <div id="boot" className={done ? 'done' : ''}>
      <div className="boot-city"></div>
      <div className="boot-eyes"><span></span><span></span></div>
      <div className="boot-core">
        <div className="boot-chip"></div>
        <div className="boot-title">VOLTRA</div>
        <div className="boot-bar"><i></i></div>
      </div>
      <div className="boot-flash"></div>
      <button className="boot-skip" onClick={onSkip}>
        Intro-ni o'tkazib yuborish →
      </button>
    </div>
  );
}
