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
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
  origin: ['http://localhost:5173', 'https://stemverse-dhq64y7ic-kstu-coders-projects.vercel.app', 'https://stemverse-dusky.vercel.app', process.env.FRONTEND_URL || '*'].filter(Boolean),
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

// Database seed endpoint (trigger via POST /api/seed)
app.post('/api/seed', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    exec('node prisma/seed.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) return res.status(500).json({ error: stderr });
      res.json({ success: true, output: stdout });
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });
if (process.env.NODE_ENV !== 'vercel') {
  app.listen(PORT, () => console.log('STEMVERSE API on http://localhost:' + PORT));
}
export default app;