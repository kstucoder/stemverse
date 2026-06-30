# VOLTRA Landing Page — Dizayn Spetsifikatsiyasi

## 1. Maqsad

VOLTRA — Arduino/elektronika o'quv platformasining asosiy (landing) sahifasini premium darajada qayta yaratish. Dizayn `C:\Users\HP\Downloads\arduino-adventure.html` faylidagi VOLTRA landing page asosida ishlanadi.

**Brand**: VOLTRA  
**To'plam narxi**: $49  
**Auditoriya**: 9-15 yosh bolalar, ota-onalar, o'qituvchilar

---

## 2. Arxitektura

```
/ (VOLTRA Landing — React komponent)
├── Landing.jsx              # Asosiy komponent (sectionlarni yig'adi)
├── landing.css              # VOLTRA CSS (Tailwind bilan aralashmaydi)
├── hooks/
│   ├── useBoot.js           # Boot animatsiyasi
│   ├── useParticles.js      # Canvas particle effekti
│   ├── useParallax.js       # SVG parallax
│   ├── useCounters.js       # Raqam counter animatsiyasi
│   ├── useReveal.js         # Scroll reveal (IntersectionObserver)
│   └── useMediaQuery.js     # Mobile detect
│
├── components/landing/      # Landing section komponentlari
│   ├── BootScreen.jsx
│   ├── LandingNav.jsx
│   ├── HeroSection.jsx
│   ├── ParentsSection.jsx
│   ├── StatsSection.jsx
│   ├── MissionsSection.jsx
│   ├── HardwareSection.jsx
│   ├── HowItWorks.jsx
│   ├── LearningPath.jsx
│   ├── ProjectsSection.jsx
│   ├── AchievementsSection.jsx
│   ├── TestimonialsSection.jsx
│   ├── CommunitySection.jsx
│   ├── FaqSection.jsx
│   ├── FinalCta.jsx
│   ├── LandingFooter.jsx
│   ├── StickyBuyBar.jsx
│   └── MobileModal.jsx
│
├── auth/login               # Hozirgi Login.jsx (o'zgarishsiz)
├── dashboard                # Hozirgi Dashboard.jsx
├── lessons                  # Hozirgi Lessons.jsx
└── ...                      # Qolgan barcha sahifalar o'zgarishsiz
```

**Routing**: Landing'dagi tugmalar React Router orqali yo'naltiriladi:
- "Kirish" → `/auth/login`
- "To'plamni faollashtirish" → `/activate`
- "Sarguzashtni boshlash" → `/auth/register`
- "Dashboard" → `/dashboard`
- "Darslar" → `/lessons`
- "Yutuqlar" → `/achievements`

---

## 3. Komponentlar va Sectionlar

### 3.1 BootScreen
- **Vazifasi**: 5 soniyalik boot animatsiyasi
  - Mikrosxema chipi pulse effekti
  - Loading bar
  - Shahar silueti rise animatsiyasi
  - `sessionStorage` ga belgi qo'yadi — qayta ochganda skip
- **State**: `show` (true/false)
- **Animation**: CSS keyframes (`chipIn`, `cityRise`, `load`, `flash`)

