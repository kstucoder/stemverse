import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const all = await prisma.achievement.findMany();
    const ua = await prisma.userAchievement.findMany({ where: { userId: req.user.id } });
    const map = {};
    ua.forEach(a => { map[a.achievementId] = true; });
    res.json(all.map(a => ({ ...a, earned: !!map[a.id] })));
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;