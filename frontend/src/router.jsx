import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';
import VoltraLanding from './pages/VoltraLanding';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';
import Achievements from './pages/Achievements';
import KitActivation from './pages/KitActivation';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageLessons from './pages/admin/ManageLessons';
import ManageCodes from './pages/admin/ManageCodes';
import ManageOrders from './pages/admin/ManageOrders';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassroomList from './pages/ClassroomList';
import ClassroomView from './pages/ClassroomView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <VoltraLanding /> },
      { path: 'auth/login', element: <Login /> },
      { path: 'auth/register', element: <Register /> },
      { path: 'auth/forgot-password', element: <ForgotPassword /> },
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: 'lessons', element: <ProtectedRoute><Lessons /></ProtectedRoute> },
      { path: 'lessons/:id', element: <ProtectedRoute><LessonView /></ProtectedRoute> },
      { path: 'achievements', element: <ProtectedRoute><Achievements /></ProtectedRoute> },
      { path: 'activate', element: <ProtectedRoute><KitActivation /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute> },
      { path: 'admin/lessons', element: <ProtectedRoute role="ADMIN"><ManageLessons /></ProtectedRoute> },
      { path: 'admin/codes', element: <ProtectedRoute role="ADMIN"><ManageCodes /></ProtectedRoute> },
      { path: 'admin/orders', element: <ProtectedRoute role="ADMIN"><ManageOrders /></ProtectedRoute> },
      // Teacher routes
      { path: 'teacher', element: <ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute> },
      { path: 'teacher/classrooms', element: <ProtectedRoute role="TEACHER"><ClassroomList /></ProtectedRoute> },
      { path: 'teacher/classroom/:id', element: <ProtectedRoute role="TEACHER"><ClassroomView /></ProtectedRoute> },
    ],
  },
]);

export default router;
