# Realistik Cutscene — Tavsiyalar

## Hozirgi holat vs Maqsad

| Element | Hozir | Realistik bo'lishi kerak |
|---------|-------|------------------------|
| Bino | To'rtburchak + kvadrat oyna | 3D ko'rinish, tekstura, refleksiya |
| Yashin | 2 ta chiziq | Dallanuvchi, porlashi bilan |
| Osmon | 2 rangli gradient | Bulutlar, tuman, rang o'tishlari |
| Zarrachalar | Yo'q | Yomg'ir, chang, porlash |
| Kamera | Statik | Silkindi, zoom effekt |
| Ovoz | Yo'q | Momaqaldiroq, shamol |

---

## 1. BINOLAR — 3 bosqichli yaxshilash

### 1-daraja: Oddiy (hozirgi)
```javascript
ctx.fillRect(x, y, w, h); // to'rtburchak
ctx.fillRect(x+6, y+winY, 8, 6); // oyna
```

### 2-daraja: O'rta (tavsiya)
```javascript
// Bino tanasi — gradient bilan
const grad = ctx.createLinearGradient(x, y, x + w, y);
grad.addColorStop(0, '#2a2a3a');  // chap tomon qorong'i
grad.addColorStop(0.5, '#3a3a4a'); // o'rta
grad.addColorStop(1, '#1a1a2a');  // o'ng tomon qorong'i
ctx.fillStyle = grad;
ctx.fillRect(x, y, w, h);

// Oyna — ichki yorug'lik bilan
if (lit) {
  // Oyna ichki porlashi
  const glow = ctx.createRadialGradient(x+winX+4, y+winY+3, 0, x+winX+4, y+winY+3, 8);
  glow.addColorStop(0, `rgba(255,221,0,0.8)`);
  glow.addColorStop(1, `rgba(255,221,0,0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x+winX-4, y+winY-4, 16, 14);
  // Oyna ramkasi
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(x+winX, y+winY, 8, 6);
}

// Bino tepasida antenna/ konditsioner
ctx.fillStyle = '#334155';
ctx.fillRect(x+10, y-15, 3, 15); // antenna
ctx.fillRect(x+15, y-20, 5, 5);  // antenna tepasi

