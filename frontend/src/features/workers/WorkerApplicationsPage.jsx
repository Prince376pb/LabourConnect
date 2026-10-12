import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, getJobTypeBadge, formatJobCompensation, APPLICATION_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ReviewModal from '../reviews/ReviewModal';
import ComplaintModal from '../complaints/ComplaintModal';
import { Briefcase, Building, MapPin, Star, AlertOctagon, Search, RotateCcw } from 'lucide-react';

const WorkerApplicationsPage = () => {
  const { success, error } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [queryFilter, setQueryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  // Review modal
  const [reviewModalData, setReviewModalData] = useState(null);
  // Complaint modal
  const [complaintModalData, setComplaintModalData] = useState(null);

  const fetchApplications = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (queryFilter) params.set('query', queryFilter);
    params.set('page', page);
    params.set('size', 10);

    api.get(`/jobs/applications/my-applications?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setApplications(res.data.content);
          setTotalPages(res.data.totalPages || 1);
          setTotalApplications(res.data.totalElements || 0);
        } else {
          setApplications([]);
          setTotalApplications(0);
        }
      })
      .catch((err) => {
        console.error("Could not load applications", err);
        error('Failed to load application history.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 350);
    return () => clearTimeout(timer);
  }, [queryFilter]);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw your application?")) return;
    try {
      await api.post(`/jobs/applications/${applicationId}/withdraw`);
      success('Application withdrawn.');
      fetchApplications();
    } catch {
      error('Failed to withdraw application.');
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setQueryFilter('');
    setPage(0);
  };

  const hasActiveFilters = !!(statusFilter || queryFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Job Applications</h1>
        <p className="text-xs text-slate-500">Track hiring decisions, filter submissions, and review employers upon completion.</p>
      </div>

      {/* SMART FILTERS TOOLBAR */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by job title, employer, or location..."
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            >
              <option value="">All Application Statuses</option>
              <option value="APPLIED">Applied / Pending Review</option>
              <option value="SHORTLISTED">Shortlisted by Employer</option>
              <option value="ACCEPTED">Accepted / Hired</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center justify-center shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </button>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Found <strong className="text-teal-700">{totalApplications}</strong> application(s)
          </span>
          {totalPages > 1 && (
            <span>Page {page + 1} of {totalPages}</span>
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No applications match your filter" : "No applications submitted yet"}
          description={hasActiveFilters ? "Try adjusting your status or search keyword filters." : "Explore available jobs and submit your bids to connect with employers."}
          actionText={hasActiveFilters ? "Clear Filters" : "Browse Jobs"}
          onAction={hasActiveFilters ? handleClearFilters : () => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-6 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                    <h3 className="font-bold text-slate-900 text-base">{app.jobTitle}</h3>
                    {app.jobType && (() => {
                      const tb = getJobTypeBadge(app.jobType);
                      return (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${tb.bg} ${tb.text} ${tb.border}`}>
                          {tb.label}
                        </span>
                      );
                    })()}
                    <Badge color={APPLICATION_STATUSES[app.status]?.color || 'bg-slate-100'}>
                      {APPLICATION_STATUSES[app.status]?.label || app.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-2 flex-wrap">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.employerCompanyName}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.jobCity}</span>
                    {app.jobWorkingHours && (
                      <>
                        <span>•</span>
                        <span>{app.jobWorkingHours}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Applied {formatDate(app.createdAt)}</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs text-slate-400">Your Bid / Expected</div>
                  <div className="text-lg font-black text-teal-700">
                    {formatCurrency(app.bidAmount)}{app.jobType === 'REGULAR' || app.jobType === 'REGULAR_EMPLOYMENT' ? '/mo' : '/day'}
                  </div>
                </div>
              </div>

              {app.coverNote && (
                <div className="py-3 text-xs text-slate-600">
                  <strong>Your Note:</strong> "{app.coverNote}"
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-500">
                  {app.status === 'ACCEPTED' && (
                    <span className="text-emerald-700 font-semibold">
                      🎉 Congratulations! You have been accepted for this job. Contact the employer.
                    </span>
                  )}
                  {app.status === 'SHORTLISTED' && (
                    <span className="text-blue-700 font-semibold">
                      ⭐ Your profile has been shortlisted by the employer.
                    </span>
                  )}
                  {app.status === 'REJECTED' && (
                    <span className="text-slate-400">Application not selected.</span>
                  )}
                  {app.status === 'APPLIED' && (
                    <span className="text-slate-500">Under review by employer.</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {app.status === 'APPLIED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700 hover:border-rose-300"
                      onClick={() => handleWithdraw(app.id)}
                    >
                      Withdraw Bid
                    </Button>
                  )}

                  {app.status === 'ACCEPTED' && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setReviewModalData({
                            revieweeId: app.employerUserId,
                            jobId: app.jobId,
                            title: `Review Employer: ${app.employerCompanyName}`
                          })
                        }
                      >
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                        Rate Employer
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() =>
                          setComplaintModalData({
                            reportedUserId: app.employerUserId,
                            jobId: app.jobId,
                            title: `Dispute Regarding Job: ${app.jobTitle}`
                          })
                        }
                      >
                        <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                        Report Issue
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

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
          jobId={reviewModalData.jobId}
          title={reviewModalData.title}
          onSuccess={() => {
            setReviewModalData(null);
            fetchApplications();
          }}
        />
      )}

      {/* Complaint Modal */}
      {complaintModalData && (
        <ComplaintModal
          isOpen={!!complaintModalData}
          onClose={() => setComplaintModalData(null)}
          reportedUserId={complaintModalData.reportedUserId}
          jobId={complaintModalData.jobId}
          title={complaintModalData.title}
          onSuccess={() => {
            setComplaintModalData(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default WorkerApplicationsPage;
