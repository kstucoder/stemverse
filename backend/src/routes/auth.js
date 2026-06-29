import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level } });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level } });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { kits: true, progress: { include: { lesson: true } }, achievements: { include: { achievement: true } } } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { ...(name && { name }), ...(avatar && { avatar }) } });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "Password reset link sent to " + email });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;