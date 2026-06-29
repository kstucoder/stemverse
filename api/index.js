const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { kits: true, progress: { include: { lesson: true } }, achievements: { include: { achievement: true } } } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...safe } = user;
    res.json(safe);
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({ orderBy: { order: 'asc' } });
    res.json(lessons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/progress/overview', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const total = await prisma.lesson.count({ where: { published: true } });
    const completed = await prisma.userProgress.count({ where: { userId: decoded.id, completed: true } });
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    res.json({ totalLessons: total, completedLessons: completed, xp: user.xp, level: user.level, progress: total > 0 ? Math.round(completed/total*100) : 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/progress/complete', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { lessonId, score } = req.body;
    await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: decoded.id, lessonId } },
      create: { userId: decoded.id, lessonId, completed: true, score: score||0, completedAt: new Date() },
      update: { completed: true, score: Math.max(score||0, 0) },
    });
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    await prisma.user.update({ where: { id: decoded.id }, data: { xp: { increment: lesson?.xpReward||0 } } });
    res.json({ success: true, xpEarned: lesson?.xpReward||0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.all('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;
