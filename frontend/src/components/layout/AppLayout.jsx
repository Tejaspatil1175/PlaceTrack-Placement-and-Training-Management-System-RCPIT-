import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth, authStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  FileCheck,
  Bell,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  History,
  User,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['tpo', 'coordinator', 'student'],
  },
  {
    path: '/departments',
    label: 'Departments',
    icon: Building2,
    roles: ['tpo'],
  },
  {
    path: '/coordinators',
    label: 'Coordinators',
    icon: Users,
    roles: ['tpo'],
  },
  {
    path: '/students',
    label: 'Student Directory',
    icon: GraduationCap,
    roles: ['tpo', 'coordinator'],
  },
  {
    path: '/drives',
    label: 'Placement Drives',
    icon: Briefcase,
    roles: ['tpo', 'coordinator', 'student'],
  },
  {
    path: '/applications',
    label: 'Applications',
    icon: FileCheck,
    roles: ['tpo', 'coordinator', 'student'],
  },
  {
    path: '/notifications',
    label: 'Announcements',
    icon: Bell,
    roles: ['tpo', 'coordinator', 'student'],
  },
  {
    path: '/events',
    label: 'Training & Events',
    icon: Calendar,
    roles: ['tpo', 'coordinator', 'student'],
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: ['tpo', 'coordinator'],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: FileSpreadsheet,
    roles: ['tpo'],
  },
  {
    path: '/upload-logs',
    label: 'Upload Logs',
    icon: History,
    roles: ['tpo'],
  },
  {
    path: '/profile',
    label: 'My Profile',
    icon: User,
    roles: ['student'],
  },
  {
    path: '/academics',
    label: 'Academics',
    icon: BookOpen,
    roles: ['student'],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['tpo', 'coordinator', 'student'],
  },
];

export function AppLayout() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const normalizedRole = role === 'officer' ? 'tpo' : role || 'student';
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(normalizedRole)
  );

  const handleLogout = () => {
    authStore.clearAuth();
    navigate('/login');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'tpo':
        return { label: 'Main T&P Officer', bg: 'bg-beige-200 border-zinc-700 text-zinc-900' };
      case 'coordinator':
        return { label: 'Dept Coordinator', bg: 'bg-beige-100 border-zinc-700 text-zinc-900' };
      case 'student':
        return { label: 'Student Portal', bg: 'bg-emerald-100 border-emerald-800 text-emerald-900' };
      default:
        return { label: r, bg: 'bg-zinc-100 border-zinc-700 text-zinc-900' };
    }
  };

  const roleBadge = getRoleBadge(normalizedRole);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F5F0E6] text-zinc-900 antialiased font-sans">
      {/* Top Header Navigation Bar (Full White with Dark Grey Thin Border) */}
      <header className="h-16 bg-white border-b-2 border-zinc-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        {/* Brand & System Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-heading font-extrabold text-white text-xl border border-zinc-800 shadow-sm shrink-0">
            PT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg text-zinc-900 tracking-tight leading-none">
                PlaceTrack
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-beige-100 text-zinc-900 border-zinc-700">
                RCPIT Shirpur
              </span>
            </div>
            <span className="text-[11px] text-zinc-600 font-medium block mt-0.5">
              Placement & Training Management System
            </span>
          </div>
        </div>

        {/* Right User & Role Menu */}
        <div className="relative flex items-center space-x-3">
          <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.bg}`}>
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-700" />
            {roleBadge.label}
          </span>

          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-label="User account menu"
            className="flex items-center space-x-3 p-1.5 rounded-xl bg-white hover:bg-beige-100 border border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-800"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-heading font-bold text-xs flex items-center justify-center border border-zinc-800 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-zinc-900 leading-tight">
                {user?.name || 'User Account'}
              </span>
              <span className="block text-[10px] text-zinc-500 font-medium truncate max-w-[140px]">
                {user?.email || user?.prn || 'rcpit.ac.in'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-600" />
          </button>

          {/* User Account Dropdown */}
          {userDropdownOpen && (
            <div
              className="absolute right-0 top-12 w-60 bg-white border-2 border-zinc-800 rounded-2xl shadow-xl py-2 z-50"
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-zinc-300 bg-beige-50 rounded-t-2xl">
                <p className="text-xs font-bold text-zinc-900">{user?.name}</p>
                <p className="text-[11px] text-zinc-600 truncate">{user?.email}</p>
                {user?.prn && (
                  <p className="text-[10px] text-zinc-800 font-mono font-bold mt-0.5">PRN: {user.prn}</p>
                )}
              </div>

              {normalizedRole === 'student' && (
                <NavLink
                  to="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-beige-100 transition-colors"
                >
                  <User className="w-4 h-4 text-zinc-700" />
                  <span>My Student Profile</span>
                </NavLink>
              )}

              <NavLink
                to="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-beige-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-700" />
                <span>Account Settings</span>
              </NavLink>

              <div className="border-t border-zinc-300 my-1"></div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-rose-700 hover:bg-rose-50 font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Horizontal Primary Navigation Bar (Beige Ribbon with Dark Grey Thin Borders) */}
      <nav className="bg-[#FAF8F5] border-b-2 border-zinc-800 py-3 px-4 lg:px-8 sticky top-16 z-40 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 focus:outline-none ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-md border-2 border-zinc-800 scale-[1.02]'
                      : 'bg-white text-zinc-800 border border-zinc-700/50 hover:bg-beige-100 hover:border-zinc-800 hover:shadow-xs'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Main Content View (Centered Container on Warm Beige Canvas) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t-2 border-zinc-800 py-4 px-6 text-center text-xs font-bold text-zinc-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PlaceTrack Campus Placement System • R.C. Patel Institute of Technology, Shirpur</span>
          <span className="font-mono text-[11px] bg-beige-100 border border-zinc-700 px-2.5 py-0.5 rounded-full text-zinc-900">
            Version 1.0 • Stable Release
          </span>
        </div>
      </footer>
    </div>
  );
}
