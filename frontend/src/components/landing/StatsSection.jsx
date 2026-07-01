export default function StatsSection({ countersRef }) {
  return (
    <section style={{ padding: '0 0 clamp(40px,6vw,80px)' }} ref={countersRef}>
      <div className="wrap">
        <div className="stats-band">
          <div className="stat glass reveal">
            <div className="num"><span data-to="20">0</span></div>
            <div className="lbl">Interaktiv missiya</div>
          </div>
          <div className="stat glass reveal">
            <div className="num"><span data-to="50">0</span><span className="suf">+</span></div>
            <div className="lbl">Haqiqiy detal</div>
          </div>
          <div className="stat glass reveal">
            <div className="num"><span data-to="1000">0</span><span className="suf">+</span></div>
            <div className="lbl">Yosh muhandis</div>
          </div>
          <div className="stat glass gold reveal">
            <div className="num"><span data-to="4.9" data-dec="1">0</span><span className="suf">★</span></div>
            <div className="lbl">Ota-ona bahosi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
