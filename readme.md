# School Management System — Frontend Dashboard

React + Vite dashboard for the school management system. Supports three role-based portals: Admin, Teacher, and Student. Talks to the backend REST API at `http://localhost:5000`.

---

## Tech Stack

- **React** 18 + **React Router** 6 — UI and client-side routing
- **Vite** 6 — build tool and dev server
- **Tailwind CSS** 3 — utility-first styling
- **Axios** — HTTP client with JWT interceptor
- **Lucide React** — icons
- **React Hot Toast** — notifications

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` at the project root

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the dev server

```bash
npm run dev
```

Runs on `http://localhost:5173` by default. The Vite proxy forwards `/api` requests to the backend at `localhost:5000`.

### 4. Build for production

```bash
npm run build
```

---

## Authentication

- Login at `/login` with email and password.
- The server returns a JWT token which is stored in `localStorage`.
- Every API request automatically includes `Authorization: Bearer <token>` via an Axios interceptor.
- On login the server response includes the user's role (`admin`, `teacher`, `student`). The app redirects to the correct portal automatically.
- Removed/deactivated accounts cannot log in (blocked server-side).
- Accessing a protected route without a token redirects to `/login`.
- Accessing a route for the wrong role redirects to your own portal home.

---

## Portals & Pages

### Admin Portal (`/admin`)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Dashboard | Stats overview and recent activity |
| `/admin/students` | All Students | Searchable table of all students with remove action |
| `/admin/add-student` | Add Student | Form to register a new student |
| `/admin/remove-student` | Remove Student | Search and soft-deactivate a student |
| `/admin/teachers` | All Teachers | Table of all active teachers with remove action |
| `/admin/add-teacher` | Add Teacher | Form to register a new teacher |
| `/admin/teacher-attendance` | Teacher Attendance | Daily check-in/check-out and manual status marking |
| `/admin/teacher-attendance-report` | Attendance Report | Date-view and monthly summary for all teachers |
| `/admin/fee-individual` | Individual Fees | Search student, record payment, reverse a payment |
| `/admin/fee-bulk` | Bulk Payments | Record payments for an entire class at once |
| `/admin/fee-dues` | Fee Dues | Students with outstanding fee dues |
| `/admin/fee-classwise` | Class-wise Report | Fee collection summary by class |
| `/admin/session` | Session Setup | 4-step wizard to create an academic session with fee config |
| `/admin/profit` | Profit & Loss | Income/expenditure report with ledger log and add-entry modal |
| `/admin/uniform` | Uniform Inventory | Stock tracking for uniforms |
| `/admin/books` | Books Inventory | Stock tracking for textbooks |
| `/admin/stationery` | Stationery Inventory | Stock tracking for stationery supplies |
| `/admin/pantry` | Pantry Inventory | Stock tracking for pantry/food items |

### Teacher Portal (`/teacher`)

| Route | Page | Description |
|-------|------|-------------|
| `/teacher` | Profile | Teacher profile and overview |
| `/teacher/upload-attendance` | Mark Attendance | Mark present/absent for a class on a date |
| `/teacher/my-attendance` | My Attendance | View own monthly attendance records |
| `/teacher/timetable` | Timetable | View and edit class timetable |
| `/teacher/class-tasks` | Classwork / Homework | Submit daily tasks by period |
| `/teacher/upload-marks` | Upload Marks | Enter student marks for exams |

### Student Portal (`/student`)

| Route | Page | Description |
|-------|------|-------------|
| `/student` | Profile | Student profile and stats |
| `/student/attendance` | Attendance | Monthly calendar view and yearly summary |
| `/student/timetable` | Timetable | Weekly class schedule |
| `/student/class-tasks` | Homework | Daily and weekly classwork/homework |
| `/student/results` | Results | Exam results with rank, percentile, grade, class analytics |
| `/student/fee-history` | Fee History | Payment history and pending dues |

---

## Inventory Module

All four inventory pages (Uniform, Books, Stationery, Pantry) use the same shared `AdminInventory` component with a `category` prop. Each page provides:

- **Summary cards** — total items, total stock, low stock warning (items ≤ 5 units)
- **Items table** — name, description, current stock (highlighted red if low), unit price, total value
- **Add item** — modal with name, initial stock, price, description
- **Stock In** — record a purchase (increases quantity), with date, unit price, and note
- **Stock Out** — record a sale or distribution (decreases quantity, blocked if stock is 0)
- **Transaction History** — per-item log of all purchases and sales in a scrollable modal
- **Delete item** — with confirmation dialog

