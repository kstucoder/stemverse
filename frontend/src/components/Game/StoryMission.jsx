// StoryMission — hikoya intro, missiya brielfing va victory screen
import { useState, useEffect, useRef } from 'react';
import { Play, Zap, SkipForward } from 'lucide-react';

// ===== CUTSCENE CONFIGS — 20 games, 20 unique intros =====
import CutscenePlayer from './CutscenePlayer';

const cutsceneScenes = {
  energy_city: {
    duration: 7, sky: () => ['#1a1a3a', '#0f0f2a', '#0a0a1a'],
    stars: 50, buildings: { count: 12, maxW: 25, maxH: 55 },
    clouds: 2, rain: 100, road: true,
    lightning: { time: 2.5 }, shake: true, shakeTrigger: (e) => e > 2 && e < 2.3, shakeIntensity: 1,
    phases: (e) => e < 2 ? 'calm' : e < 3.5 ? 'strike' : e < 5 ? 'blackout' : 'resolve',
    text: [
      { time: 0.8, text: '🌇 Energy City — tinch kech...', alpha: 0.8 },
      { time: 2.6, text: '⚡ YASHIN! ⚡', y: 120, size: '24px', alpha: 0.9 },
      { time: 3.8, text: 'Chiroqlar o\'chdi...', alpha: 0.6 },
    ],
    draw: (ctx, w, h, e, dt, phase) => {
      if (phase === 'resolve') {
        const a = Math.min(1, (e - 5) * 2);
        ctx.fillStyle = `rgba(255,221,0,${a})`;
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('"Electra, shaharni qutqar!"', w / 2, 55);
        if (e > 5) {
          const p = ((e - 5) * 2) % 1;
          ctx.strokeStyle = `rgba(255,221,0,${0.15 * (1 - p)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(w / 2, h / 2, 30 + p * 60, 0, Math.PI * 2); ctx.stroke();
        }
      }
    },
  },
  traffic_light: {
    duration: 6, sky: (e, f) => ['#1a2a3a', '#0f1f2a', '#0a0a1a'],
    buildings: { count: 8, maxW: 20, maxH: 40 },
    road: true, stars: 30,
    phases: (e) => e < 2 ? 'calm' : e < 4 ? 'chaos' : 'resolve',
    text: [
      { time: 0.8, text: '🚦 Shahar chorrahasi — tartibsizlik...', alpha: 0.8 },
      { time: 2.5, text: '🚗 Mashinalar signal chalmoqda!', y: 100, alpha: 0.8 },
      { time: 4.5, text: '"Travis, tartib o\'rnat!"', size: '20px', alpha: 0.9 },
    ],
    draw: (ctx, w, h, e, dt) => {
      if (e > 2 && e < 4) {
        // Animated cars on road
        for (let i = 0; i < 3; i++) {
          const cx = ((e * 50 + i * 200) % (w + 100)) - 50;
          ctx.fillStyle = ['#ef4444', '#3b82f6', '#ffdd00'][i];
          ctx.fillRect(cx, h * 0.72 + 8, 25, 10);
          ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx + 3, h * 0.72 + 10, 5, 6);
          // Horn
          if (Math.random() > 0.97) {
            ctx.fillStyle = '#ef4444'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('📯', cx + 12, h * 0.72 + 6);
          }
        }
      }
    },
  },
  color_mixer: {
    duration: 5, sky: () => ['#0a001a', '#1a003a', '#0a0020'],
    stars: 30, ground: false,
    phases: (e) => e < 2 ? 'intro' : 'fade' ,
    text: [
      { time: 0.5, text: '🎨 Kroma shahri — ranglar yo\'qolmoqda...', alpha: 0.8 },
      { time: 3, text: '"Mira, ranglarni qaytar!"', size: '20px', alpha: 0.9 },
    ],
    draw: (ctx, w, h, e) => {
      const hue = (e * 60) % 360;
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.4);
      grad.addColorStop(0, `hsla(${hue},80%,60%,0.15)`);
      grad.addColorStop(0.5, `hsla(${(hue + 120) % 360},80%,50%,0.1)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      // Color particles
      if (e > 2) {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = `hsl(${(hue + i * 120) % 360},80%,60%)`;
          ctx.shadowColor = `hsl(${(hue + i * 120) % 360},80%,60%)`;
          ctx.shadowBlur = 15;
          const px = w / 2 + Math.cos(e * 0.5 + i * 2) * 80;
          const py = h / 2 + Math.sin(e * 0.3 + i * 2) * 60;
          ctx.beginPath(); ctx.arc(px, py, 4 + Math.sin(e * 2 + i) * 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    },
  },
  light_show: {
    duration: 5, sky: () => ['#0a0015', '#1a002a', '#0a0010'],
    ground: false, stars: 40,
    phases: () => 'show',
    text: [
      { time: 0.5, text: '🎭 StarFest — yorug\'lik yo\'q!', alpha: 0.8 },
      { time: 3, text: '"Lumina, sahnani yorit!"', size: '20px', alpha: 0.9 },
    ],
    draw: (ctx, w, h, e) => {
      // Stage spotlight
      const r = 50 + Math.sin(e * 3) * 20;
      const sg = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, r);
      sg.addColorStop(0, `rgba(255,255,255,${0.1 + 0.1 * Math.sin(e * 2)})`);
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
      // Stage beams
      for (let i = 0; i < 5; i++) {
        const a = Math.sin(e * 1.5 + i * 1.2) * 0.3;
        ctx.fillStyle = `hsla(${i * 72 + e * 30},80%,60%,0.06)`;
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.3);
        ctx.lineTo(w / 2 + Math.cos(a) * w * 0.5, h);
        ctx.lineTo(w / 2 + Math.cos(a + 0.1) * w * 0.5, h);
        ctx.fill();
      }
    },
  },
  speed_runner: {
    duration: 6, sky: () => ['#050510', '#0a0a1a', '#050510'],
    ground: false,
    phases: (e) => e < 2 ? 'calm' : e < 4 ? 'run' : 'escape',
    text: [
      { time: 0.8, text: '⛓️ Yer osti — qamalgan...', alpha: 0.75 },
      { time: 2.5, text: '🏃 Tunnel bo\'ylab yugur!', y: 100, size: '22px', alpha: 0.9 },
      { time: 5, text: '"Nova, chiqish yo\'lini top!"', size: '20px', alpha: 0.9 },
    ],
    draw: (ctx, w, h, e, dt) => {
      // Tunnel walls
      const speed = e > 2 ? (e - 2) * 40 : 0;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, h * 0.15, w, h * 0.7);
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
      ctx.strokeRect(0, h * 0.15, w, h * 0.7);
      // Running lights
      for (let i = 0; i < 10; i++) {
        const lx = (i * 80 - speed) % (w + 80);
        const lit = (Math.floor((i * 80 - speed) / 40) % 2) === 0;
        ctx.fillStyle = lit ? '#ffdd00' : '#1e293b';
        ctx.shadowColor = lit ? '#ffdd00' : 'transparent';
        ctx.shadowBlur = lit ? 8 : 0;
        ctx.fillRect(lx, h * 0.16, 6, 4);
        ctx.shadowBlur = 0;
      }
      // Ground line
      ctx.strokeStyle = '#00f5ff'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const yy = h * 0.82 + Math.sin((x + speed) * 0.02) * 5;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    },
  },
};

// Fallback generic cutscene for games without a specific config
function GenericCutscene({ gameType, onComplete, skipable }) {
  const scene = cutsceneScenes[gameType];
  if (scene) return <CutscenePlayer scene={scene} onComplete={onComplete} skipable={skipable} />;
  // Generic fallback
  return (
    <div className="absolute inset-0 z-20 bg-dark-950 flex items-center justify-center" onClick={skipable ? onComplete : undefined}>
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-4 animate-float">{stories[gameType]?.heroEmoji || '🎮'}</div>
        <p className="text-dark-400">Tayyormisiz?</p>
        <button onClick={onComplete} className="btn-primary mt-6">Boshlash</button>
      </div>
    </div>
  );
}
function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = canvas.parentElement?.clientHeight || 500;

    // Generate confetti
    const colors = ['#ff00e5','#00f5ff','#ffdd00','#00ff88','#9900ff','#ff6600','#6366f1','#ef4444'];
    particles.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 4 + Math.random() * 6,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: 1 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
    }));

    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;
  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
  );
}

