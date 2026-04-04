# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SchoolDesk — a school management dashboard with role-based portals for students, teachers, and administrators. Frontend-only React app; requires a separate backend API at `http://localhost:5000`.

## Commands

```bash
npm run dev       # Start Vite dev server on port 5173
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test runner, linter, or formatter is configured.

## Tech Stack

- **React 18** with Vite 6, plain JSX (no TypeScript)
- **React Router DOM 6** for routing
- **Tailwind CSS 3** with custom color palettes and fonts
- **Axios** for HTTP with JWT interceptors
- **Lucide React** for icons, **React Hot Toast** for notifications
- **Context API** for state management (no Redux/Zustand)

## Architecture

### Routing & Auth

- `src/App.jsx` — all route definitions, organized by role (`/student/*`, `/teacher/*`, `/admin/*`)
- `src/contexts/AuthContext.jsx` — global auth state via Context API. Has a `DEV_MODE` flag (currently `true`) that bypasses the real backend with mock users
- `src/components/common/ProtectedRoute.jsx` — guards routes by `user.role`, redirects unauthorized users

### API Layer

- `src/services/api.js` — Axios instance; base URL from `VITE_API_URL` env var or defaults to `http://localhost:5000/api`. Request interceptor attaches JWT from localStorage; response interceptor auto-logouts on 401
- `src/services/authService.js` — login/logout/token helpers
- `src/services/studentService.js` — student CRUD calls
- Vite proxies `/api` to `http://localhost:5000` in dev

### Layouts & Navigation

- `src/components/layouts/DashboardLayout.jsx` — wrapper with fixed sidebar + content area
- `src/components/layouts/Sidebar.jsx` — renders role-specific nav from `src/constants/index.js` (`SIDEBAR_NAV` config)
- `src/constants/index.js` — centralized role config, navigation structure, and role-color mappings

### Role-Based Color Coding

- Admin: `brand-*` (green)
- Teacher: `teacher-*` (purple)
- Student: `student-*` (blue)

These palettes are defined in `tailwind.config.js` along with custom fonts (`display: Outfit`, `body: DM Sans`).

### Path Alias

`@` is aliased to `./src` in `vite.config.js`.

## Key Patterns

- **Pages by role**: `src/pages/admin/`, `src/pages/teacher/`, `src/pages/student/`, `src/pages/auth/`, `src/pages/public/`
- **Placeholder pages**: Many features use `PlaceholderPage` component — check `src/components/common/PlaceholderPage.jsx`
- **Form handling**: Controlled components with local state, inline validation, success/error messages via toast or inline UI
- **Auth flow**: Login sets JWT + user in localStorage → AuthContext reads on mount → ProtectedRoute checks role → Axios attaches token automatically
