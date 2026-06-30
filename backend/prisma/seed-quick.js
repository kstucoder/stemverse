import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Quick seeding...');
  // Create users
  const ap = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({ where: { email: 'admin@voltra.io' }, update: {}, create: { name: 'Admin', email: 'admin@voltra.io', password: ap, role: 'ADMIN', xp: 9999, level: 50 } });
  const sp = await bcrypt.hash('student123', 12);
  await prisma.user.upsert({ where: { email: 'student@voltra.io' }, update: {}, create: { name: 'Demo Student', email: 'student@voltra.io', password: sp, role: 'STUDENT', xp: 150, level: 1 } });
  const tp = await bcrypt.hash('teacher123', 12);
  await prisma.user.upsert({ where: { email: 'teacher@voltra.io' }, update: {}, create: { name: 'Ms. Karimova', email: 'teacher@voltra.io', password: tp, role: 'TEACHER', xp: 0, level: 1 } });
  console.log('✓ Users');
  
  // Create 3 sample lessons
  const lessons = [
    { id: 'lesson_1', title: 'Blink the LED', description: 'Learn to blink an LED!', level: 1, order: 1, components: ['Arduino Uno','LED','220Ω'], codeExample: 'void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(1000);digitalWrite(13,LOW);delay(1000);}', gameConfig: { gameType: 'energy_city' }, winCondition: { type: 'led_blink_count', count: 5 }, xpReward: 50, published: true },
    { id: 'lesson_2', title: 'Traffic Light', description: 'Build a traffic light!', level: 1, order: 2, components: ['3 LEDs','3x220Ω','Button'], codeExample: 'void setup(){pinMode(13,OUTPUT);pinMode(12,OUTPUT);pinMode(11,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(3000);digitalWrite(13,LOW);digitalWrite(12,HIGH);delay(1000);digitalWrite(12,LOW);digitalWrite(11,HIGH);delay(3000);digitalWrite(11,LOW);}', gameConfig: { gameType: 'traffic_light' }, winCondition: { type: 'cycles_completed', count: 10 }, xpReward: 75, published: true },
    { id: 'lesson_3', title: 'Color Magic', description: 'Mix colors with RGB!', level: 1, order: 3, components: ['RGB LED','3x220Ω','3xPOT'], codeExample: 'void setup(){pinMode(9,OUTPUT);pinMode(10,OUTPUT);pinMode(11,OUTPUT);Serial.begin(9600);}\nvoid loop(){analogWrite(9,analogRead(A0)/4);analogWrite(10,analogRead(A1)/4);analogWrite(11,analogRead(A2)/4);delay(100);}', gameConfig: { gameType: 'color_mixer' }, winCondition: { type: 'power_reached', value: 900 }, xpReward: 100, published: true },
  ];
  for (const l of lessons) {
    await prisma.lesson.upsert({ where: { id: l.id }, update: {}, create: l });
    console.log(`  ✓ ${l.title}`);
  }
  
  // Create achievements
  const achievements = [
    { id: 'first_circuit', title: 'First Circuit', description: 'Complete your first lesson', icon: '🔌', xpReward: 50, condition: { type: 'first_lesson' } },
    { id: 'kit_activated', title: 'Kit Activated', description: 'Activate your VOLTRA kit', icon: '🎮', xpReward: 50, condition: { type: 'kit_activated' } },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { id: a.id }, update: {}, create: a });
  }
  console.log('✓ Achievements');
  
  // Create activation codes
  for (let i = 1; i <= 5; i++) {
    await prisma.activationCode.upsert({ where: { code: 'SV-DEMO-' + String(i).padStart(3, '0') }, update: {}, create: { code: 'SV-DEMO-' + String(i).padStart(3, '0') } });
  }
  console.log('✓ Activation codes');
  console.log('\n✅ Done!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
