import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import LandingPage from './pages/public/LandingPage';

// Student pages
import StudentProfile from './pages/student/StudentProfile';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentClassTasks from './pages/student/StudentClassTasks';
import {
  StudentResults,
  StudentFeeHistory,
  StudentPayFee,
} from './pages/student/StudentPages';

// Teacher pages
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherUploadAttendance from './pages/teacher/TeacherUploadAttendance';
import TeacherMyAttendance from './pages/teacher/TeacherMyAttendance';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TeacherClassTasks from './pages/teacher/TeacherClassTasks';
import {
  TeacherClassData,
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
import AdminTeacherAttendanceReport from './pages/admin/AdminTeacherAttendanceReport';

export default function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/admin" replace />} />

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
        <Route path="class-tasks" element={<TeacherClassTasks />} />
        <Route path="class-data" element={<TeacherClassData />} />
        <Route path="upload-attendance" element={<TeacherUploadAttendance />} />
        <Route path="my-attendance" element={<TeacherMyAttendance />} />
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
        <Route path="teacher-attendance-report" element={<AdminTeacherAttendanceReport />} />
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