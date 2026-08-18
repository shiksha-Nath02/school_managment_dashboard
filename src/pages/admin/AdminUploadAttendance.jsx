import TeacherUploadAttendance from '@/pages/teacher/TeacherUploadAttendance';
import {
  getAdminClasses,
  getAdminStudentsByClass,
  getAdminAttendanceByDate,
  submitAdminStudentAttendance,
} from '@/services/attendanceService';

// Admin/superadmin attendance upload — the exact teacher marking screen, but
// fed with the admin API set so any class can be picked and marked.
export default function AdminUploadAttendance() {
  return (
    <TeacherUploadAttendance
      subtitle="Mark daily attendance for any class"
      api={{
        getClasses: getAdminClasses,
        getStudents: getAdminStudentsByClass,
        getAttendance: getAdminAttendanceByDate,
        submit: submitAdminStudentAttendance,
      }}
    />
  );
}
