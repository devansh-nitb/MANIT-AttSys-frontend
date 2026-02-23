import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from './redux/slices/themeSlice';

import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminHierarchy from './pages/admin/Hierarchy';
import AdminFaculty from './pages/admin/Faculty';
import AdminStudents from './pages/admin/Students';
import AdminSessions from './pages/admin/Sessions';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAttendanceLock from './pages/admin/AttendanceLock';
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyMarkAttendance from './pages/faculty/MarkAttendance';
import FacultyReports from './pages/faculty/Reports';
import FacultyBulkUploadStudents from './pages/faculty/BulkUploadStudents';
import StudentDashboard from './pages/student/Dashboard';
import StudentSubjectDetail from './pages/student/SubjectDetail';

import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

function App() {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.theme.mode);

  useEffect(() => {
    dispatch(setTheme(theme));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<RoleDashboard />} />
        <Route path="admin/*" element={<AdminRoutes />} />
        <Route path="faculty/*" element={<FacultyRoutes />} />
        <Route path="student/*" element={<StudentRoutes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RoleDashboard() {
  const role = useSelector((s) => s.auth.user?.role);
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'faculty') return <FacultyDashboard />;
  if (role === 'student') return <StudentDashboard />;
  return null;
}

function AdminRoutes() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <Routes>
        <Route index element={<Navigate to="/admin/hierarchy" replace />} />
        <Route path="hierarchy" element={<AdminHierarchy />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="attendance" element={<AdminAttendanceLock />} />
      </Routes>
    </RoleGuard>
  );
}

function FacultyRoutes() {
  return (
    <RoleGuard allowedRoles={['faculty']}>
      <Routes>
        <Route index element={<Navigate to="/faculty/mark" replace />} />
        <Route path="mark" element={<FacultyMarkAttendance />} />
        <Route path="reports" element={<FacultyReports />} />
        <Route path="bulk-upload" element={<FacultyBulkUploadStudents />} />
      </Routes>
    </RoleGuard>
  );
}

function StudentRoutes() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <Routes>
        <Route path="subject/:subjectId" element={<StudentSubjectDetail />} />
      </Routes>
    </RoleGuard>
  );
}

export default App;
