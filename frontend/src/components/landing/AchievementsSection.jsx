export default function AchievementsSection() {
  const items = [
    { icon: '⚡', title: 'XP va Muhandis darajasi', desc: "Har bir missiya XP beradi va darajangni Usta muhandisga yaqinlashtiradi." },
    { icon: '🪙', title: 'Tangalar', desc: "Tangalarga bonus missiyalar va bezaklar och." },
    { icon: '🎖️', title: 'Nishonlar', desc: "Ketma-ketlik, tezkor yechim va aqlli g'oyalar uchun nishon yig'." },
    { icon: '📜', title: 'Sertifikatlar', desc: "Bir dunyoni tugat va haqiqiy, ulashsa bo'ladigan muhandis sertifikati ol." },
    { icon: '🗓️', title: 'Kunlik vazifalar', desc: "Ketma-ketlikni saqlash uchun har kuni yangi tezkor topshiriq." },
    { icon: '⚔️', title: 'Haftalik vazifalar', desc: "Vaqtli missiyada g'olib bo'lib, global reytingda ko'taril." },
  ];
  return (
    <section className="section-pad tint" id="achievements">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow">Yutib ol</span>
            <h2>Yutuqlar va mukofotlar</h2>
          </div>
        </div>
        <div className="ach-grid">
          {items.map((a, i) => (
            <div key={i} className="ach glass reveal">
              <div className="bico">{a.icon}</div>
              <div><h4>{a.title}</h4><p>{a.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
