import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import Button from './Button';
import { Briefcase, Wrench, Shield, User, LogOut, Menu, X, ChevronRight, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, primaryRole, dashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = primaryRole();

  const getRoleBadge = (r) => {
    switch (r) {
      case ROLES.ADMIN: return 'bg-purple-100 text-purple-800 border-purple-200';
      case ROLES.EMPLOYER: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ROLES.WORKER: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ROLES.PROVIDER: return 'bg-amber-100 text-amber-800 border-amber-200';
      case ROLES.CUSTOMER: return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = (r) => {
    switch (r) {
      case ROLES.ADMIN: return 'Admin';
      case ROLES.EMPLOYER: return 'Employer';
      case ROLES.WORKER: return 'Skilled Worker';
      case ROLES.PROVIDER: return 'Service Provider';
      case ROLES.CUSTOMER: return 'Customer';
      default: return 'User';
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to={isAuthenticated ? dashboardRoute() : "/"} className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                  Labour<span className="text-teal-600">Connect</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Jobs & Local Services</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1 ml-8">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/jobs"
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Find Jobs</span>
                  </Link>
                  <Link
                    to="/services"
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span>Find Local Services</span>
                  </Link>
                </>
              ) : (
                <>
                  {role === ROLES.ADMIN && (
                    <>
                      <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Overview</Link>
                      <Link to="/admin/users" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Users</Link>
                      <Link to="/admin/verifications" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Verifications</Link>
                      <Link to="/admin/complaints" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Disputes</Link>
                    </>
                  )}
                  {role === ROLES.EMPLOYER && (
                    <>
                      <Link to="/employer/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                      <Link to="/employer/post-job" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Post Job</Link>
                      <Link to="/employer/manage-jobs" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">My Jobs</Link>
                      <Link to="/employer/search-workers" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Find Workers</Link>
                    </>
                  )}
                  {role === ROLES.WORKER && (
                    <>
                      <Link to="/worker/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                      <Link to="/jobs" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Browse Jobs</Link>
                      <Link to="/worker/applications" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">My Applications</Link>
                    </>
                  )}
                  {role === ROLES.CUSTOMER && (
                    <>
                      <Link to="/customer/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                      <Link to="/services" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Book Services</Link>
                      <Link to="/customer/requests" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">My Requests</Link>
                    </>
                  )}
                  {role === ROLES.PROVIDER && (
                    <>
                      <Link to="/provider/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                      <Link to="/provider/requests" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Incoming Requests</Link>
                      <Link to="/provider/profile" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Rates & Profile</Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to={dashboardRoute()}>
                  <Button variant="primary" size="sm" className="shadow-xs flex items-center space-x-1.5 font-semibold">
                    <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <div className="flex items-center space-x-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
                    {user?.fullName || user?.email}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(role)}`}>
                    {getRoleLabel(role)}
                  </span>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Find Jobs
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Find Local Services
              </Link>
              <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to={dashboardRoute()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl shadow-2xs"
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-4 h-4 text-teal-600" />
                  <span>Go to {getRoleLabel(role)} Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-600" />
              </Link>
              {role === ROLES.EMPLOYER && (
                <>
                  <Link to="/employer/post-job" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Post a Job</Link>
                  <Link to="/employer/manage-jobs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Manage Jobs</Link>
                  <Link to="/employer/search-workers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Search Workers</Link>
                </>
              )}
              {role === ROLES.WORKER && (
                <>
                  <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Browse Jobs</Link>
                  <Link to="/worker/applications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">My Applications</Link>
                </>
              )}
              {role === ROLES.CUSTOMER && (
                <>
                  <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Browse Services</Link>
                  <Link to="/customer/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">My Requests</Link>
                </>
              )}
              {role === ROLES.PROVIDER && (
                <>
                  <Link to="/provider/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Requests</Link>
                  <Link to="/provider/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Rates & Profile</Link>
                </>
              )}
              <div className="pt-3 border-t border-slate-100">
                <div className="px-3 py-2 text-xs text-slate-500 mb-2">
                  Signed in as <span className="font-semibold text-slate-800">{user?.fullName}</span> ({getRoleLabel(role)})
                </div>
                <Button onClick={handleLogout} variant="danger" size="sm" className="w-full">
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
