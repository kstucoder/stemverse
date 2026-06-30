import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.post('/activate', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Activation code required' });
    const ac = await prisma.activationCode.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!ac) return res.status(404).json({ error: 'Invalid activation code' });
    if (ac.used) return res.status(409).json({ error: 'Code already used' });
    const existingKit = await prisma.kit.findFirst({ where: { userId: req.user.id } });
    if (existingKit) return res.status(409).json({ error: 'You already have a kit' });
    await prisma.$transaction([
      prisma.activationCode.update({ where: { id: ac.id }, data: { used: true, usedById: req.user.id, usedAt: new Date() } }),
      prisma.kit.create({ data: { activationCode: ac.code, name: 'VOLTRA Kit', userId: req.user.id, activatedAt: new Date() } }),
    ]);
    await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 50 } } });
    res.json({ success: true, xpEarned: 50 });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/my-kit', authenticate, async (req, res) => {
  try {
    const kit = await prisma.kit.findFirst({ where: { userId: req.user.id } });
    res.json({ kit });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;