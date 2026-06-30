export default function StickyBuyBar() {
  return (
    <div className="buybar" id="buybar">
      <div className="wrap">
        <div className="bb-info">
          <b>VOLTRA to'plami</b>
          <span>$49 <s>$69</s> · 100+ missiya · 30 kun qaytarish</span>
        </div>
        <button className="btn btn-amber" data-buy>
          <span className="ico">🛒</span> To'plamni olish
        </button>
      </div>
    </div>
  );
}