// Bino tagida eshik, chiroq
ctx.fillStyle = `rgba(255,221,0,${0.3 + 0.2 * Math.sin(time)})`;
ctx.fillRect(x + w/2 - 4, y + h - 12, 8, 12); // eshik ustidagi chiroq
```

### 3-daraja: Premium
- **Parallax qatlamlar**: Oldingi binolar katta, orqadagilar kichik va xira
- **Fon shahri**: Uzoqdagi binolar faqat siluet ko'rinishida
- **Deraza refleksiyasi**: Oynalarda qarama-qarshi binolarning aksi
- **Animatsion belgilar**: Ba'zi oynalarda odam siluetlari o'tib turadi

---

## 2. YASHIN — Fizika asosida

### Hozirgi: oddiy polyline
```
📏 2 ta chiziq, bir xil qalinlik, tekis
```

### Realistik yashin:
```
     ⚡ Chaqmoq fizikasi:
     ┌─────────────────────────┐
     │ 1. Leader stroke        │ ← asosiy yo'nalish
     │    (tez, xira, oldindan) │
     │ 2. Return stroke        │ ← asosiy chaqmoq (yonadi)
     │    (yorqin, qalin)       │
     │ 3. Branchlar            │ ← dallanuvchi shoxlar
     │    (zaif, tarqoq)        │
     │ 4. Afterglow            │ ← so'nish (0.5s)
     │    (porlash asta so'nadi)│
     └─────────────────────────┘
```

```javascript
// Realistik yashin chizish
function drawLightning(ctx, x1, y1, x2, y2, intensity, time) {
  const branches = [];
  
  // Leader stroke — asosiy yo'l
  ctx.strokeStyle = `rgba(200,200,255,${intensity * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let cx = x1, cy = y1;
  ctx.moveTo(cx, cy);
  while (cy < y2) {
    cx += (Math.random() - 0.5) * 30;
    cy += 10 + Math.random() * 20;
    ctx.lineTo(cx, cy);
    // Branch (shox) yaratish
    if (Math.random() > 0.7 && cy < y2 * 0.7) {
      branches.push({
        x: cx, y: cy,
        angle: (Math.random() - 0.5) * Math.PI * 0.5,
        length: 20 + Math.random() * 40,
      });
    }
  }
  ctx.stroke();
  
  // Return stroke — asosiy portlash
  ctx.strokeStyle = `rgba(255,255,255,${intensity})`;
  ctx.lineWidth = 4 + intensity * 3;
  // ... qayta chizish qalinroq
  
  // Branchlarni chizish
  branches.forEach(b => {
    ctx.strokeStyle = `rgba(200,200,255,${intensity * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + Math.cos(b.angle) * b.length, 
               b.y + Math.sin(b.angle) * b.length);
    ctx.stroke();
  });
  
  // Afterglow — porlash
  if (intensity > 0) {
    const glow = ctx.createRadialGradient(x2, y2, 0, x2, y2, 100);
    glow.addColorStop(0, `rgba(255,255,255,${intensity * 0.15})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(x2 - 100, y2 - 100, 200, 200);
  }
}
```

---

## 3. ATMOSFERA — Muhit yaratish

### Bulutlar (3 qatlam)
```javascript
// Oldingi bulutlar — tez harakat
function drawClouds(ctx, w, h, time, layer) {
  const speed = [0.3, 0.15, 0.05][layer]; // har xil tezlik
  const alpha = [0.3, 0.2, 0.1][layer];
  const size = [30, 60, 100][layer];
  
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 200 + time * speed * 100) % (w + 200)) - 100;
    const cy = 20 + i * 15 + layer * 20;
    
    ctx.fillStyle = `rgba(148,163,184,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.5, cy - 5, size * 0.7, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### Yomg'ir (100+ zarrachalar)
```javascript
function drawRain(ctx, w, h, time, intensity) {
  ctx.strokeStyle = `rgba(148,163,184,${0.3 * intensity})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 100 * intensity; i++) {
    const rx = (i * 137 + time * 200 * intensity) % w;
    const ry = (i * 73 + time * 400 * intensity) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 1.5, ry + 8);
    ctx.stroke();
  }
}
```

### Tuman (gradient + blur)
```javascript
// Yer darajasida tuman
const fog = ctx.createRadialGradient(w/2, h * 0.85, 0, w/2, h * 0.85, h * 0.4);
fog.addColorStop(0, 'rgba(148,163,184,0.08)');
fog.addColorStop(1, 'transparent');
ctx.fillStyle = fog;
ctx.fillRect(0, 0, w, h);
```

---

## 4. KAMERA EFFEKTLARI

### Silkish (Camera Shake)
```javascript
// Yashin urganda kamerani silkiting
function applyShake(ctx, intensity) {
  if (intensity > 0) {
    const sx = (Math.random() - 0.5) * intensity * 10;
    const sy = (Math.random() - 0.5) * intensity * 10;
    ctx.translate(sx, sy);
  }
}

// Foydalanish:
ctx.save();
applyShake(ctx, shakeIntensity);
// ... hamma narsani chizish ...
ctx.restore();
```

### Vignette (qirralarda qorong'ilash)
```javascript
const vig = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.7);
vig.addColorStop(0, 'transparent');
vig.addColorStop(1, 'rgba(0,0,0,0.4)');
ctx.fillStyle = vig;
ctx.fillRect(0, 0, w, h);
```

### Letterbox (yuqori/past qora chiziqlar)
```javascript
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h * 0.08);  // yuqori
ctx.fillRect(0, h * 0.92, w, h * 0.08); // past
```

---

## 5. AUDIO DIZAYN (Web Audio API)

### Momaqaldiroq
```javascript
function playThunder() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(60, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5);
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  
  // Low-pass filter (past chastotali)
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.5);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2);
}
```

### Yomg'ir ovozi (oq shovqin)
```javascript
function playRain(ctx, duration) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}
```

---

## 6. REALISTLIK DARAJALARI

| Daraja | Nima qo'shiladi | Qo'shimcha kod | Effekt |
|--------|----------------|---------------|--------|
| **1 (hozir)** | Gradient osmon, to'rtburchak binolar | 50 satr | ⭐ |
| **2 (tavsiya)** | + Bino teksturasi, yashin fizikasi, yomg'ir | 100 satr | ⭐⭐⭐ |
| **3 (yaxshi)** | + 3 qatlam bulut, parallax, kamera shake, vignette | 200 satr | ⭐⭐⭐⭐ |
| **4 (premium)** | + WebGL, audio, zarracha tizimi, post-processing | 500+ satr | ⭐⭐⭐⭐⭐ |

---

## 7. QILISH TARTIBI (Priority)

```
1.  Bino gradient + oyna porlashi     ← Eng katta effekt, kam kod
2.  Yashin fizikasi (branch, afterglow) ← Hozirgi yashin juda oddiy
3.  Kamera shake (yashin urganda)       ← Dramatik effekt
4.  Vignette + letterbox                ← Kino ko'rinishi
5.  Bulut qatlamlari                    ← Atmosfera
6.  Yomg'ir zarrachalari                ← Realistik havo
7.  Momaqaldiroq ovozi                  ← Audio immersiya
8.  Tuman + yorug'lik effektlari        ← Premium quality
```

---

## XULOSA

**2-daraja** ga o'tish uchun ~100 satr kod kerak:
- Bino gradient + oyna porlashi
- Yashin branch + afterglow
- Kamera shake
- Vignette

Bu 1 soatlik ish va natija sezilarli darajada yaxshilanadi.

**Xohlaysizmi, shu 2-darajani amalda yozib beray?** cutscene-demo.html ni to'liq qayta yozaman.
