import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_CONFIG } from '../../constants';

export default function DashboardLayout({ role }) {
  const { user } = useAuth();
  const config = ROLE_CONFIG[role];

  // Get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || config.label;
  const initials = getInitials(displayName);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-bg">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar is fixed at 260px on lg+; full-width content (no left margin) on mobile */}
      <main className="flex-1 min-w-0 w-full lg:ml-[260px] p-4 sm:p-6 lg:p-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          {/* Hamburger — opens the drawer on mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-400 font-medium hidden sm:inline">{displayName}</span>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${config.avatarBg}`}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Page content via nested routes */}
        <Outlet />
      </main>
    </div>
  );
}