---

## Project Structure

```
src/
├── App.jsx                          # Route definitions
├── main.jsx                         # Entry point with BrowserRouter + AuthProvider
├── index.css                        # Tailwind imports + custom utilities
├── contexts/
│   └── AuthContext.jsx              # JWT auth state — login, logout, user
├── services/
│   ├── api.js                       # Axios instance with JWT interceptor
│   ├── authService.js               # Login / logout helpers
│   ├── studentService.js            # Students CRUD (add, get, update, remove)
│   ├── teacherService.js            # Teachers CRUD (add, get, update, remove)
│   ├── inventoryService.js          # Inventory items, stock-in, stock-out, transactions
│   ├── attendanceService.js         # Student attendance
│   ├── teacherAttendanceService.js  # Teacher attendance and check-in/out
│   ├── marksService.js              # Marks entry and results
│   ├── timetableService.js          # Timetable get/update
│   ├── classTaskService.js          # Classwork/homework
│   └── feeService.js                # Fees, sessions, payments, profit
├── components/
│   ├── common/
│   │   ├── Logo.jsx
│   │   ├── PlaceholderPage.jsx
│   │   └── ProtectedRoute.jsx       # Role-based guard — redirects to /login if unauthenticated
│   └── layouts/
│       ├── DashboardLayout.jsx      # Sidebar + main area layout
│       └── Sidebar.jsx              # Role-based navigation sidebar
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx            # Login with role tabs and real JWT auth
│   ├── public/
│   │   └── LandingPage.jsx
│   ├── admin/
│   │   ├── AdminPages.jsx           # Re-exports + inventory category wrappers
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminStudents.jsx        # Student list with search, filter, remove
│   │   ├── AdminAddStudent.jsx      # Add student form
│   │   ├── AdminRemoveStudent.jsx   # Search and deactivate student
│   │   ├── AdminTeachers.jsx        # Teacher list with remove
│   │   ├── AdminAddTeacher.jsx      # Add teacher form
│   │   ├── AdminInventory.jsx       # Shared inventory page (all 4 categories)
│   │   ├── AdminTeacherAttendance.jsx
│   │   ├── AdminTeacherAttendanceReport.jsx
│   │   ├── AdminFeeIndividual.jsx
│   │   ├── AdminFeeBulk.jsx
│   │   ├── AdminFeeDues.jsx
│   │   ├── AdminFeeClasswise.jsx
│   │   ├── AdminSessionSetup.jsx
│   │   └── AdminProfit.jsx
│   ├── teacher/
│   │   ├── TeacherProfile.jsx
│   │   ├── TeacherUploadAttendance.jsx
│   │   ├── TeacherMyAttendance.jsx
│   │   ├── TeacherTimetable.jsx
│   │   ├── TeacherClassTasks.jsx
│   │   └── TeacherUploadMarks.jsx
│   └── student/
│       ├── StudentProfile.jsx
│       ├── StudentAttendance.jsx
│       ├── StudentTimetable.jsx
│       ├── StudentClassTasks.jsx
│       ├── StudentResults.jsx
│       └── StudentFeeHistory.jsx
└── constants/
    └── index.js                     # Exam types, grades, timetable config, role config
```

---

## Key Design Decisions

- **Soft deletes only** — removing a student or teacher deactivates their account (data preserved for history).
- **Role redirect on login** — the server determines role from credentials; app redirects to the correct portal automatically.
- **Single inventory component** — all four inventory categories (pantry, stationery, books, uniform) share one `AdminInventory.jsx` component, avoiding code duplication.
- **Debounced search** — student search debounces by 400ms to avoid hitting the API on every keystroke.
- **Transaction safety** — stock-in and stock-out modals are blocked if the quantity field is invalid. Stock-out is also blocked at the button level if current stock is 0.
- **JWT persistence** — token and user stored in `localStorage`, rehydrated on page reload so users stay logged in.

---

## Notes

- The backend must be running at `http://localhost:5000` before starting the frontend.
- Auth middleware on the backend is currently **disabled for development** — all API routes are open. The frontend auth flow is fully wired but the backend does not enforce it yet.
- The Salary management page is a placeholder — no backend endpoint exists for it yet.