const heroEmojis = {
  electra: '⚡', travis: '🚦', mira: '🎨', lumina: '💡', kodi: '🕵️',
  nova: '🏃', sonar: '🎵', flora: '🌱', radar: '📡', quick: '⚡',
  mech: '🦾', melody: '🎹', agri: '🌿', parker: '🚗', cosmo: '☄️',
  guardian: '🔒', spectra: '🎵', link: '📶', polar: '🌍', home: '🏠'
};

const stories = {
  energy_city: {
    title: 'So\'nggi chiroq',
    hero: 'Electra',
    heroEmoji: '⚡',
    role: 'Energiya muhandisi',
    mission: 'Shahar zulmatga botgan. LED, tugma va potensiometr yordamida energiya tizimini tiklang!',
    problem: '🏙️ Shahar qorong\'i',
    solution: '💡 LED bilan shaharni yoriting',
    climax: 'Shahar to\'liq yorishdi! Sen — qahramonsan!',
  },
  traffic_light: {
    title: 'Chorrahadagi xaos',
    hero: 'Travis',
    heroEmoji: '🚦',
    role: 'Yo\'l harakat muhandisi',
    mission: '3 ta LED orqali svetaforni boshqarib, chorrahada tartib o\'rnating!',
    problem: '🚗 Chorraha tartibsiz',
    solution: '🔴🟡🟢 Svetafor bilan tartib',
    climax: 'Chorraha tartibga keldi! Sen — shahar qutqaruvchisisan!',
  },
  color_mixer: {
    title: 'Sehrgar ustaxonasi',
    hero: 'Mira',
    heroEmoji: '🎨',
    role: 'Ranglar shogirdi',
    mission: '3 potensiometr bilan ranglarni aralashtirib, dunyoga ranglarni qaytaring!',
    problem: '🌫️ Dunyo rangsiz',
    solution: '🎨 RGB bilan ranglar yaratish',
    climax: 'Ranglar qaytdi! Sen — chinakam sehrgarsan!',
  },
  light_show: {
    title: 'Yulduz sahnasi',
    hero: 'Lumina',
    heroEmoji: '💡',
    role: 'DJ',
    mission: 'LED patternlar bilan tomoshabinlarni hayratda qoldiring!',
    problem: '🎭 Sahnada yorug\'lik yo\'q',
    solution: '💡 LED shou bilan tomoshabinlarni hayratlantir',
    climax: 'StarFest saqlab qolindi! Sen — galaktika yulduzisan!',
  },
  speed_runner: {
    title: 'Tunnel qochuvi',
    hero: 'Nova',
    heroEmoji: '🏃',
    role: 'Muhandis',
    mission: 'Potensiometr bilan tezlikni boshqarib, to\'siqlardan qochib tashqariga chiqing!',
    problem: '⛓️ Yer osti bloklangan',
    solution: '🏃 Tunnel orqali qochish',
    climax: 'Chiqish eshigi! Sen erkinsan!',
  },
  light_theremin: {
    title: 'Yorug\'lik simfoniyasi',
    hero: 'Sonar',
    heroEmoji: '🎵',
    role: 'Bosh muhandis',
    mission: 'LDR va buzzer yordamida yorug\'lik orqali aloqa chastotasini toping!',
    problem: '📡 Kosmik aloqa uzilgan',
    solution: '🔦 Yorug\'lik bilan signal yuborish',
    climax: 'Aloqa o\'rnatildi! Kemangiz xavfsiz!',
  },
  temp_garden: {
    title: 'Oxirgi bog\'',
    hero: 'Flora',
    heroEmoji: '🌱',
    role: 'Botanik-muhandis',
    mission: 'Haroratni 20-30°C oralig\'ida ushlab, yer yuzidagi oxirgi bog\'ni saqlang!',
    problem: '🌍 Yadro qishidan keyin',
    solution: '🌡️ Haroratni boshqarish',
    climax: 'Bog\' tiklangan! Yerdagi so\'nggi bog\' saqlab qolindi!',
  },
  distance_radar: {
    title: 'Ko\'rinmas dushman',
    hero: 'Radar',
    heroEmoji: '📡',
    role: 'Harbiy muhandis',
    mission: 'Ultrasonic sensor bilan radar yasab, noma\'lum ob\'ektlarni aniqlang!',
    problem: '🎯 Baza atrofida noma\'lum obyektlar',
    solution: '📡 Radar bilan skanerlash',
    climax: '5 ta obyekt aniqlandi! Baza xavfsiz!',
  },
  reaction_champion: {
    title: 'Reaksiya turniri',
    hero: 'Quick',
    heroEmoji: '⚡',
    role: 'Texnik klub rahbari',
    mission: '2 tugma va LED bilan reaksiya o\'lchagich yasab, eng tezkor o\'quvchini aniqlang!',
    problem: '🏆 Musobaqa uskunasi ishlamaydi',
    solution: '⚡ Reaksiya o\'lchagich qurish',
    climax: 'Eng tezkor aniqlandi! Sen — ixtirochisan!',
  },
  robot_arm: {
    title: 'Zaharlı quti',
    hero: 'Mech',
    heroEmoji: '🦾',
    role: 'Robototexnik',
    mission: 'Servo va potensiometr bilan robot qo\'l yasab, radioaktiv materialni xavfsiz joyga oling!',
    problem: '☢️ Laboratoriyada radioaktiv material',
    solution: '🦾 Robot qo\'l bilan yig\'ish',
    climax: 'Material xavfsiz! Laboratoriya qutqarildi!',
  },
  piano_player: {
    title: 'Notalar afsonasi',
    hero: 'Melody',
    heroEmoji: '🎹',
    role: 'Musiqachi-ixtirochi',
    mission: '4 tugma va buzzer bilan pianino yasab, "Twinkle Twinkle" kuyini chaling!',
    problem: '🎹 Musobaqa pianinosi buzilgan',
    solution: '🔘 Tugmalar bilan nota chalish',
    climax: 'Mukammal ijro! Sen — Notalar Afsonasisan!',
  },
  parking_assistant: {
    title: 'Birinchi haydovchilik',
    hero: 'Parker',
    heroEmoji: '🚗',
    role: 'Yangi haydovchi',
    mission: 'Ultrasonic sensor bilan parking assistent yasab, imtihondan o\'ting!',
    problem: '📋 Haydovchilik imtihoni',
    solution: '📡 Sensor bilan masofani o\'lchash',
    climax: 'Mukammal parking! Imtihon topshirildi!',
  },
  motion_alarm: {
    title: 'Tungi qo\'riqchi',
    hero: 'Guardian',
    heroEmoji: '🔒',
    role: 'Xavfsizlik mutaxassisi',
    mission: 'PIR sensor va buzzer bilan harakat detektori yasab, muzeydagi o\'g\'irlikni oldini oling!',
    problem: '🏛️ Muzeyda o\'g\'irlik bo\'lishi mumkin',
    solution: '🔔 PIR sensor bilan qo\'riqlash',
    climax: '10 ta urinish — 10 ta muvaffaqiyat! Olmos xavfsiz!',
  },
  music_visualizer: {
    title: 'Ovoz ranglari',
    hero: 'Spectra',
    heroEmoji: '🎵',
    role: 'Vizual ijodkor',
    mission: 'Potensiometr va LEDlar bilan musiqa vizualizatorini yasang!',
    problem: '🎵 Klubda vizual effektlar yo\'q',
    solution: '🎚️ Potensiometr bilan chastota boshqaruvi',
    climax: 'Klub portladi! Sen — eng zo\'r vizual ijodkor!',
  },
  obstacle_course: {
    title: 'Kosmik qalqon',
    hero: 'Cosmo',
    heroEmoji: '☄️',
    role: 'Stansiya kapitani',
    mission: 'Potensiometr va tugma bilan meteoritlardan himoyalaning!',
    problem: '☄️ Meteoritlar stansiyaga yaqinlashmoqda',
    solution: '🛡️ Qalqonni boshqarish',
    climax: 'Meteoritlar qaytarildi! Stansiya xavfsiz!',
  },
  weather_station: {
    title: 'Ob-havo stansiyasi', 
    hero: 'Forecast',
    heroEmoji: '🌤️',
    role: 'Meteorolog',
    mission: 'Sensorlar bilan ob-havoni kuzating',
    problem: '🌪️ Ob-havo ma\'lumoti kerak',
    solution: '🌡️ Sensorlar bilan monitoring',
    climax: 'Ma\'lumotlar to\'plandi!',
  },
  iot_dashboard: {
    title: 'WiFi qutqaruvi',
    hero: 'Link',
    heroEmoji: '📶',
    role: 'Favqulodda vaziyat mutaxassisi',
    mission: 'ESP8266 va Firebase orqali avariya monitoring tizimini yo\'lga qo\'ying!',
    problem: '🌊 Zilzilada aloqa uzilgan',
    solution: '📡 ESP8266 → Firebase orqali aloqa',
    climax: 'Aloqa tiklandi! Shahar qutqarildi!',
  },
  remote_sensor: {
    title: 'Global kuzatuv',
    hero: 'Polar',
    heroEmoji: '🌍',
    role: 'Iqlimshunos olim',
    mission: 'ESP32 va sensorlar bilan Antarktida da global sensor stansiyasini o\'rnating!',
    problem: '🧊 Global isish ma\'lumoti kerak',
    solution: '🛰️ ESP32 → Firebase global sync',
    climax: 'Global tarmoq ishga tushdi!',
  },
  smart_home: {
    title: 'Kelajak uyi',
    hero: 'Home',
    heroEmoji: '🏠',
    role: 'Aqlli uy arxitektori',
    mission: 'ESP32 va Firebase bilan aqlli uyni sozlang. Energiya sarfini optimallashtiring!',
    problem: '🏠 Uy aqlli emas',
    solution: '🔧 ESP32 → Firebase bilan boshqarish',
    climax: 'Aqlli uy to\'liq ishga tushdi! Sen — STEMVERSE chempionisan!',
  },
};

