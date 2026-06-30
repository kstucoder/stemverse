export default function StickyBuyBar() {
  return (
    <div className="buybar" id="buybar">
      <div className="wrap">
        <div className="bb-info">
          <b>VOLTRA to'plami</b>
          <span>$49 <s>$69</s> · 100+ missiya · 30 kun qaytarish</span>
        </div>
        <button className="btn btn-amber" data-buy>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          To'plamni olish
        </button>
      </div>
    </div>
  );
}
