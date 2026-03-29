import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_CONFIG, SIDEBAR_NAV } from '../../constants';
import Logo from '../common/Logo';
import * as Icons from 'lucide-react';

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const config = ROLE_CONFIG[role];
  const navSections = SIDEBAR_NAV[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Resolve icon component from lucide by name
  const getIcon = (iconName) => {
    const IconComp = Icons[iconName];
    return IconComp ? <IconComp size={18} /> : null;
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === `/${role}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Active item styles per role
  const activeClass = {
    admin: 'bg-brand-50 text-brand-500 font-semibold',
    teacher: 'bg-teacher-50 text-teacher-500 font-semibold',
    student: 'bg-student-50 text-student-500 font-semibold',
  };

  return (
    <aside className="w-[260px] bg-white border-r border-gray-200/80 fixed top-0 left-0 bottom-0 flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-2">
        <Logo size="small" linkTo={`/${role}`} />
      </div>

      {/* Role badge */}
      <div className="px-5 mb-4">
        <span
          className={`inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${config.lightBg} ${config.textColor}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[1.2px] text-gray-300">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all text-left cursor-pointer
                    ${isActive(item.path)
                      ? activeClass[role]
                      : 'text-gray-400 hover:bg-surface-alt hover:text-gray-700'
                    }`}
                >
                  <span className="w-5 flex-shrink-0 flex items-center justify-center">
                    {getIcon(item.icon)}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
        >
          <Icons.LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