### 3.2 LandingNav
- **Vazifasi**: Fixed navbar
- **Elementlar**: Brand logosi (VOLTRA), menyu linklari (Bosh sahifa, O'yinlar, To'plam, Ta'lim, Hamjamiyat, Yordam), Kirish tugmasi, To'plamni faollashtirish tugmasi, mobil menyu toggle
- **State**: `scrolled` (scroll > 30px da glass effekt), `mobileOpen`
- **Routing**: "Kirish" → `/auth/login`, "Faollashtirish" → `/activate`

### 3.3 HeroSection
- **Vazifasi**: Asosiy hero qism
- **Tarkib**: 
  - Eyebrow: "Missiya 00 · Quvvat ber"
  - Sarlavha: "Elektronika uy vazifasi emas. Bu — sarguzasht."
  - Sub text
  - CTA tugmalar (To'plamni olish, Boshlash, Treyler)
  - Trust indikatorlari (★ 4.9, 100+ missiya, 30 kun qaytarish, Bepul yetkazib berish)
  - SVG poster (657 qator inline SVG)
  - 3D aylanuvchi to'plam (CSS 3D transform)
  - Scroll hint
- **Effektlar**: Parallax (sichqoncha harakati), SVG animatsiyalar

### 3.4 ParentsSection
- 6 ta karta (tanqidiy fikrlash, muhandislik, kam ekran, dasturlash, ijodkorlik, kelajak kasblari)
- Scroll reveal animatsiyasi

### 3.5 StatsSection
- 4 ta counter: 100+ missiya, 50+ detal, 1000+ yosh muhandis, 4.9★
- Viewportga kelganda raqamlar animatsion oshadi

### 3.6 MissionsSection
- Gorizontal skroll rail
- 10 ta missiya kartasi (M.01-M.10)
- Har bir karta: nom, qiyinchilik darajasi (easy/med/hard), XP, vaqt, chip componentlar
- Chap/o'ng scroll tugmalari

### 3.7 HardwareSection
- SVG diagramma: boshqaruv platasi va detallar
- Detallar: LED, Servo, Bredbord, Ultratovush, LCD, Sensor + RGB

### 3.8 HowItWorks
- 4 qadam (To'plamni xarid qil → Faollashtir → Zanjirni yig' → Missiya jonlanadi)
- USB chain vizualizatsiyasi (plata → USB → Kompyuter → Missiya)

### 3.9 LearningPath
- 4 daraja: Tadqiqotchi (0-500 XP) → Ixtirochi (500-1800) → Muhandis (1800-4000) → Usta muhandis (4000+)
- Progress bar animatsiyalari

### 3.10 ProjectsSection
- 8 ta loyiha kartasi (grid)
- Svetofor, Robot qo'l, Aqlli uy, Ob-havo stansiyasi, Issiqxona, Signalizatsiya, Robot mashina, O'zing qur

### 3.11 AchievementsSection
- 6 ta yutuq: XP/Muhandis darajasi, Tangalar, Nishonlar, Sertifikatlar, Kunlik vazifalar, Haftalik vazifalar

### 3.12 TestimonialsSection
- 3 ta fikr (ota-ona va o'qituvchilardan)
- Yulduzcha reyting, avatar, ism

### 3.13 CommunitySection
- 3 ta hamjamiyat ijodi (karta: rasm, badge, nom, muallif, like/share tugmalari)

### 3.14 FaqSection
- 6 ta accordion (ochiladigan savol-javob)
- Savollar: Kod bilish shartmi?, Telefonda ishlaydimi?, To'plam ichida nima?, Yosh chegarasi?, Qaysi kompyuter?, O'zbek tilida?

### 3.15 FinalCta
- Sarlavha, narx ($49 $69), kafolatlar
- To'plamni faollashtirish + Sarguzashtni boshlash tugmalari

### 3.16 LandingFooter
- Brand, description, ijtimoiy tarmoqlar (Discord, Telegram, Instagram, YouTube)
- Linklar: O'ynash, To'plam, Yangiliklar
- Email subscription forma

### 3.17 StickyBuyBar
- Pastda sticky panel
- Hero pastga o'tganda ko'rinadi
- "VOLTRA to'plami $49" + tugma

### 3.18 MobileModal
- Telefon foydalanuvchilari uchun modal
- "Sarguzasht kompyuterda o'ynaladi" — email yuborish formasi

---

## 4. Hook'lar

### useBoot
- Boot ekranini 5 sek ko'rsatadi
- `sessionStorage('voltra_booted')` ni tekshiradi va yozadi
- `prefers-reduced-motion` ni hurmat qiladi
- Return: `{ booting, skipBoot }`

### useParticles
- Canvas elementda particle effekti
- Yulduzlar, lightning, grid chiziqlar
- `requestAnimationFrame` loopi
- `resize` event
- `prefers-reduced-motion` da o'chadi

### useParallax
- Hero SVG da sichqoncha harakati bilan parallax
- `.layer[data-depth]` elementlarini siljitadi
- Mobile va reduced-motion da o'chadi

### useCounters
- `.num span[data-to]` elementlarini counter qiladi
- IntersectionObserver bilan ishga tushadi
- Easing: cubic ease-out

### useReveal
- `.reveal` elementlarini IntersectionObserver bilan kuzatadi
- Threshold: 0.16
- `.in` class qo'shiladi

### useMediaQuery
- `(max-width: 1024px)` media query
- Mobile detect

---

## 5. CSS Strategiyasi

- VOLTRA CSS `landing.css` faylida alohida saqlanadi
- Tailwind konfigiga qo'shilmaydi
- CSS variable'lar orqali ranglar:
  ```css
  --void:#04060E;--energy:#19E3FF;--energy-deep:#0A84FF;
  --orange:#FF7A2C;--gold:#FFC400;--gold-deep:#FF9F1C;
  --ink:#EAF3FF;--muted:#94A6C6;
  ```
- Landing sahifasida yuklanadi, boshqa sahifalarda yo'q
- `:root` o'rniga `.voltra-landing` class ishlatiladi (globally polluting bo'lmasligi uchun)

---

## 6. Routing Konfiguratsiyasi

Hozirgi `router.jsx` ga o'zgartirishlar minimal:
- `Landing` o'rniga yangi `VoltraLanding` komponenti
- Qolgan barcha routelar o'zgarishsiz

```jsx
{ index: true, element: <VoltraLanding /> },
{ path: 'auth/login', element: <Login /> },
// ... qolganlari o'zgarishsiz
```

---

## 7. Mobile Modal

Telefon foydalanuvchilari "O'ynash" tugmasini bossa:
1. Modal ochiladi: "Sarguzasht kompyuterda o'ynaladi"
2. Email kiritish formasi (ixtiyoriy)
3. "Telefonda ko'rishda davom etish" (modal yopiladi)

---

## 8. Cheklovlar

- Landing sahifasi VOLTRA dizaynini 1:1 aks ettiradi
- Mavjud auth, dashboard, darslar va boshqa sahifalar o'zgarishsiz qoladi
- $49 narx va to'lov tizimi demo holatida — real checkout keyinroq ulanadi
- Hamjamiyat, like/share, email subscription, treyler va login tizimi demo holatida
