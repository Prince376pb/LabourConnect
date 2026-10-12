import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Public pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsPage from '../pages/TermsPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import JobBrowsePage from '../features/jobs/JobBrowsePage';
import JobDetailsPage from '../features/jobs/JobDetailsPage';
import ServiceDiscoveryPage from '../features/services/ServiceDiscoveryPage';

// Admin feature
import AdminDashboard from '../features/admin/AdminDashboard';

// Employer features
import EmployerDashboard from '../features/employers/EmployerDashboard';
import PostJobPage from '../features/employers/PostJobPage';
import ManageJobsPage from '../features/employers/ManageJobsPage';
import WorkerSearchPage from '../features/employers/WorkerSearchPage';
import EmployerProfilePage from '../features/employers/EmployerProfilePage';

// Worker features
import WorkerDashboard from '../features/workers/WorkerDashboard';
import WorkerApplicationsPage from '../features/workers/WorkerApplicationsPage';
import WorkerProfilePage from '../features/workers/WorkerProfilePage';

// Customer features
import CustomerDashboard from '../features/customers/CustomerDashboard';
import CustomerRequestsPage from '../features/customers/CustomerRequestsPage';
import CustomerProfilePage from '../features/customers/CustomerProfilePage';

// Provider features
import ProviderDashboard from '../features/providers/ProviderDashboard';
import ProviderRequestsPage from '../features/providers/ProviderRequestsPage';
import ProviderProfilePage from '../features/providers/ProviderProfilePage';
import ProviderVerificationPage from '../features/providers/ProviderVerificationPage';

const HomeOrDashboard = () => {
  const { isAuthenticated, user, loading, dashboardRoute } = useAuth();
  if (loading) {
    return <LoadingSpinner text="Authenticating..." fullHeight />;
  }
  if (isAuthenticated && user) {
    return <Navigate to={dashboardRoute(user)} replace />;
  }
  return <HomePage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeOrDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />
        <Route path="/jobs" element={<JobBrowsePage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/services" element={<ServiceDiscoveryPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Dashboard Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard initialTab="overview" />} />
        <Route path="users" element={<AdminDashboard initialTab="users" />} />
        <Route path="verifications" element={<AdminDashboard initialTab="verifications" />} />
        <Route path="categories" element={<AdminDashboard initialTab="categories" />} />
        <Route path="complaints" element={<AdminDashboard initialTab="complaints" />} />
        <Route path="audit-logs" element={<AdminDashboard initialTab="audit" />} />
      </Route>

      {/* Employer Dashboard Protected Routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRoles={[ROLES.EMPLOYER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="post-job" element={<PostJobPage />} />
        <Route path="manage-jobs" element={<ManageJobsPage />} />
        <Route path="search-workers" element={<WorkerSearchPage />} />
        <Route path="profile" element={<EmployerProfilePage />} />
      </Route>

      {/* Worker Dashboard Protected Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={[ROLES.WORKER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="dashboard" element={<WorkerDashboard />} />
        <Route path="applications" element={<WorkerApplicationsPage />} />
        <Route path="profile" element={<WorkerProfilePage />} />
      </Route>

      {/* Customer Dashboard Protected Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="requests" element={<CustomerRequestsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Service Provider Dashboard Protected Routes */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PROVIDER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="requests" element={<ProviderRequestsPage />} />
        <Route path="profile" element={<ProviderProfilePage />} />
        <Route path="verification" element={<ProviderVerificationPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
