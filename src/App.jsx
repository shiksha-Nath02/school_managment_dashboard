import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Student pages
import StudentProfile from './pages/student/StudentProfile';
import {
  StudentResults,
  StudentTimetable,
  StudentAttendance,
  StudentFeeHistory,
  StudentPayFee,
} from './pages/student/StudentPages';

// Teacher pages
import TeacherProfile from './pages/teacher/TeacherProfile';
import {
  TeacherTimetable,
  TeacherClassData,
  TeacherUploadAttendance,
  TeacherUploadMarks,
} from './pages/teacher/TeacherPages';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import {
  AdminStudents,
  AdminTeachers,
  AdminTeacherAttendance,
  AdminFeeIndividual,
  AdminFeeDues,
  AdminFeeClasswise,
  AdminSalary,
  AdminProfit,
  AdminUniform,
  AdminBooks,
  AdminStationery,
  AdminPantry,
  AdminAddTeacher,
  AdminRemoveStudent,
} from './pages/admin/AdminPages';
import AdminAddStudent from './pages/admin/AdminAddStudent';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />}
      />

      {/* ===== STUDENT DASHBOARD ===== */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentProfile />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="fee-history" element={<StudentFeeHistory />} />
        <Route path="pay-fee" element={<StudentPayFee />} />
      </Route>

      {/* ===== TEACHER DASHBOARD ===== */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout role="teacher" />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherProfile />} />
        <Route path="timetable" element={<TeacherTimetable />} />
        <Route path="class-data" element={<TeacherClassData />} />
        <Route path="upload-attendance" element={<TeacherUploadAttendance />} />
        <Route path="upload-marks" element={<TeacherUploadMarks />} />
      </Route>

      {/* ===== ADMIN DASHBOARD ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="teacher-attendance" element={<AdminTeacherAttendance />} />
        <Route path="fee-individual" element={<AdminFeeIndividual />} />
        <Route path="fee-dues" element={<AdminFeeDues />} />
        <Route path="fee-classwise" element={<AdminFeeClasswise />} />
        <Route path="salary" element={<AdminSalary />} />
        <Route path="profit" element={<AdminProfit />} />
        <Route path="uniform" element={<AdminUniform />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="stationery" element={<AdminStationery />} />
        <Route path="pantry" element={<AdminPantry />} />
        <Route path="add-student" element={<AdminAddStudent />} />
        <Route path="add-teacher" element={<AdminAddTeacher />} />
        <Route path="remove-student" element={<AdminRemoveStudent />} />
      </Route>

      {/* ===== CATCH ALL ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
