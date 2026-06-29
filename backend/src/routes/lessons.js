import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'TEACHER';
    const where = isAdmin ? {} : { published: true };
    const lessons = await prisma.lesson.findMany({ where, orderBy: { order: 'asc' }, select: { id: true, title: true, description: true, level: true, order: true, components: true, xpReward: true, published: true, circuitDiagram: true } });
    const progress = await prisma.userProgress.findMany({ where: { userId: req.user.id, lessonId: { in: lessons.map(l => l.id) } } });
    const pm = {};
    progress.forEach(p => { pm[p.lessonId] = { completed: p.completed, score: p.score }; });
    
    // Progressive unlock: required student level for each lesson level
    const unlockLevel = { 1: 1, 2: 3, 3: 6, 4: 11 };
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const studentLevel = user?.level || 1;
    
    res.json(lessons.map(l => ({
      ...l,
      progress: pm[l.id] || { completed: false, score: 0 },
      locked: isAdmin ? false : studentLevel < (unlockLevel[l.level] || 1),
    })));
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    if (!lesson.published && req.user.role === 'STUDENT') return res.status(403).json({ error: 'Not available' });
    const progress = await prisma.userProgress.findUnique({ where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } } });
    
    // Check if locked
    const unlockLevel = { 1: 1, 2: 3, 3: 6, 4: 11 };
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const locked = req.user.role === 'STUDENT' && (user?.level || 1) < (unlockLevel[lesson.level] || 1);
    
    res.json({ ...lesson, progress, locked });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;