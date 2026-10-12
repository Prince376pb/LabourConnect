import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, SERVICE_STATUSES, VERIFICATION_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Wrench, Clock, CheckCircle2, ShieldCheck, ShieldAlert, Phone, MapPin, ArrowRight } from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchDashboardData = () => {
    Promise.all([
      api.get('/profiles/provider'),
      api.get('/requests/provider-requests')
    ])
      .then(([profRes, reqRes]) => {
        if (profRes.data) setProfile(profRes.data);
        if (reqRes.data && reqRes.data.content) setRequests(reqRes.data.content);
      })
      .catch((err) => console.error("Error loading provider dashboard", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (requestId, nextStatus, extraPayload = {}) => {
    setUpdatingStatusId(requestId);
    try {
      await api.put(`/requests/${requestId}/status`, {
        status: nextStatus,
        ...extraPayload
      });
      success(`Request moved to ${nextStatus}.`);
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      error(msg);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    const newAvail = !profile.available;
    try {
      await api.put('/profiles/provider', {
        ...profile,
        available: newAvail
      });
      setProfile({ ...profile, available: newAvail });
      success(`Availability switched to ${newAvail ? 'Available' : 'Unavailable'}.`);
    } catch (err) {
      error('Failed to update availability.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading provider station..." fullHeight />;

  const incomingRequests = requests.filter((r) => r.status === 'REQUESTED');
  const activeJobs = requests.filter((r) => ['ACCEPTED', 'ON_THE_WAY', 'SERVICE_STARTED'].includes(r.status));
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {profile?.businessName || user?.fullName}
            </h1>
            {profile?.verificationStatus === 'APPROVED' && (
              <span title="Administrator Verified" className="text-teal-600">
                <ShieldCheck className="w-6 h-6 fill-teal-50" />
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.city || 'City unset'} • Coverage: {profile?.serviceAreaRadiusKm || 15} km
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="md"
            variant={profile?.available ? 'success' : 'outline'}
            onClick={handleToggleAvailability}
          >
            {profile?.available ? '● Available for Orders' : '○ Marked as Busy'}
          </Button>

          <Link to="/provider/profile">
            <Button variant="outline" size="md">
              Edit Rates
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Notice Banner */}
      {profile?.verificationStatus !== 'APPROVED' && (
        <Alert
          type={profile?.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
          title={
            profile?.verificationStatus === 'REJECTED'
              ? 'Verification Application Rejected'
              : 'Verification Pending Review'
          }
          message={
            profile?.verificationStatus === 'REJECTED'
              ? `Reason: ${profile?.verificationNotes || 'Document discrepancies'}. Please resubmit valid government credentials.`
              : 'Your provider profile is currently pending administrator verification. Submit your license or ID to earn the Verified Provider trust badge.'
          }
        >
          <div className="mt-3">
            <Link to="/provider/verification">
              <Button size="sm" variant={profile?.verificationStatus === 'REJECTED' ? 'danger' : 'outline'}>
                Submit Verification Documents
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Pending Inquiries</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{incomingRequests.length}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Active In Progress</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{activeJobs.length}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Completed Work</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Badge Status</div>
            <div className="mt-1">
              <Badge color={VERIFICATION_STATUSES[profile?.verificationStatus]?.color || 'bg-slate-100'}>
                {profile?.verificationStatus}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Incoming Requests Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Incoming Customer Inquiries</h2>
        {incomingRequests.length === 0 ? (
          <EmptyState
            title="No new incoming requests"
            description="When nearby customers book your services, incoming requests will appear here for acceptance."
          />
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <Card key={req.id} className="p-6 border-amber-200 bg-amber-50/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong className="text-slate-800">{req.customerName}</strong> • {req.categoryName} • Booked {formatDate(req.createdAt)}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xs text-slate-400">Offered / Base Fee</div>
                    <div className="text-lg font-black text-teal-700">{formatCurrency(req.estimatedCost)}</div>
                  </div>
                </div>

                <p className="py-3 text-xs text-slate-700 leading-relaxed">
                  "{req.description}"
                </p>

                <div className="pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.serviceAddress}, {req.city}</span>
                    <span>•</span>
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.customerPhone}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="success"
                      loading={updatingStatusId === req.id}
                      onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                    >
                      Accept Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:border-rose-300"
                      loading={updatingStatusId === req.id}
                      onClick={() => {
                        const reason = window.prompt("Reason for declining this request:");
                        if (reason) handleStatusUpdate(req.id, 'REJECTED', { reason });
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Service Workflows Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Active In-Progress Orders</h2>
        {activeJobs.length === 0 ? (
          <EmptyState
            title="No active service jobs"
            description="Accepted jobs requiring technician dispatch and completion will show up here."
          />
        ) : (
          <div className="space-y-4">
            {activeJobs.map((req) => (
              <Card key={req.id} className="p-6 border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                      <Badge color={SERVICE_STATUSES[req.status]?.color || 'bg-slate-100'}>
                        {SERVICE_STATUSES[req.status]?.label || req.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      Customer: <strong>{req.customerName}</strong> ({req.customerPhone}) • {req.serviceAddress}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-xs text-slate-400">Current Cost</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {formatCurrency(req.finalCost || req.estimatedCost)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500">
                    Advance the lifecycle state as your technician progresses:
                  </div>

                  <div className="flex items-center space-x-2">
                    {req.status === 'ACCEPTED' && (
                      <Button
                        size="sm"
                        loading={updatingStatusId === req.id}
                        onClick={() => handleStatusUpdate(req.id, 'ON_THE_WAY')}
                      >
                        Dispatch (On The Way)
                      </Button>
                    )}

                    {req.status === 'ON_THE_WAY' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={updatingStatusId === req.id}
                        onClick={() => handleStatusUpdate(req.id, 'SERVICE_STARTED')}
                      >
                        Start Service On-Site
                      </Button>
                    )}

                    {req.status === 'SERVICE_STARTED' && (
                      <Button
                        size="sm"
                        variant="success"
                        loading={updatingStatusId === req.id}
                        onClick={() => {
                          const finalCost = window.prompt("Enter final service amount (₹):", String(req.estimatedCost || 350));
                          if (finalCost) {
                            handleStatusUpdate(req.id, 'COMPLETED', { finalCost: Number(finalCost) });
                          }
                        }}
                      >
                        Mark Completed & Settle
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
