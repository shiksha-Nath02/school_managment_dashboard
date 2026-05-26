import PlaceholderPage from '../../components/common/PlaceholderPage';
import AdminExpense from './AdminExpense';

export { default as AdminFeeIndividual } from './AdminFeeIndividual';
export { default as AdminSessionSetup } from './AdminSessionSetup';
export { default as AdminFeeDues } from './AdminFeeDues';
export { default as AdminFeeClasswise } from './AdminFeeClasswise';
export { default as AdminProfit } from './AdminProfit';
export { default as AdminStudents } from './AdminStudents';
export { default as AdminTeachers } from './AdminTeachers';
export { default as AdminAddTeacher } from './AdminAddTeacher';
export { default as AdminRemoveStudent } from './AdminRemoveStudent';
export { default as AdminTeacherAttendance } from './AdminTeacherAttendance';
export { default as AdminUniform } from './AdminUniform';
export { default as AdminBooks } from './AdminBooks';

export function AdminStationery() { return <AdminExpense category="stationary" />; }
export function AdminPantry()     { return <AdminExpense category="pantry" />; }

export function AdminSalary() {
  return <PlaceholderPage icon="💵" title="Salary Management" description="Manage teacher and staff salary disbursements." />;
}
