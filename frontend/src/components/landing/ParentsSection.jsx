export default function ParentsSection() {
  const cards = [
    { icon: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1 2 1 3h6c0-1 0-2 1-3a7 7 0 0 0-4-12z"/>', title: "Tanqidiy fikrlash", desc: "Har bir missiya — jumboq. Bolalar xatolarni topadi, sinaydi va ishlaydigan yechimga erishadi." },
    { icon: '<path d="m14 7 3 3M5 19l9-9 1-4 4-1-1 4-9 9-4 1z"/><circle cx="6" cy="18" r="1"/>', title: "Haqiqiy muhandislik", desc: "Zanjirlar, sensorlar va motorlar — haqiqiy muhandislar ishlatadigan asoslar." },
    { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', title: "Kamroq passiv ekran", desc: "Qo\'llar ekrandan chiqib, haqiqiy detallarni ushlaydi. Tomosha qilish — yaratishga aylanadi." },
    { icon: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>', title: "Dasturlash asoslari", desc: "Sikllar, mantiq va o\'zgaruvchilar — bosqichma-bosqich, jargonsiz tushuntiriladi." },
    { icon: '<path d="M12 2v3M12 19v3M5 12H2M22 12h-3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/><circle cx="12" cy="12" r="4"/>', title: "Ijodkorlik", desc: "Missiyalardan keyin bolalar o\'z mashinalarini ixtiro qilib, hamjamiyatga ulashadi." },
    { icon: '<path d="M5 16 3 8l5 3 4-7 4 7 5-3-2 8z"/><path d="M5 16h14v3H5z"/>', title: "Kelajak kasblari", desc: "Robototexnika, IoT va elektronika — ertangi eng yaxshi kasblarning poydevori." },
  ];
  return (
    <section className="section-pad tint" id="parents">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Ota-onalar uchun</span>
          <h2>Ota-onalar nega VOLTRA'ni tanlaydi</h2>
          <p className="sub">Epik o'yin ko'rinishidagi haqiqiy muhandislik ko'nikmalari. Kamroq passiv ekran — ko'proq yaratish, fikrlash va ixtiro.</p>
        </div>
        <div className="pcards">
          {cards.map((c, i) => (
            <div key={i} className="pcard glass reveal">
              <div className="corner"></div>
              <div className="pic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" dangerouslySetInnerHTML={{ __html: c.icon }} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
