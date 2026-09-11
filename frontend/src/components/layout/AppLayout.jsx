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
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
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
    label: 'Placement Reports',
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
    label: 'Academic History',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        return { label: 'T&P Officer', color: 'bg-accent-500 text-white' };
      case 'coordinator':
        return { label: 'Coordinator', color: 'bg-primary-500 text-white' };
      case 'student':
        return { label: 'Student', color: 'bg-success-600 text-white' };
      default:
        return { label: r, color: 'bg-text-muted text-white' };
    }
  };

  const roleBadge = getRoleBadge(normalizedRole);

  return (
    <div className="min-h-screen flex bg-bg-base text-text-primary antialiased">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-primary-900 text-white flex-col shrink-0 border-r border-primary-700 select-none">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-primary-700 bg-primary-900">
          <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center font-heading font-bold text-white text-lg shadow-sm">
            PT
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-white block tracking-tight">
              PlaceTrack
            </span>
            <span className="text-[10px] text-primary-100/70 uppercase tracking-wider font-semibold block">
              RCPIT Shirpur
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-primary-100/50">
            Main Menu
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-700 text-white shadow-xs font-semibold'
                      : 'text-primary-100/80 hover:bg-primary-700/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-primary-700 text-xs text-primary-100/60 flex items-center justify-between">
          <span>Role: <strong className="text-white capitalize">{normalizedRole}</strong></span>
          <span className="text-[10px] bg-primary-700 px-2 py-0.5 rounded text-accent-500 font-mono">v1.0</span>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-primary-900/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <aside className="relative w-64 bg-primary-900 text-white flex flex-col z-10">
            <div className="h-16 px-6 flex items-center justify-between border-b border-primary-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center font-heading font-bold text-white">
                  PT
                </div>
                <span className="font-heading font-bold text-white text-base">PlaceTrack</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-primary-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-700 text-white font-semibold'
                          : 'text-primary-100/80 hover:bg-primary-700/50 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-bg-surface border-b border-border-subtle px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-bg-base"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-success-600" />
              <span>Placement & Training System — RCPIT Shirpur</span>
            </div>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-bg-base transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary-700 text-white font-heading font-semibold text-xs flex items-center justify-center shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-semibold text-text-primary leading-tight">
                  {user?.name || 'User Account'}
                </span>
                <span className="block text-[10px] text-text-muted">
                  {user?.email || user?.prn || 'rcpit.ac.in'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {/* Dropdown Card */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-bg-surface border border-border-subtle rounded-xl shadow-lg py-1.5 z-40"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-border-subtle">
                  <p className="text-xs font-bold text-text-primary">{user?.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                  {user?.prn && (
                    <p className="text-[10px] text-primary-500 font-mono mt-0.5">PRN: {user.prn}</p>
                  )}
                </div>

                {normalizedRole === 'student' && (
                  <NavLink
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs text-text-primary hover:bg-bg-base"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </NavLink>
                )}

                <NavLink
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-xs text-text-primary hover:bg-bg-base"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </NavLink>

                <div className="border-t border-border-subtle my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-error-600 hover:bg-error-100/50 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
