import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.post('/complete', authenticate, async (req, res) => {
  try {
    const { lessonId, score } = req.body;
    if (!lessonId) return res.status(400).json({ error: 'Lesson ID required' });
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    
    const existing = await prisma.userProgress.findUnique({ where: { userId_lessonId: { userId: req.user.id, lessonId } } });
    
    // ⚠️ Only add XP if lesson wasn't already completed
    const alreadyCompleted = existing?.completed === true;
    
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId } },
      create: { userId: req.user.id, lessonId, completed: true, score: score || 0, completedAt: new Date() },
      update: { completed: true, score: Math.max(score || 0, existing?.score || 0), completedAt: existing?.completedAt || new Date() },
    });
    
    let xpEarned = 0;
    if (!alreadyCompleted) {
      // Award XP only for first completion
      await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: lesson.xpReward } } });
      xpEarned = lesson.xpReward;
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const newLevel = Math.floor(user.xp / 200) + 1;
    if (newLevel > user.level) await prisma.user.update({ where: { id: req.user.id }, data: { level: newLevel } });
    
    const newAchievements = await checkAchievements(req.user.id);
    res.json({ progress, xpEarned, leveledUp: newLevel > user.level, newLevel, newAchievements });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/overview', authenticate, async (req, res) => {
  try {
    const total = await prisma.lesson.count({ where: { published: true } });
    const completed = await prisma.userProgress.count({ where: { userId: req.user.id, completed: true } });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ totalLessons: total, completedLessons: completed, xp: user.xp, level: user.level, progress: total > 0 ? Math.round(completed / total * 100) : 0 });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

async function checkAchievements(userId) {
  const earned = [];
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { achievements: true, progress: true } });
  const all = await prisma.achievement.findMany();
  const earnedIds = new Set(user.achievements.map(a => a.achievementId));
  for (const a of all) {
    if (earnedIds.has(a.id)) continue;
    let shouldEarn = false;
    if (a.condition?.type === 'first_lesson') shouldEarn = user.progress.some(p => p.completed);
    else if (a.condition?.type === 'lessons_completed') shouldEarn = user.progress.filter(p => p.completed).length >= (a.condition.count || 1);
    else if (a.condition?.type === 'xp_reached') shouldEarn = user.xp >= (a.condition.xp || 0);
    else if (a.condition?.type === 'kit_activated') { const k = await prisma.kit.findFirst({ where: { userId } }); shouldEarn = !!k; }
    if (shouldEarn) {
      await prisma.userAchievement.create({ data: { userId, achievementId: a.id } });
      await prisma.user.update({ where: { id: userId }, data: { xp: { increment: a.xpReward } } });
      earned.push({ id: a.id, title: a.title, xpReward: a.xpReward });
    }
  }
  return earned;
}

export default router;