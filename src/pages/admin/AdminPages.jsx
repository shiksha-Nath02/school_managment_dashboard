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

export function AdminExpenditure() { return <AdminExpense />; }
