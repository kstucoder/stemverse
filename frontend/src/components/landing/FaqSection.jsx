export default function FaqSection() {
  const faqs = [
    { q: "Kod yozishni bilishim shartmi?", a: "Yo'q. Missiya 01 bitta LED'dan boshlanadi va har bir qadamni ko'rsatadi. Kod siz bilan birga, missiyama-missiya o'sib boradi." },
    { q: "Farzandim telefon yoki planshetda o'ynay oladimi?", a: "Missiyalar, to'plam va hamjamiyatni istalgan qurilmada ko'rish mumkin. O'ynash uchun esa to'plam kompyuterga USB orqali ulanishi kerak — shunda haqiqiy zanjir o'yinni boshqaradi." },
    { q: "To'plam ichida nima bor?", a: "Boshqaruv platasi, bredbord, 40+ jumper, LED, servo, ultratovush sensor, LCD, RGB, tugmalar, sensorlar, zummer va USB kabel — 100+ missiya uchun hammasi." },
    { q: "Qaysi yosh uchun mo'ljallangan?", a: "9–15 yosh uchun, lekin elektronikaga qiziqqan har kim boshlashi mumkin. Murakkablik Tadqiqotchidan Usta muhandisgacha bosqichma-bosqich oshadi." },
    { q: "Qaysi kompyuterlarda ishlaydi?", a: "USB porti va zamonaviy brauzeri bo'lgan har qanday Windows, macOS yoki Linux kompyuterda." },
    { q: "O'zbek tilida bormi?", a: "Ha — missiya interfeysi o'zbek, rus va ingliz tillarida. Istalgan vaqtda til menyusidan almashtiriladi." },
  ];
  return (
    <section className="section-pad" id="faq">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Savollar</span>
          <h2>Boshlashdan oldin</h2>
        </div>
        <div className="faq">
          {faqs.map((item, i) => (
            <details key={i} className="q" {...(i === 0 ? { open: true } : {})}>
              <summary>{item.q} <span className="plus">+</span></summary>
              <div className="ans">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
