import PlaceholderPage from '../../components/common/PlaceholderPage';

export { default as AdminFeeIndividual } from './AdminFeeIndividual';
export { default as AdminSessionSetup } from './AdminSessionSetup';
export { default as AdminFeeDues } from './AdminFeeDues';
export { default as AdminFeeClasswise } from './AdminFeeClasswise';
export { default as AdminProfit } from './AdminProfit';

export function AdminStudents() {
  return <PlaceholderPage icon="🎓" title="All Students" description="View, search, and manage all enrolled students." />;
}

export function AdminTeachers() {
  return <PlaceholderPage icon="📚" title="All Teachers" description="View and manage all teaching staff." />;
}

export { default as AdminTeacherAttendance } from './AdminTeacherAttendance';

export function AdminFeeBulkPlaceholder() {
  return <PlaceholderPage icon="💰" title="Bulk Payment" description="Record multiple payments at once for an entire class." />;
}

export function AdminSalary() {
  return <PlaceholderPage icon="💵" title="Salary Management" description="Manage teacher and staff salary disbursements." />;
}

export function AdminUniform() {
  return <PlaceholderPage icon="👔" title="Uniform Inventory" description="Manage uniform stock and distribution." />;
}

export function AdminBooks() {
  return <PlaceholderPage icon="📖" title="Books Inventory" description="Track textbook stock and distribution." />;
}

export function AdminStationery() {
  return <PlaceholderPage icon="✏️" title="Stationery Inventory" description="Manage stationery supplies and stock levels." />;
}

export function AdminPantry() {
  return <PlaceholderPage icon="🍽️" title="Pantry Inventory" description="Track pantry and food supplies." />;
}

export function AdminAddStudent() {
  return <PlaceholderPage icon="➕" title="Add New Student" description="Register a new student with all required information and fee setup." />;
}

export function AdminAddTeacher() {
  return <PlaceholderPage icon="➕" title="Add New Teacher" description="Register a new teacher with profile and assignment details." />;
}

export function AdminRemoveStudent() {
  return <PlaceholderPage icon="➖" title="Remove Student" description="Search and remove a student from the system." />;
}
