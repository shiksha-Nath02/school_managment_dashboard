// ===== ROLE CONFIGURATION =====
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    badge: 'Admin Portal',
    icon: '🛡️',
    color: 'brand',       // tailwind color key
    accent: '#2D5A27',
    lightBg: 'bg-brand-50',
    textColor: 'text-brand-500',
    btnClass: 'bg-brand-500 hover:bg-brand-600',
    avatarBg: 'bg-brand-500',
  },
  [ROLES.TEACHER]: {
    label: 'Teacher',
    badge: 'Teacher Portal',
    icon: '📚',
    color: 'teacher',
    accent: '#5B3A8C',
    lightBg: 'bg-teacher-50',
    textColor: 'text-teacher-500',
    btnClass: 'bg-teacher-500 hover:bg-teacher-600',
    avatarBg: 'bg-teacher-500',
  },
  [ROLES.STUDENT]: {
    label: 'Student',
    badge: 'Student Portal',
    icon: '🎓',
    color: 'student',
    accent: '#1A5276',
    lightBg: 'bg-student-50',
    textColor: 'text-student-500',
    btnClass: 'bg-student-500 hover:bg-student-600',
    avatarBg: 'bg-student-500',
  },
};

// ===== SIDEBAR NAVIGATION =====
export const SIDEBAR_NAV = {
  [ROLES.STUDENT]: [
    {
      title: 'Main',
      items: [
        { key: 'profile', label: 'My Profile', icon: 'User', path: '/student' },
        { key: 'results', label: 'My Results', icon: 'FileText', path: '/student/results' },
        { key: 'timetable', label: 'Timetable', icon: 'Calendar', path: '/student/timetable' },
        { key: 'attendance', label: 'Attendance', icon: 'CheckCircle', path: '/student/attendance' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { key: 'fee-history', label: 'Fee History', icon: 'Receipt', path: '/student/fee-history' },
        { key: 'pay-fee', label: 'Pay Fee', icon: 'CreditCard', path: '/student/pay-fee' },
      ],
    },
  ],

  [ROLES.TEACHER]: [
    {
      title: 'Main',
      items: [
        { key: 'profile', label: 'My Profile', icon: 'User', path: '/teacher' },
        { key: 'timetable', label: 'Timetable', icon: 'Calendar', path: '/teacher/timetable' },
        { key: 'class-data', label: 'Class Data', icon: 'ClipboardList', path: '/teacher/class-data' },
      ],
    },
    {
      title: 'Actions',
      items: [
        { key: 'upload-attendance', label: 'Upload Attendance', icon: 'CheckCircle', path: '/teacher/upload-attendance' },
        { key: 'upload-marks', label: 'Upload Marks', icon: 'FileText', path: '/teacher/upload-marks' },
      ],
    },
  ],

  [ROLES.ADMIN]: [
    {
      title: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin' },
        { key: 'students', label: 'Students', icon: 'GraduationCap', path: '/admin/students' },
        { key: 'teachers', label: 'Teachers', icon: 'BookOpen', path: '/admin/teachers' },
      ],
    },
    {
      title: 'Attendance',
      items: [
        { key: 'teacher-attendance', label: 'Teacher Attendance', icon: 'CheckCircle', path: '/admin/teacher-attendance' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { key: 'fee-individual', label: 'Individual Fee', icon: 'IndianRupee', path: '/admin/fee-individual' },
        { key: 'fee-dues', label: 'Students with Dues', icon: 'AlertTriangle', path: '/admin/fee-dues' },
        { key: 'fee-classwise', label: 'Class-wise Report', icon: 'ClipboardList', path: '/admin/fee-classwise' },
        { key: 'salary', label: 'Salary', icon: 'Banknote', path: '/admin/salary' },
        { key: 'profit', label: 'Profit', icon: 'TrendingUp', path: '/admin/profit' },
      ],
    },
    {
      title: 'Inventory',
      items: [
        { key: 'uniform', label: 'Uniform', icon: 'Shirt', path: '/admin/uniform' },
        { key: 'books', label: 'Books', icon: 'BookOpen', path: '/admin/books' },
        { key: 'stationery', label: 'Stationery', icon: 'Pencil', path: '/admin/stationery' },
        { key: 'pantry', label: 'Pantry', icon: 'UtensilsCrossed', path: '/admin/pantry' },
      ],
    },
    {
      title: 'Manage',
      items: [
        { key: 'add-student', label: 'Add Student', icon: 'UserPlus', path: '/admin/add-student' },
        { key: 'add-teacher', label: 'Add Teacher', icon: 'UserPlus', path: '/admin/add-teacher' },
        { key: 'remove-student', label: 'Remove Student', icon: 'UserMinus', path: '/admin/remove-student' },
      ],
    },
  ],
};
