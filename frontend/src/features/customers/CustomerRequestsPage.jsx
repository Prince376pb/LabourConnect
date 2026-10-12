import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, SERVICE_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ReviewModal from '../reviews/ReviewModal';
import ComplaintModal from '../complaints/ComplaintModal';
import { Clock, Wrench, MapPin, Phone, Star, AlertOctagon, CheckCircle2, ChevronRight, Search, RotateCcw } from 'lucide-react';

const CustomerRequestsPage = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [queryFilter, setQueryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  // Review modal
  const [reviewModalData, setReviewModalData] = useState(null);
  // Complaint modal
  const [complaintModalData, setComplaintModalData] = useState(null);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error("Could not load categories", err));
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (categoryFilter) params.set('categoryId', categoryFilter);
    if (queryFilter) params.set('query', queryFilter);
    params.set('page', page);
    params.set('size', 10);

    api.get(`/requests/my-requests?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setRequests(res.data.content);
          setTotalPages(res.data.totalPages || 1);
          setTotalRequests(res.data.totalElements || 0);
        } else {
          setRequests([]);
          setTotalRequests(0);
        }
      })
      .catch((err) => {
        console.error("Could not load requests", err);
        error('Failed to load your service requests.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 350);
    return () => clearTimeout(timer);
  }, [queryFilter]);

  const handleCancelRequest = async (requestId) => {
    const reason = window.prompt("Please state the reason for cancellation:");
    if (!reason) return;

    try {
      await api.post(`/requests/${requestId}/cancel?reason=${encodeURIComponent(reason)}`);
      success('Service request cancelled.');
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel request.';
      error(msg);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setQueryFilter('');
    setPage(0);
  };

  const hasActiveFilters = !!(statusFilter || categoryFilter || queryFilter);

  const getLifecycleStep = (status) => {
    switch (status) {
      case 'REQUESTED': return 1;
      case 'ACCEPTED': return 2;
      case 'ON_THE_WAY': return 3;
      case 'SERVICE_STARTED': return 4;
      case 'COMPLETED': return 5;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Service Bookings</h1>
        <p className="text-xs text-slate-500">Live progress tracking, service cancellation, filters, and ratings.</p>
      </div>

      {/* SMART FILTERS TOOLBAR */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by provider, description, or city..."
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            >
              <option value="">All Service Statuses</option>
              <option value="REQUESTED">Requested / Pending</option>
              <option value="ACCEPTED">Accepted by Provider</option>
              <option value="ON_THE_WAY">Provider On The Way</option>
              <option value="SERVICE_STARTED">Service In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Declined</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            >
              <option value="">All Trade Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center justify-center shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Showing <strong className="text-teal-700">{totalRequests}</strong> booking request(s)
          </span>
          {totalPages > 1 && (
            <span>Page {page + 1} of {totalPages}</span>
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading orders..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No service requests match filters" : "No service requests booked"}
          description={hasActiveFilters ? "Try clearing your filters to see previous service orders." : "Whenever you need on-demand local assistance, book a provider directly."}
          actionText={hasActiveFilters ? "Clear Filters" : "Find Services"}
          onAction={hasActiveFilters ? handleClearFilters : () => (window.location.href = '/services')}
        />
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const step = getLifecycleStep(req.status);
            const isTerminal = req.status === 'COMPLETED' || req.status === 'CANCELLED' || req.status === 'REJECTED';

            return (
              <Card key={req.id} className="p-6 border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                      <Badge color={SERVICE_STATUSES[req.status]?.color || 'bg-slate-100'}>
                        {SERVICE_STATUSES[req.status]?.label || req.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.providerBusinessName}</span>
                      <span>•</span>
                      <span>{req.categoryName}</span>
                      <span>•</span>
                      <span>Booked {formatDate(req.createdAt)}</span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-xs text-slate-400">Total / Estimated Cost</div>
                    <div className="text-lg font-black text-slate-900">
                      {formatCurrency(req.finalCost || req.estimatedCost)}
                    </div>
                  </div>
                </div>

                {/* Progress Visualizer */}
                {step > 0 && (
                  <div className="py-4 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Service Progress:</div>
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                      {[
                        { label: 'Requested', s: 1 },
                        { label: 'Accepted', s: 2 },
                        { label: 'On The Way', s: 3 },
                        { label: 'Work Started', s: 4 },
                        { label: 'Completed', s: 5 },
                      ].map((item) => {
                        const isDone = step >= item.s;
                        const isCurrent = step === item.s;
                        return (
                          <div
                            key={item.s}
                            className={`p-2 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-1 ring-teal-500'
                                : isDone
                                ? 'bg-slate-50 border-slate-200 text-slate-700'
                                : 'bg-slate-50/50 border-dashed border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="truncate">{item.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {req.description && (
                  <div className="py-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Problem Description:</span> "{req.description}"
                  </div>
                )}

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.serviceAddress}, {req.city}</span>
                    {req.providerPhone && (
                      <>
                        <span>•</span>
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{req.providerPhone}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Rate & Review Provider */}
                    {req.status === 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setReviewModalData({
                            serviceRequestId: req.id,
                            revieweeId: req.providerUserId,
                            providerName: req.providerBusinessName
                          })
                        }
                      >
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500" />
                        Rate Provider
                      </Button>
                    )}

                    {/* Dispute */}
                    {req.status !== 'REQUESTED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() =>
                          setComplaintModalData({
                            serviceRequestId: req.id,
                            reportedUserId: req.providerUserId,
                            providerName: req.providerBusinessName
                          })
                        }
                      >
                        <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                        Report Issue
                      </Button>
                    )}

                    {/* Cancellation */}
                    {(req.status === 'REQUESTED' || req.status === 'ACCEPTED') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:border-rose-300"
                        onClick={() => handleCancelRequest(req.id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {totalPages > 1 && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Page {page + 1} of {totalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <ReviewModal
          isOpen={!!reviewModalData}
          onClose={() => setReviewModalData(null)}
          revieweeId={reviewModalData.revieweeId}
          revieweeName={reviewModalData.providerName}
          serviceRequestId={reviewModalData.serviceRequestId}
          onReviewSubmitted={() => success('Review submitted successfully!')}
        />
      )}

      {/* Dispute Modal */}
      {complaintModalData && (
        <ComplaintModal
          isOpen={!!complaintModalData}
          onClose={() => setComplaintModalData(null)}
          reportedUserId={complaintModalData.reportedUserId}
          reportedUserName={complaintModalData.providerName}
          serviceRequestId={complaintModalData.serviceRequestId}
          onComplaintFiled={() => success('Dispute reported to platform admin.')}
        />
      )}
    </div>
  );
};

export default CustomerRequestsPage;
