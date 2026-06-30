import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authenticate);

// Join classroom via invite code — accessible to ALL authenticated users (students included)
router.post('/join', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Invite code required' });
    const classroom = await prisma.classroom.findUnique({ where: { inviteCode: code.trim().toUpperCase() } });
    if (!classroom) return res.status(404).json({ error: 'Invalid invite code' });
    const existing = await prisma.classroomStudent.findUnique({
      where: { classroomId_studentId: { classroomId: classroom.id, studentId: req.user.id } },
    });
    if (existing) return res.status(409).json({ error: 'Already in this classroom' });
    await prisma.classroomStudent.create({
      data: { classroomId: classroom.id, studentId: req.user.id },
    });
    res.json({ success: true, classroom: { id: classroom.id, name: classroom.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// All routes below require TEACHER or ADMIN role
router.use(requireRole('TEACHER', 'ADMIN'));

// Get teacher's classrooms
router.get('/classrooms', async (req, res) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { students: true } },
        students: {
          include: { student: { select: { id: true, name: true, email: true, xp: true, level: true } } },
        },
      },
    });
    res.json(classrooms);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create classroom
router.post('/classrooms', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Classroom name required' });
    const inviteCode = 'SV-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const classroom = await prisma.classroom.create({
      data: { name, inviteCode, teacherId: req.user.id },
    });
    res.status(201).json(classroom);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single classroom
router.get('/classrooms/:id', async (req, res) => {
  try {
    const classroom = await prisma.classroom.findFirst({
      where: { id: req.params.id, teacherId: req.user.id },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true, name: true, email: true, xp: true, level: true,
                progress: { include: { lesson: { select: { id: true, title: true, xpReward: true } } } },
                achievements: { include: { achievement: true } },
              },
            },
          },
        },
      },
    });
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.json(classroom);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete classroom
router.delete('/classrooms/:id', async (req, res) => {
  try {
    await prisma.classroomStudent.deleteMany({ where: { classroomId: req.params.id } });
    await prisma.classroom.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Teacher stats
router.get('/stats', async (req, res) => {
  try {
    const [classrooms, totalStudents] = await Promise.all([
      prisma.classroom.count({ where: { teacherId: req.user.id } }),
      prisma.classroomStudent.findMany({
        where: { classroom: { teacherId: req.user.id } },
        select: { studentId: true },
      }),
    ]);
    const uniqueStudents = new Set(totalStudents.map(s => s.studentId)).size;
    const totalCompleted = await prisma.userProgress.count({
      where: {
        completed: true,
        user: {
          enrollments: { some: { classroom: { teacherId: req.user.id } } },
        },
      },
    });
    res.json({ classrooms, students: uniqueStudents, completedLessons: totalCompleted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
