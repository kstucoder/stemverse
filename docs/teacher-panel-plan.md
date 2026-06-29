# Teacher Panel — Implementation Plan

## Arkitektura

```
Backend:
  Classroom model (id, name, teacherId, inviteCode, createdAt)
  ClassroomStudent model (id, classroomId, studentId, joinedAt)
  Routes: POST/GET/PUT/DELETE /api/teacher/classrooms
          POST /api/teacher/classroom/:id/students
          GET /api/teacher/classroom/:id/progress
          GET /api/teacher/stats

Frontend:
  /teacher            → TeacherDashboard
  /teacher/classrooms → ClassroomList (CRUD)
  /teacher/classroom/:id → ClassroomView (students + progress)
```

## Bajariladigan ishlar

1. Prisma schema → Classroom + ClassroomStudent modellari
2. Backend routes → teacher.js (classroom CRUD, student management)
3. Seed data → demo teacher account
4. Frontend → TeacherDashboard page
5. Frontend → ClassroomList page
6. Frontend → ClassroomView page
7. Router → teacher route'lari
8. Build test
