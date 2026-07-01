import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import crypto from 'crypto';
const router = Router();
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.post('/lessons', async (req, res) => {
  try {
    const { title, description, level, order, circuitDiagram, components, codeExample, gameConfig, winCondition, xpReward } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
    const lesson = await prisma.lesson.create({ data: { title, description, level: level || 1, order: order || 0, circuitDiagram, components: components || [], codeExample, gameConfig: gameConfig || {}, winCondition: winCondition || {}, xpReward: xpReward || 50 } });
    res.status(201).json(lesson);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/lessons/:id', async (req, res) => {
  try {
    const updates = req.body;
    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data: updates });
    res.json(lesson);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await prisma.userProgress.deleteMany({ where: { lessonId: req.params.id } });
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.post('/codes/generate', async (req, res) => {
  try {
    const { count = 10 } = req.body;
    const codes = [];
    for (let i = 0; i < count; i++) codes.push({ code: 'SV-' + crypto.randomBytes(4).toString('hex').toUpperCase() });
    await prisma.activationCode.createMany({ data: codes });
    res.status(201).json({ generated: count });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/codes', async (req, res) => {
  try {
    const codes = await prisma.activationCode.findMany({ orderBy: { createdAt: 'desc' }, include: { usedBy: { select: { id: true, name: true, email: true } } } });
    res.json(codes);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const [tu, ts, tt, tl, pl, tk, ak, cl, tc, uc, to, po] = await Promise.all([
      prisma.user.count(), prisma.user.count({ where: { role: 'STUDENT' } }), prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.lesson.count(), prisma.lesson.count({ where: { published: true } }), prisma.kit.count(),
      prisma.kit.count({ where: { userId: { not: null } } }), prisma.userProgress.count({ where: { completed: true } }),
      prisma.activationCode.count(), prisma.activationCode.count({ where: { used: true } }),
      prisma.order.count(), prisma.order.count({ where: { status: 'PENDING' } }),
    ]);
    res.json({ users: { total: tu, students: ts, teachers: tt }, lessons: { total: tl, published: pl }, kits: { total: tk, activated: ak }, progress: { completedLessons: cl }, codes: { total: tc, used: uc }, orders: { total: to, pending: po } });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, xp: true, level: true, createdAt: true, kits: true, _count: { select: { progress: true } } }, orderBy: { createdAt: "desc" } });
    res.json(users);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/teachers', async (req, res) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true, name: true, email: true, createdAt: true,
        _count: { select: { classrooms: true } },
        classrooms: {
          select: {
            id: true, name: true, inviteCode: true,
            _count: { select: { students: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(teachers);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;