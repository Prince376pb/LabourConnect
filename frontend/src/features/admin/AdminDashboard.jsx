import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Wrench,
  ShieldCheck,
  AlertOctagon,
  FileText,
  FolderTree,
  CheckCircle,
  XCircle,
  Search,
  PlusCircle,
  ShieldAlert,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

const AdminDashboard = ({ initialTab }) => {
  const { success, error } = useToast();
  const location = useLocation();

  const getInitialTab = () => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/verifications')) return 'verifications';
    if (location.pathname.includes('/categories')) return 'categories';
    if (location.pathname.includes('/complaints')) return 'complaints';
    if (location.pathname.includes('/audit')) return 'audit';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, initialTab]);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Tab: Users state & smart filters
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalElements, setUserTotalElements] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Tab: Verifications state & smart filters
  const [verifications, setVerifications] = useState([]);
  const [verifStatus, setVerifStatus] = useState('PENDING');
  const [verifCategory, setVerifCategory] = useState('');
  const [verifQuery, setVerifQuery] = useState('');
  const [verifPage, setVerifPage] = useState(0);
  const [verifTotalPages, setVerifTotalPages] = useState(1);
  const [verifTotalElements, setVerifTotalElements] = useState(0);
  const [loadingVerifications, setLoadingVerifications] = useState(false);

  // Tab: Categories state & smart filters
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState('');
  const [catStatus, setCatStatus] = useState('');
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Tab: Complaints state & smart filters
  const [complaints, setComplaints] = useState([]);
  const [complaintStatus, setComplaintStatus] = useState('');
  const [complaintQuery, setComplaintQuery] = useState('');
  const [complaintPage, setComplaintPage] = useState(0);
  const [complaintTotalPages, setComplaintTotalPages] = useState(1);
  const [complaintTotalElements, setComplaintTotalElements] = useState(0);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingComplaint, setResolvingComplaint] = useState(false);

  // Tab: Audit logs state & smart filters
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditAction, setAuditAction] = useState('');
  const [auditQuery, setAuditQuery] = useState('');
  const [auditPage, setAuditPage] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalElements, setAuditTotalElements] = useState(0);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchStats = () => {
    setLoadingStats(true);
    api.get('/admin/stats')
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err) => console.error("Could not load admin stats", err))
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchStats();
    fetchCategoriesCatalog();
  }, []);

  const fetchCategoriesCatalog = () => {
    api.get('/categories?activeOnly=false')
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error("Could not load categories", err));
  };

  // Fetch data per tab
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userRole, userStatus, userPage]);

  useEffect(() => {
    if (activeTab === 'verifications') fetchVerifications();
  }, [activeTab, verifStatus, verifCategory, verifPage]);

  useEffect(() => {
    if (activeTab === 'categories') fetchCategoriesCatalog();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
  }, [activeTab, complaintStatus, complaintPage]);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, auditAction, auditPage]);

  // Debounced search triggers for Users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'users') {
        setUserPage(0);
        fetchUsers();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [userQuery]);

  // Debounced search triggers for Verifications
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'verifications') {
        setVerifPage(0);
        fetchVerifications();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [verifQuery]);

  // Debounced search triggers for Complaints
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'complaints') {
        setComplaintPage(0);
        fetchComplaints();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [complaintQuery]);

  // Debounced search triggers for Audit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'audit') {
        setAuditPage(0);
        fetchAuditLogs();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [auditQuery]);

  // --- API FETCH METHODS ---
  const fetchUsers = () => {
    setLoadingUsers(true);
    const params = new URLSearchParams();
    if (userQuery) params.set('query', userQuery);
    if (userRole) params.set('role', userRole);
    if (userStatus) params.set('status', userStatus);
    params.set('page', userPage);
    params.set('size', 10);

    api.get(`/admin/users?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setUsers(res.data.content);
          setUserTotalPages(res.data.totalPages || 1);
          setUserTotalElements(res.data.totalElements || 0);
        } else {
          setUsers([]);
          setUserTotalElements(0);
        }
      })
      .catch(() => error('Failed to load users.'))
      .finally(() => setLoadingUsers(false));
  };

  const handleToggleSuspendUser = async (u) => {
    const nextSuspended = !u.suspended;
    let reason = null;
    if (nextSuspended) {
      reason = window.prompt("Enter reason for account suspension:");
      if (!reason) return;
    } else {
      if (!window.confirm(`Reactivate user account ${u.email}?`)) return;
    }

    try {
      await api.put(`/admin/users/${u.id}/status`, {
        suspended: nextSuspended,
        suspensionReason: reason
      });
      success(`User account ${nextSuspended ? 'suspended' : 'reactivated'}.`);
      fetchUsers();
      fetchStats();
    } catch {
      error('Failed to change user status.');
    }
  };

  const fetchVerifications = () => {
    setLoadingVerifications(true);
    const params = new URLSearchParams();
    if (verifStatus && verifStatus !== 'ALL') params.set('status', verifStatus);
    if (verifCategory) params.set('categoryId', verifCategory);
    if (verifQuery) params.set('query', verifQuery);
    params.set('page', verifPage);
    params.set('size', 10);

    api.get(`/admin/verifications?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setVerifications(res.data.content);
          setVerifTotalPages(res.data.totalPages || 1);
          setVerifTotalElements(res.data.totalElements || 0);
        } else {
          setVerifications([]);
          setVerifTotalElements(0);
        }
      })
      .catch(() => error('Failed to load pending verifications.'))
      .finally(() => setLoadingVerifications(false));
  };

  const handleDecideVerification = async (providerId, decision) => {
    const notes = window.prompt(`Enter review notes for ${decision}:`) || `${decision} by administrator`;
    try {
      await api.put(`/admin/verifications/${providerId}`, {
        status: decision,
        notes
      });
      success(`Verification decision set to ${decision}.`);
      fetchVerifications();
      fetchStats();
    } catch {
      error('Failed to process verification decision.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreatingCat(true);
    try {
      await api.post('/categories', {
        name: newCatName,
        description: newCatDesc,
        active: true
      });
      success('Service category created successfully.');
      setNewCatModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchCategoriesCatalog();
    } catch {
      error('Failed to create category.');
    } finally {
      setCreatingCat(false);
    }
  };

  const fetchComplaints = () => {
    setLoadingComplaints(true);
    const params = new URLSearchParams();
    if (complaintStatus) params.set('status', complaintStatus);
    if (complaintQuery) params.set('query', complaintQuery);
    params.set('page', complaintPage);
    params.set('size', 10);

    api.get(`/admin/complaints?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setComplaints(res.data.content);
          setComplaintTotalPages(res.data.totalPages || 1);
          setComplaintTotalElements(res.data.totalElements || 0);
        } else {
          setComplaints([]);
          setComplaintTotalElements(0);
        }
      })
      .catch(() => error('Failed to load complaints.'))
      .finally(() => setLoadingComplaints(false));
  };

  const handleResolveComplaint = async (status) => {
    if (!resolutionNotes.trim()) {
      error('Please write administrative resolution notes.');
      return;
    }

    setResolvingComplaint(true);
    try {
      await api.put(`/admin/complaints/${activeComplaint.id}`, {
        status,
        adminResolutionNotes: resolutionNotes
      });
      success(`Complaint status set to ${status}.`);
      setActiveComplaint(null);
      setResolutionNotes('');
      fetchComplaints();
      fetchStats();
    } catch {
      error('Failed to resolve complaint.');
    } finally {
      setResolvingComplaint(false);
    }
  };

  const fetchAuditLogs = () => {
    setLoadingAudit(true);
    const params = new URLSearchParams();
    if (auditAction) params.set('action', auditAction);
    if (auditQuery) params.set('query', auditQuery);
    params.set('page', auditPage);
    params.set('size', 15);

    api.get(`/admin/audit-logs?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setAuditLogs(res.data.content);
          setAuditTotalPages(res.data.totalPages || 1);
          setAuditTotalElements(res.data.totalElements || 0);
        } else {
          setAuditLogs([]);
          setAuditTotalElements(0);
        }
      })
      .catch(() => error('Failed to load audit logs.'))
      .finally(() => setLoadingAudit(false));
  };

  // Filtered categories for Tab 4 (client-side)
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = !catSearch.trim() || 
      c.name.toLowerCase().includes(catSearch.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(catSearch.toLowerCase()));
    const matchesStatus = !catStatus || 
      (catStatus === 'ACTIVE' && c.active) || 
      (catStatus === 'INACTIVE' && !c.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Administration Hub</h1>
          <p className="text-xs text-slate-500">Live PostgreSQL database metrics, security governance, and multi-filter registry.</p>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap gap-1 bg-slate-200/70 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'verifications', label: `Verifications (${stats?.pendingVerifications || 0})` },
            { id: 'categories', label: 'Categories' },
            { id: 'complaints', label: `Disputes (${stats?.pendingComplaints || 0})` },
            { id: 'audit', label: 'Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & REAL DATABASE METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loadingStats ? (
            <LoadingSpinner text="Computing database statistics..." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Registered Users</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalUsers || 0}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">{stats?.activeUsers || 0} active</div>
                  </div>
                </Card>

                <Card className="p-5 flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Job Posts</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalJobs || 0}</div>
                    <div className="text-[11px] text-teal-600 font-semibold">{stats?.openJobs || 0} open for bids</div>
                  </div>
                </Card>

                <Card className="p-5 flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Service Requests</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalServiceRequests || 0}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">{stats?.completedServiceRequests || 0} completed</div>
                  </div>
                </Card>

                <Card className="p-5 flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Pending Verifications</div>
                    <div className="text-2xl font-black text-amber-700 mt-0.5">{stats?.pendingVerifications || 0}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Action required</div>
                  </div>
                </Card>
              </div>

              {/* Action shortcut cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Pending Provider Document Reviews</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {stats?.pendingVerifications || 0} providers waiting for administrator ID screening and badge approval.
                  </p>
                  <Button size="sm" onClick={() => setActiveTab('verifications')}>
                    Review Verifications
                  </Button>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">User Disputes & Complaints Desk</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {stats?.pendingComplaints || 0} active disputes submitted by customers or contractors.
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => setActiveTab('complaints')}>
                    Mediate Disputes
                  </Button>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: USERS WITH SMART FILTERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <Card className="p-4 border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search user by name, email, or phone..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={userRole}
                  onChange={(e) => { setUserRole(e.target.value); setUserPage(0); }}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                >
                  <option value="">All Roles</option>
                  <option value="WORKER">Worker</option>
                  <option value="EMPLOYER">Employer</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Service Provider</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="w-full sm:w-40">
                <select
                  value={userStatus}
                  onChange={(e) => { setUserStatus(e.target.value); setUserPage(0); }}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active Users</option>
                  <option value="SUSPENDED">Suspended Users</option>
                </select>
              </div>

              {(userQuery || userRole || userStatus) && (
                <button
                  type="button"
                  onClick={() => {
                    setUserQuery('');
                    setUserRole('');
                    setUserStatus('');
                    setUserPage(0);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center justify-center shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Found <span className="text-teal-700 font-bold">{userTotalElements}</span> matching users
              </span>
              {userTotalPages > 1 && (
                <span>Page {userPage + 1} of {userTotalPages}</span>
              )}
            </div>
          </Card>

          {loadingUsers ? (
            <LoadingSpinner text="Filtering user database..." />
          ) : users.length === 0 ? (
            <EmptyState
              title="No users match filters"
              description="Try adjusting your role, status, or search query to find accounts."
              actionText="Reset Filters"
              onAction={() => {
                setUserQuery('');
                setUserRole('');
                setUserStatus('');
                setUserPage(0);
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Roles</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{u.phoneNumber || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r) => (
                            <span key={r} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                              {r.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.suspended ? (
                          <Badge color="bg-rose-100 text-rose-800">Suspended</Badge>
                        ) : (
                          <Badge color="bg-emerald-100 text-emerald-800">Active</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={u.suspended ? 'success' : 'danger'}
                          onClick={() => handleToggleSuspendUser(u)}
                        >
                          {u.suspended ? 'Reactivate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {userTotalPages > 1 && (
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Page {userPage + 1} of {userTotalPages}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={userPage === 0}
                      onClick={() => setUserPage((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={userPage >= userTotalPages - 1}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFICATIONS WITH SMART FILTERS */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <Card className="p-4 border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search provider, business name, or city..."
                  value={verifQuery}
                  onChange={(e) => setVerifQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={verifStatus}
                  onChange={(e) => { setVerifStatus(e.target.value); setVerifPage(0); }}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                >
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved Badges</option>
                  <option value="REJECTED">Rejected Submissions</option>
                  <option value="ALL">All Statuses</option>
                </select>
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={verifCategory}
                  onChange={(e) => { setVerifCategory(e.target.value); setVerifPage(0); }}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                >
                  <option value="">All Trade Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {(verifQuery || verifStatus !== 'PENDING' || verifCategory) && (
                <button
                  type="button"
                  onClick={() => {
                    setVerifQuery('');
                    setVerifStatus('PENDING');
                    setVerifCategory('');
                    setVerifPage(0);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center justify-center shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Found <span className="text-teal-700 font-bold">{verifTotalElements}</span> verifications
              </span>
              {verifTotalPages > 1 && (
                <span>Page {verifPage + 1} of {verifTotalPages}</span>
              )}
            </div>
          </Card>

          {loadingVerifications ? (
            <LoadingSpinner text="Loading provider verification submissions..." />
          ) : verifications.length === 0 ? (
            <EmptyState
              title="No verification requests matching filters"
              description="Change the status filter above to view approved or rejected profiles."
              actionText="Reset Filters"
              onAction={() => {
                setVerifQuery('');
                setVerifStatus('ALL');
                setVerifCategory('');
                setVerifPage(0);
              }}
            />
          ) : (
            <div className="space-y-4">
              {verifications.map((p) => (
                <Card key={p.id} className="p-6 border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{p.businessName}</h3>
                        <Badge
                          color={
                            p.verificationStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.verificationStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }
                        >
                          {p.verificationStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Provider: <strong>{p.fullName}</strong> ({p.email}) • Phone: {p.phone} • City: {p.city}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {p.verificationStatus !== 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleDecideVerification(p.id, 'APPROVED')}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      )}
                      {p.verificationStatus !== 'REJECTED' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDecideVerification(p.id, 'REJECTED')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="py-3 text-xs space-y-1">
                    <div><strong>Submitted ID / License:</strong> <span className="font-mono text-slate-700">{p.idProofUrl || 'None specified'}</span></div>
                    <div><strong>Provider Submission Notes:</strong> "{p.verificationNotes || 'None'}"</div>
                    <div><strong>Trade Experience:</strong> {p.yearsOfExperience} yrs | <strong>Base Consultation:</strong> ₹{p.baseRate}</div>
                  </div>
                </Card>
              ))}

              {verifTotalPages > 1 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Page {verifPage + 1} of {verifTotalPages}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={verifPage === 0}
                      onClick={() => setVerifPage((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={verifPage >= verifTotalPages - 1}
                      onClick={() => setVerifPage((p) => p + 1)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CATEGORIES WITH SMART FILTER */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <Card className="p-4 border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search category name or description..."
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                  />
                </div>

                <div className="w-40">
                  <select
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                  >
                    <option value="">All Categories</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Disabled</option>
                  </select>
                </div>

                {(catSearch || catStatus) && (
                  <button
                    type="button"
                    onClick={() => { setCatSearch(''); setCatStatus(''); }}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              <Button onClick={() => setNewCatModalOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Showing <strong className="text-teal-700">{filteredCategories.length}</strong> of {categories.length} trade categories
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((c) => (
              <Card key={c.id} className="p-5 border-slate-200 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <Badge color={c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                      {c.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* New Category Modal */}
          {newCatModalOpen && (
            <Modal
              isOpen={newCatModalOpen}
              onClose={() => setNewCatModalOpen(false)}
              title="Add New On-Demand Category"
            >
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input
                  label="Category Name"
                  placeholder="e.g. Masonry & Wall Repair"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description of services included..."
                    className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setNewCatModalOpen(false)} disabled={creatingCat}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={creatingCat}>
                    Create Category
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 5: COMPLAINTS WITH SMART FILTERS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <Card className="p-4 border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search dispute subject, parties, or description..."
                  value={complaintQuery}
                  onChange={(e) => setComplaintQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={complaintStatus}
                  onChange={(e) => { setComplaintStatus(e.target.value); setComplaintPage(0); }}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>

              {(complaintQuery || complaintStatus) && (
                <button
                  type="button"
                  onClick={() => {
                    setComplaintQuery('');
                    setComplaintStatus('');
                    setComplaintPage(0);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center justify-center shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Found <span className="text-teal-700 font-bold">{complaintTotalElements}</span> disputes
              </span>
              {complaintTotalPages > 1 && (
                <span>Page {complaintPage + 1} of {complaintTotalPages}</span>
              )}
            </div>
          </Card>

          {loadingComplaints ? (
            <LoadingSpinner text="Loading disputes..." />
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No disputes matching filters"
              description="No user complaints or mediation issues currently match your selection."
              actionText="Reset Filters"
              onAction={() => {
                setComplaintQuery('');
                setComplaintStatus('');
                setComplaintPage(0);
              }}
            />
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <Card key={c.id} className="p-6 border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{c.subject}</h3>
                        <Badge
                          color={
                            c.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'DISMISSED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Complainant: <strong>{c.complainantName}</strong> • Against: <strong>{c.reportedUserName}</strong> • {formatDate(c.createdAt)}
                      </div>
                    </div>

                    <Button size="sm" onClick={() => { setActiveComplaint(c); setResolutionNotes(c.adminResolutionNotes || ''); }}>
                      Resolve Dispute
                    </Button>
                  </div>

                  <p className="py-3 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    "{c.description}"
                  </p>

                  {c.adminResolutionNotes && (
                    <div className="p-3 bg-teal-50 rounded-xl text-xs text-teal-900 border border-teal-200">
                      <strong>Admin Resolution:</strong> {c.adminResolutionNotes}
                    </div>
                  )}
                </Card>
              ))}

              {complaintTotalPages > 1 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Page {complaintPage + 1} of {complaintTotalPages}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={complaintPage === 0}
                      onClick={() => setComplaintPage((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={complaintPage >= complaintTotalPages - 1}
                      onClick={() => setComplaintPage((p) => p + 1)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resolve Complaint Modal */}
          {activeComplaint && (
            <Modal
              isOpen={!!activeComplaint}
              onClose={() => setActiveComplaint(null)}
              title={`Resolve Dispute: ${activeComplaint.subject}`}
            >
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div>Complainant: <strong>{activeComplaint.complainantName}</strong></div>
                  <div>Reported Party: <strong>{activeComplaint.reportedUserName}</strong></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Administrative Decision & Notes
                  </label>
                  <textarea
                    rows="4"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document your findings, mediation actions taken, and final outcome..."
                    className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setActiveComplaint(null)} disabled={resolvingComplaint}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    loading={resolvingComplaint}
                    onClick={() => handleResolveComplaint('DISMISSED')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="success"
                    loading={resolvingComplaint}
                    onClick={() => handleResolveComplaint('RESOLVED')}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 6: SECURITY AUDIT LOGS WITH SMART FILTERS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <Card className="p-4 border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search entity, action details, or user..."
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={auditAction}
                  onChange={(e) => { setAuditAction(e.target.value); setAuditPage(0); }}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                >
                  <option value="">All Event Actions</option>
                  <option value="LOGIN">User Login</option>
                  <option value="REGISTER">Registration</option>
                  <option value="GOOGLE_LOGIN">Google Login</option>
                  <option value="USER_STATUS_CHANGE">Status Change</option>
                  <option value="VERIFICATION_DECISION">Verification Review</option>
                  <option value="COMPLAINT_RESOLVED">Complaint Resolved</option>
                </select>
              </div>

              {(auditQuery || auditAction) && (
                <button
                  type="button"
                  onClick={() => {
                    setAuditQuery('');
                    setAuditAction('');
                    setAuditPage(0);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center justify-center shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Found <span className="text-teal-700 font-bold">{auditTotalElements}</span> audit event entries
              </span>
              {auditTotalPages > 1 && (
                <span>Page {auditPage + 1} of {auditTotalPages}</span>
              )}
            </div>
          </Card>

          {loadingAudit ? (
            <LoadingSpinner text="Reading audit logs..." />
          ) : auditLogs.length === 0 ? (
            <EmptyState
              title="No audit events matching criteria"
              description="Try resetting action and keyword filters to view all entries."
              actionText="Reset Filters"
              onAction={() => {
                setAuditQuery('');
                setAuditAction('');
                setAuditPage(0);
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 text-xs">
                      <td className="px-6 py-3 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{log.entityName} #{log.entityId}</td>
                      <td className="px-6 py-3 text-slate-500 max-w-xs truncate">{log.details}</td>
                      <td className="px-6 py-3 text-slate-400 font-mono text-[11px]">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {auditTotalPages > 1 && (
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Page {auditPage + 1} of {auditTotalPages}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={auditPage === 0}
                      onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={auditPage >= auditTotalPages - 1}
                      onClick={() => setAuditPage((p) => p + 1)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
