import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import LandingPage from './pages/public/LandingPage';
import GalleryPage from './pages/public/GalleryPage';
import LoginPage from './pages/auth/LoginPage';

// Student pages
import StudentProfile from './pages/student/StudentProfile';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentClassTasks from './pages/student/StudentClassTasks';
import {
  StudentResults,
  StudentFeeHistory,
  StudentPurchases,
} from './pages/student/StudentPages';

// Teacher pages
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherUploadAttendance from './pages/teacher/TeacherUploadAttendance';
import TeacherMyAttendance from './pages/teacher/TeacherMyAttendance';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TeacherClassTasks from './pages/teacher/TeacherClassTasks';
import { TeacherUploadMarks } from './pages/teacher/TeacherPages';
import TeacherStudents from './pages/teacher/TeacherStudents';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import {
  AdminStudents,
  AdminTeachers,
  AdminTeacherAttendance,
  AdminFeeIndividual,
  AdminFeeDues,
  AdminFeeClasswise,
  AdminSessionSetup,
  AdminProfit,
  AdminUniform,
  AdminBooks,
  AdminExpenditure,
  AdminAddTeacher,
  AdminRemoveStudent,
} from './pages/admin/AdminPages';
import AdminAddStudent from './pages/admin/AdminAddStudent';
import AdminStaff from './pages/admin/AdminStaff';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminTeacherAttendanceReport from './pages/admin/AdminTeacherAttendanceReport';
import AdminFeeBulk from './pages/admin/AdminFeeBulk';
import AdminStudentsPage from './pages/admin/AdminStudents';
import AdminTeachersPage from './pages/admin/AdminTeachers';
import AdminAddTeacherPage from './pages/admin/AdminAddTeacher';
import AdminRemoveStudentPage from './pages/admin/AdminRemoveStudent';
import AdminWebsite from './pages/admin/AdminWebsite';

export default function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/login" element={<LoginPage />} />

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
        <Route path="class-tasks" element={<StudentClassTasks />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="fee-history" element={<StudentFeeHistory />} />
        <Route path="purchases" element={<StudentPurchases />} />
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
        <Route path="class-tasks" element={<TeacherClassTasks />} />
        <Route path="upload-attendance" element={<TeacherUploadAttendance />} />
        <Route path="my-attendance" element={<TeacherMyAttendance />} />
        <Route path="upload-marks" element={<TeacherUploadMarks />} />
        <Route path="students" element={<TeacherStudents />} />
      </Route>

      {/* ===== ADMIN DASHBOARD ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="teachers" element={<AdminTeachersPage />} />
        <Route path="teacher-attendance" element={<AdminTeacherAttendance />} />
        <Route path="teacher-attendance-report" element={<AdminTeacherAttendanceReport />} />
        <Route path="fee-individual" element={<AdminFeeIndividual />} />
        <Route path="fee-bulk" element={<AdminFeeBulk />} />
        <Route path="fee-dues" element={<AdminFeeDues />} />
        <Route path="fee-classwise" element={<AdminFeeClasswise />} />
        <Route path="profit" element={<AdminProfit />} />
        <Route path="uniform" element={<AdminUniform />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="expenditure" element={<AdminExpenditure />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        {/* Old paths now merged into Expenditure */}
        <Route path="stationery" element={<Navigate to="/admin/expenditure" replace />} />
        <Route path="pantry" element={<Navigate to="/admin/expenditure" replace />} />
        <Route path="salary" element={<Navigate to="/admin/expenditure" replace />} />
        <Route path="add-student" element={<AdminAddStudent />} />
        <Route path="add-teacher" element={<AdminAddTeacherPage />} />
        <Route path="remove-student" element={<AdminRemoveStudentPage />} />
        <Route path="session" element={<AdminSessionSetup />} />
        <Route path="website" element={<AdminWebsite />} />
      </Route>

      {/* ===== CATCH ALL ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}