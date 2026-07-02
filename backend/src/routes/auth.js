import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../services/mailer.js';
const router = Router();

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

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

    // Always respond with the same generic success message whether or not the
    // account exists, so this endpoint can't be used to enumerate registered emails.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashToken(rawToken), resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      });
      await sendPasswordResetEmail(user.email, rawToken);
    }
    res.json({ success: true, message: "Agar bu email ro'yxatdan o'tgan bo'lsa, tiklash havolasi yuborildi." });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const user = await prisma.user.findUnique({ where: { resetToken: hashToken(token) } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ error: "Havola yaroqsiz yoki muddati o'tgan" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });
    res.json({ success: true, message: "Parol muvaffaqiyatli yangilandi" });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;