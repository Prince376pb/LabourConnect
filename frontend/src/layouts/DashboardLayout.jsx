import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CheckCircle,
  FolderTree,
  AlertOctagon,
  FileText,
  PlusCircle,
  FileCheck,
  Search,
  Wrench,
  Clock,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Button from '../components/common/Button';

const DashboardLayout = () => {
  const { user, primaryRole, logout, dashboardRoute } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = primaryRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (role) {
      case ROLES.ADMIN:
        return [
          { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Provider Verifications', path: '/admin/verifications', icon: ShieldCheck },
          { name: 'Service Categories', path: '/admin/categories', icon: FolderTree },
          { name: 'Disputes & Complaints', path: '/admin/complaints', icon: AlertOctagon },
          { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: FileText },
        ];
      case ROLES.EMPLOYER:
        return [
          { name: 'Employer Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
          { name: 'Post a New Job', path: '/employer/post-job', icon: PlusCircle },
          { name: 'Manage Jobs & Applicants', path: '/employer/manage-jobs', icon: Briefcase },
          { name: 'Search Skilled Workers', path: '/employer/search-workers', icon: Search },
          { name: 'Company Profile', path: '/employer/profile', icon: User },
        ];
      case ROLES.WORKER:
        return [
          { name: 'Worker Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
          { name: 'Browse Open Jobs', path: '/jobs', icon: Briefcase },
          { name: 'My Applications', path: '/worker/applications', icon: FileCheck },
          { name: 'Skills & Profile', path: '/worker/profile', icon: User },
        ];
      case ROLES.CUSTOMER:
        return [
          { name: 'Customer Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
          { name: 'Find Local Services', path: '/services', icon: Wrench },
          { name: 'My Service Requests', path: '/customer/requests', icon: Clock },
          { name: 'Customer Profile', path: '/customer/profile', icon: User },
        ];
      case ROLES.PROVIDER:
        return [
          { name: 'Provider Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
          { name: 'Incoming Requests', path: '/provider/requests', icon: Clock },
          { name: 'Provider Profile & Rates', path: '/provider/profile', icon: User },
          { name: 'Verification Submission', path: '/provider/verification', icon: ShieldCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleTitle = (r) => {
    switch (r) {
      case ROLES.ADMIN: return 'Platform Administrator';
      case ROLES.EMPLOYER: return 'Employer Workspace';
      case ROLES.WORKER: return 'Worker Hub';
      case ROLES.PROVIDER: return 'Provider Station';
      case ROLES.CUSTOMER: return 'Customer Portal';
      default: return 'User Workspace';
    }
  };

  const isSubPage = location.pathname !== dashboardRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Light Theme Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 text-slate-700">
        <div className="p-5 border-b border-slate-200 flex items-center space-x-3">
          <Link to={dashboardRoute()} className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">
              Labour<span className="text-teal-600">Connect</span>
            </span>
          </Link>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">{getRoleTitle(role)}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full text-slate-600 hover:text-rose-600 hover:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-900 hidden sm:block">
              {getRoleTitle(role)}
            </h2>
            {isSubPage && (
              <Link
                to={dashboardRoute()}
                className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard Overview</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={dashboardRoute()}
              className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-semibold text-xs hover:bg-teal-100 transition-colors flex items-center space-x-1.5 shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-slate-200"></div>

            <Link
              to="/jobs"
              className="text-xs font-medium text-slate-600 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              to="/services"
              className="text-xs font-medium text-slate-600 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Local Services
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="text-xs font-medium text-slate-600 hidden sm:block">
              <span className="font-bold text-slate-900">{user?.fullName}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer (Light Theme) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white text-slate-700 p-5 flex flex-col z-10 border-r border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <Link to={dashboardRoute()} onClick={() => setSidebarOpen(false)} className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-900 text-base">LabourConnect</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-200">
              <Button onClick={handleLogout} variant="danger" size="sm" className="w-full">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
