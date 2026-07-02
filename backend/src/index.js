import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import kitRoutes from './routes/kit.js';
import lessonRoutes from './routes/lessons.js';
import achievementRoutes from './routes/achievements.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teacher.js';
import orderRoutes from './routes/orders.js';
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
  origin: function (origin, cb) {
    const allowed = [
      'http://localhost:5173',
      'https://voltrauz.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(null, { origin: true });
    cb(null, { origin: true });
  },
  credentials: true,
}));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/kit', kitRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/orders', orderRoutes);

// Database seed endpoint — only allowed outside production
app.post('/api/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Seed is disabled in production. Set NODE_ENV=development to enable.' });
  }
  try {
    const bcrypt = (await import('bcryptjs')).default;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Users
    const ap = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({ where: { email: 'admin@voltra.io' }, update: {}, create: { name: 'Admin', email: 'admin@voltra.io', password: ap, role: 'ADMIN', xp: 9999, level: 50 } });
    const sp = await bcrypt.hash('student123', 12);
    await prisma.user.upsert({ where: { email: 'student@voltra.io' }, update: {}, create: { name: 'Demo Student', email: 'student@voltra.io', password: sp, role: 'STUDENT', xp: 150, level: 1 } });
    const tp = await bcrypt.hash('teacher123', 12);
    await prisma.user.upsert({ where: { email: 'teacher@voltra.io' }, update: {}, create: { name: 'Ms. Karimova', email: 'teacher@voltra.io', password: tp, role: 'TEACHER', xp: 0, level: 1 } });
    
    // Reset demo student XP
    await prisma.user.update({ where: { email: 'student@voltra.io' }, data: { xp: 0, level: 1 } });
    // Clear old progress and achievements
    const student = await prisma.user.findUnique({ where: { email: 'student@voltra.io' } });
    if (student) {
      await prisma.userProgress.deleteMany({ where: { userId: student.id } });
      await prisma.userAchievement.deleteMany({ where: { userId: student.id } });
    }

    // Activation codes
    for (let i = 1; i <= 10; i++) {
      await prisma.activationCode.upsert({ where: { code: 'SV-DEMO-' + String(i).padStart(3, '0') }, update: {}, create: { code: 'SV-DEMO-' + String(i).padStart(3, '0') } });
    }

    // Achievements (Uzbek) — title va description doim yangilanadi
    const achievements = [
      { id: 'first_circuit', title: "Birinchi Sxema", description: "Birinchi darsni tugating", icon: '\uD83D\uDD0C', xpReward: 50, condition: { type: 'first_lesson' } },
      { id: 'led_master', title: "LED Ustasi", description: '3 ta LED darsini tugating', icon: '\uD83D\uDCA1', xpReward: 100, condition: { type: 'lessons_completed', count: 3 } },
      { id: 'kit_activated', title: "To'plam Faollashtirildi", description: "VOLTRA to'plamini faollashtiring", icon: '\uD83C\uDFAE', xpReward: 50, condition: { type: 'kit_activated' } },
      { id: 'sensor_expert', title: "Sensor Mutaxassisi", description: '5 ta sensor darsini tugating', icon: '\uD83D\uDCE1', xpReward: 150, condition: { type: 'lessons_completed', count: 5 } },
      { id: 'speed_demon', title: "Tezlik Demon", description: "Tezlik Poygasi darsini tugating", icon: '\uD83C\uDFC3', xpReward: 100, condition: { type: 'lessons_completed', count: 6 } },
      { id: 'music_maestro', title: "Musiqa Ustasi", description: "Musiqa komponentlari bilan o'ynang", icon: '\uD83C\uDFB5', xpReward: 100, condition: { type: 'lessons_completed', count: 7 } },
      { id: 'robot_builder', title: "Robot Quruvchi", description: "Robot Qo'l darsini tugating", icon: '\uD83E\uDDBE', xpReward: 150, condition: { type: 'lessons_completed', count: 11 } },
      { id: 'xp_collector', title: "XP Yig'uvchi", description: "500 XP to'plang", icon: '\uD83C\uDFC6', xpReward: 250, condition: { type: 'xp_reached', xp: 500 } },
      { id: 'engineer_5', title: "Muhandis 5-daraja", description: "5-darajaga yeting", icon: '\u2B50', xpReward: 200, condition: { type: 'xp_reached', xp: 1000 } },
      { id: 'master_engineer', title: "Bosh Muhandis", description: 'Barcha 20 darsni tugating', icon: '\uD83D\uDC51', xpReward: 500, condition: { type: 'lessons_completed', count: 20 } },
    ];
    for (const a of achievements) { await prisma.achievement.upsert({ where: { id: a.id }, update: { title: a.title, description: a.description, icon: a.icon }, create: a }); }

    // Lessons (Uzbek)
    const lessons = [
      { id: 'lesson_1', title: "LEDni Yondirish", description: "Arduino yordamida LEDni yondirishni o'rganing!", level: 1, order: 1, components: ['Arduino Uno','LED','220\u03A9','Breadboard','Simlar'], codeExample: 'void setup(){pinMode(13,OUTPUT);Serial.begin(9600);}\nvoid loop(){digitalWrite(13,HIGH);Serial.println("LED:1");delay(1000);digitalWrite(13,LOW);Serial.println("LED:0");delay(1000);}', gameConfig: { gameType: 'energy_city', title: "Energy City - Chiroqlar Yonadi!" }, winCondition: { type: 'led_blink_count', count: 5 }, xpReward: 50, published: true },
      { id: 'lesson_2', title: "Svetafor Boshqaruvi", description: "3 xil LED bilan svetafor yasang!", level: 1, order: 2, components: ['Arduino Uno','3xLED','3x220\u03A9','Tugma','Simlar'], codeExample: 'void setup(){pinMode(13,OUTPUT);pinMode(12,OUTPUT);pinMode(11,OUTPUT);pinMode(2,INPUT);Serial.begin(9600);}\nvoid loop(){int b=digitalRead(2);if(b==1){Serial.println("BTN:1");}digitalWrite(13,HIGH);Serial.println("STATE:RED");delay(3000);digitalWrite(13,LOW);digitalWrite(12,HIGH);Serial.println("STATE:YELLOW");delay(1000);digitalWrite(12,LOW);digitalWrite(11,HIGH);Serial.println("STATE:GREEN");delay(3000);digitalWrite(11,LOW);}', gameConfig: { gameType: 'traffic_light', title: "Svetafor Challenge" }, winCondition: { type: 'cycles_completed', count: 10 }, xpReward: 75, published: true },
      { id: 'lesson_3', title: "RGB Ranglar Sehri", description: "3 potensiometr bilan ranglarni aralashtiring!", level: 1, order: 3, gameConfig: { gameType: 'color_mixer', title: "Ranglar Sehri" }, winCondition: { type: 'power_reached', value: 900 }, xpReward: 100, published: true },
      { id: 'lesson_4', title: "Yorug'lik Shousi", description: "LED'lar bilan yorug'lik patternlarini yarating!", level: 1, order: 4, gameConfig: { gameType: 'light_show', title: "Yorug'lik Shousi" }, winCondition: { type: 'dances_completed', count: 3 }, xpReward: 100, published: true },
      { id: 'lesson_5', title: "Maxfiy Kodli Eshik", description: "Tugma bilan maxfiy kodli qulf yarating!", level: 1, order: 5, gameConfig: { gameType: 'secret_code', title: "Maxfiy Kodli Eshik" }, winCondition: { type: 'dances_completed', count: 1 }, xpReward: 125, published: true },
      { id: 'lesson_6', title: "Tezlik Poygasi", description: "Potensiometr bilan yuguruvchini boshqaring!", level: 2, order: 6, gameConfig: { gameType: 'speed_runner', title: "Tezlik Poygasi" }, winCondition: { type: 'distance_reached', value: 1000 }, xpReward: 150, published: true },
      { id: 'lesson_7', title: "Yorug'lik Theremini", description: "LDR sensor bilan yorug'lik orqali musiqa yarating!", level: 2, order: 7, gameConfig: { gameType: 'light_theremin', title: "Yorug'lik Theremini" }, winCondition: { type: 'power_reached', value: 800 }, xpReward: 150, published: true },
      { id: 'lesson_8', title: "Harorat Bog'i", description: "Haroratni kuzatib, virtual bog'ingizni saqlang!", level: 2, order: 8, gameConfig: { gameType: 'temp_garden', title: "Harorat Bog'i" }, winCondition: { type: 'time_alive', value: 30000 }, xpReward: 175, published: true },
      { id: 'lesson_9', title: "Masofa Radari", description: "Ultrasonic sensor bilan masofani o'lchang!", level: 2, order: 9, gameConfig: { gameType: 'distance_radar', title: "Masofa Radari" }, winCondition: { type: 'power_reached', value: 950 }, xpReward: 175, published: true },
      { id: 'lesson_10', title: "Reaksiya Chempioni", description: "Ikki o'yinchili reaksiya musobaqasi!", level: 2, order: 10, gameConfig: { gameType: 'reaction_champion', title: "Reaksiya Chempioni" }, winCondition: { type: 'cycles_completed', count: 5 }, xpReward: 200, published: true },
      { id: 'lesson_11', title: "Robot Qo'l Boshqaruvi", description: "Servo motorli robot qo'lini boshqaring!", level: 3, order: 11, gameConfig: { gameType: 'robot_arm', title: "Robot Qo'l" }, winCondition: { type: 'targets_collected', count: 3 }, xpReward: 225, published: true },
      { id: 'lesson_12', title: "Piano Chalish", description: "4 tugma bilan pianino chalishni o'rganing!", level: 3, order: 12, gameConfig: { gameType: 'piano_player', title: "Piano" }, winCondition: { type: 'dances_completed', count: 2 }, xpReward: 225, published: true },
      { id: 'lesson_13', title: "Aqlli Issiqxona", description: "Harorat va namlikni kuzatib, o'simliklarni saqlang!", level: 3, order: 13, gameConfig: { gameType: 'temp_garden', title: "Aqlli Issiqxona" }, winCondition: { type: 'time_alive', value: 60000 }, xpReward: 250, published: true },
      { id: 'lesson_14', title: "Parking Yordamchisi", description: "Ultrasonic sensor bilan mashinani park qiling!", level: 3, order: 14, gameConfig: { gameType: 'parking_assistant', title: "Parking Yordamchisi" }, winCondition: { type: 'cycles_completed', count: 5 }, xpReward: 250, published: true },
      { id: 'lesson_15', title: "Meteordan Himoya", description: "Bazangizni meteorlardan himoya qiling!", level: 3, order: 15, gameConfig: { gameType: 'obstacle_course', title: "Meteordan Himoya" }, winCondition: { type: 'distance_reached', value: 500 }, xpReward: 275, published: true },
      { id: 'lesson_16', title: "Xavfsizlik Tizimi", description: "PIR sensor bilan xavfsizlik tizimini yarating!", level: 4, order: 16, gameConfig: { gameType: 'motion_alarm', title: "Xavfsizlik Tizimi" }, winCondition: { type: 'cycles_completed', count: 10 }, xpReward: 300, published: true },
      { id: 'lesson_17', title: "Musiqa Vizualizatori", description: "Potensiometr bilan musiqani vizual ko'ring!", level: 4, order: 17, gameConfig: { gameType: 'music_visualizer', title: "Musiqa Vizualizatori" }, winCondition: { type: 'dances_completed', count: 3 }, xpReward: 300, published: true },
      { id: 'lesson_18', title: "IoT Dashboard", description: "ESP8266 WiFi orqali sensor ma'lumotlarini bulutga yuboring!", level: 4, order: 18, gameConfig: { gameType: 'iot_dashboard', title: "IoT Dashboard" }, winCondition: { type: 'targets_collected', count: 5 }, xpReward: 400, published: true },
      { id: 'lesson_19', title: "Masofaviy Sensor", description: "ESP32 bilan global sensor stansiyasini o'rnating!", level: 4, order: 19, gameConfig: { gameType: 'remote_sensor', title: "Masofaviy Sensor" }, winCondition: { type: 'time_alive', value: 60000 }, xpReward: 450, published: true },
      { id: 'lesson_20', title: "Aqlli Uy", description: "ESP32 bilan aqlli uyni Firebase orqali boshqaring!", level: 4, order: 20, gameConfig: { gameType: 'smart_home', title: "Aqlli Uy" }, winCondition: { type: 'targets_collected', count: 5 }, xpReward: 500, published: true },
    ];
    for (const l of lessons) { await prisma.lesson.upsert({ where: { id: l.id }, update: { title: l.title, description: l.description }, create: l }); }

    await prisma.$disconnect();
    res.json({ success: true, message: 'Database seeded with Uzbek lessons!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });
if (process.env.NODE_ENV !== 'vercel') {
  app.listen(PORT, () => console.log('VOLTRA API on http://localhost:' + PORT));
}
export default app;