export default function StoryMission({ gameType, onStart, showIntro = true }) {
  const story = stories[gameType] || stories.energy_city;
  const hasCutscene = true; // All 20 games have animated cutscenes
  const [phase, setPhase] = useState(showIntro ? (hasCutscene ? 'cutscene' : 'intro') : 'playing');
  const [typing, setTyping] = useState('');
  const [typingIdx, setTypingIdx] = useState(0);

  const missionText = story.mission;

  useEffect(() => {
    if (phase !== 'intro') return;
    if (typingIdx < missionText.length) {
      const timer = setTimeout(() => {
        setTyping(prev => prev + missionText[typingIdx]);
        setTypingIdx(idx => idx + 1);
      }, 25);
      return () => clearTimeout(timer);
    }
  }, [phase, typingIdx]);

  const handleStart = () => {
    setPhase('playing');
    if (onStart) onStart();
  };

  const handleCutsceneDone = () => {
    setPhase('intro');
  };

  if (phase === 'playing') return null;

  // Cutscene phase
  if (phase === 'cutscene') {
    return (
      <div className="absolute inset-0 z-30 bg-dark-950">
        <GenericCutscene gameType={gameType} onComplete={handleCutsceneDone} skipable={true} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-dark-950/90 backdrop-blur-sm animate-fade-in">
      <div className="max-w-lg w-full mx-4">
        {/* Hero avatar */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-3
                        shadow-lg shadow-brand-500/30 animate-float">
            <span className="text-4xl">{story.heroEmoji}</span>
          </div>
          <h1 className="font-game text-3xl text-white mb-1">{story.title}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="badge-level text-xs">{story.role}</span>
          </div>
        </div>

        {/* Mission card */}
        <div className="card-glow mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">{story.problem.split(' ')[0]}</div>
            <div>
              <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">MUAMMO</p>
              <p className="text-white font-semibold">{story.problem}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">{story.solution.split(' ')[0]}</div>
            <div>
              <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">YECHIM</p>
              <p className="text-white font-semibold">{story.solution}</p>
            </div>
          </div>

          <div className="border-t border-dark-700 pt-4 mt-4">
            <p className="text-xs text-dark-400 uppercase tracking-wider mb-2">MISSIYA</p>
            <div className="min-h-[60px]">
              <p className="text-dark-200 leading-relaxed">
                {typing}
                {typingIdx < missionText.length && <span className="animate-pulse text-brand-400">|</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Start button */}
        {typingIdx >= missionText.length && (
          <button
            onClick={handleStart}
            className="btn-primary w-full flex items-center justify-center gap-2 animate-slide-up"
          >
            <Zap className="w-5 h-5" />
            Missiyani boshlash
          </button>
        )}
      </div>
    </div>
  );
}

// Story victory component
export function StoryVictory({ gameType, score, xpEarned, onContinue }) {
  const story = stories[gameType] || stories.energy_city;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm animate-fade-in">
      <ConfettiCanvas active={true} />
      <div className="max-w-md w-full mx-4 text-center animate-slide-up relative z-20">
        <div className="text-6xl mb-4 animate-bounce-slow">{story.heroEmoji}</div>
        <h2 className="font-game text-3xl text-white mb-2">Missiya bajarildi! 🎉</h2>
        <p className="text-dark-300 mb-2">{story.climax}</p>

        <div className="card-glow my-6">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-game text-neon-green">{score}</p>
              <p className="text-xs text-dark-400">Ball</p>
            </div>
            <div className="text-dark-600 text-2xl">+</div>
            <div className="text-center">
              <p className="text-3xl font-game text-brand-400">{xpEarned}</p>
              <p className="text-xs text-dark-400">XP</p>
            </div>
          </div>
        </div>

        <button onClick={onContinue} className="btn-primary w-full">
          Davom etish →
        </button>
      </div>
    </div>
  );
}
