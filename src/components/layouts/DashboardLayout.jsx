import { Outlet } from 'react-router-dom';
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

  return (
    <div className="flex min-h-screen bg-surface-bg">
      <Sidebar role={role} />

      <main className="flex-1 ml-[260px] p-8 md:p-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div /> {/* Placeholder for breadcrumbs later */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-medium">{displayName}</span>
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
