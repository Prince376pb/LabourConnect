import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, formatJobCompensation, getJobTypeBadge, JOB_STATUSES, APPLICATION_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StarRating from '../../components/common/StarRating';
import { Briefcase, Users, PlusCircle, CheckCircle, XCircle, Clock, Phone, MapPin, Search, RotateCcw } from 'lucide-react';

const ManageJobsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [queryFilter, setQueryFilter] = useState('');
  const [jobPage, setJobPage] = useState(0);
  const [jobTotalPages, setJobTotalPages] = useState(1);
  const [jobTotalElements, setJobTotalElements] = useState(0);

  // Applicant management modal
  const [activeJob, setActiveJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [processingAppId, setProcessingAppId] = useState(null);

  // Modal Applicant Filters
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appQueryFilter, setAppQueryFilter] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (jobTypeFilter) params.set('jobType', jobTypeFilter);
    if (cityFilter) params.set('city', cityFilter);
    if (queryFilter) params.set('query', queryFilter);
    params.set('page', jobPage);
    params.set('size', 10);

    api.get(`/jobs/my-jobs?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setJobs(res.data.content);
          setJobTotalPages(res.data.totalPages || 1);
          setJobTotalElements(res.data.totalElements || 0);

          const initialJobId = searchParams.get('jobId');
          if (initialJobId) {
            const found = res.data.content.find((j) => String(j.id) === String(initialJobId));
            if (found) openApplicantsModal(found);
          }
        } else {
          setJobs([]);
          setJobTotalElements(0);
        }
      })
      .catch((err) => {
        console.error("Could not load jobs", err);
        error('Failed to load your jobs.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, jobTypeFilter, jobPage]);

  // Debounce search query & city filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setJobPage(0);
      fetchJobs();
    }, 350);
    return () => clearTimeout(timer);
  }, [queryFilter, cityFilter]);

  const openApplicantsModal = (job) => {
    setActiveJob(job);
    fetchApplications(job.id);
  };

  const fetchApplications = (jobId) => {
    setLoadingApps(true);
    const params = new URLSearchParams();
    if (appStatusFilter) params.set('status', appStatusFilter);
    if (appQueryFilter) params.set('query', appQueryFilter);

    api.get(`/jobs/${jobId}/applications?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) setApplications(res.data.content);
        else setApplications([]);
      })
      .catch((err) => {
        console.error("Could not load applications", err);
        error('Failed to load applicant list.');
      })
      .finally(() => setLoadingApps(false));
  };

  useEffect(() => {
    if (activeJob) {
      fetchApplications(activeJob.id);
    }
  }, [appStatusFilter]);

  useEffect(() => {
    if (activeJob) {
      const timer = setTimeout(() => {
        fetchApplications(activeJob.id);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [appQueryFilter]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setProcessingAppId(applicationId);
    try {
      await api.put(`/jobs/applications/${applicationId}/status`, { status: newStatus });
      success(`Applicant status updated to ${newStatus}.`);

      // Refresh applications and jobs
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
      fetchJobs();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update applicant status.';
      error(msg);
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to close this job post? It will no longer accept new applications.")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      success('Job post closed successfully.');
      fetchJobs();
      if (activeJob && activeJob.id === jobId) setActiveJob(null);
    } catch {
      error('Failed to close job.');
    }
  };

  const hasJobFilters = !!(statusFilter || jobTypeFilter || cityFilter || queryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Jobs & Applicants</h1>
          <p className="text-xs text-slate-500">Track applicants, shortlist candidates, and finalize hires.</p>
        </div>
        <Link to="/employer/post-job">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
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
              placeholder="Search job title or keyword..."
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setJobPage(0); }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            >
              <option value="">All Job Statuses</option>
              <option value="OPEN">Open for Applications</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled / Closed</option>
            </select>
          </div>

          <div>
            <select
              value={jobTypeFilter}
              onChange={(e) => { setJobTypeFilter(e.target.value); setJobPage(0); }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            >
              <option value="">All Employment Types</option>
              <option value="DAILY_WAGE">Daily Wage</option>
              <option value="CONTRACT">Contract Project</option>
              <option value="REGULAR">Regular Employment</option>
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filter by City..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
            />
            {hasJobFilters && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('');
                  setJobTypeFilter('');
                  setCityFilter('');
                  setQueryFilter('');
                  setJobPage(0);
                }}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center shrink-0"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Showing <strong className="text-teal-700">{jobTotalElements}</strong> job postings
          </span>
          {jobTotalPages > 1 && (
            <span>Page {jobPage + 1} of {jobTotalPages}</span>
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title={hasJobFilters ? "No jobs match your filter criteria" : "No jobs posted yet"}
          description={hasJobFilters ? "Try clearing or relaxing your filters to see more listings." : "Create your first job posting to start receiving worker bids."}
          actionText={hasJobFilters ? "Reset Filters" : "Post a Job Now"}
          onAction={() => {
            if (hasJobFilters) {
              setStatusFilter('');
              setJobTypeFilter('');
              setCityFilter('');
              setQueryFilter('');
              setJobPage(0);
            } else {
              navigate('/employer/post-job');
            }
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Compensation</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{job.title}</span>
                        <Badge color={getJobTypeBadge(job.jobType).color}>
                          {getJobTypeBadge(job.jobType).label}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Posted {formatDate(job.createdAt)}
                        {job.workingHours ? ` • ${job.workingHours}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {job.city}{job.area ? `, ${job.area}` : ''}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatJobCompensation(job)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={JOB_STATUSES[job.status]?.color || 'bg-slate-100'}>
                        {JOB_STATUSES[job.status]?.label || job.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openApplicantsModal(job)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicationCount || 0} View Applicants</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {job.status === 'OPEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:border-rose-300"
                          onClick={() => handleCloseJob(job.id)}
                        >
                          Close Job
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {jobTotalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Page {jobPage + 1} of {jobTotalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={jobPage === 0}
                  onClick={() => setJobPage((p) => Math.max(0, p - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={jobPage >= jobTotalPages - 1}
                  onClick={() => setJobPage((p) => p + 1)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applicant Review Modal with Smart Filter */}
      {activeJob && (
        <Modal
          isOpen={!!activeJob}
          onClose={() => setActiveJob(null)}
          title={`Applicants for: ${activeJob.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs flex flex-wrap justify-between items-center gap-2">
              <span>Location: <strong>{activeJob.city}</strong></span>
              <span>Offered: <strong className="text-teal-700">{formatJobCompensation(activeJob)}</strong></span>
              {activeJob.workingHours && (
                <span>Hours: <strong>{activeJob.workingHours}</strong></span>
              )}
              <span>Status: <Badge>{activeJob.status}</Badge></span>
            </div>

            {/* Applicant Filtering inside Modal */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex-1 relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter applicant name or skills..."
                  value={appQueryFilter}
                  onChange={(e) => setAppQueryFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="w-full sm:w-44 py-1.5 px-3 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Application Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="ACCEPTED">Hired / Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>

              {(appQueryFilter || appStatusFilter) && (
                <button
                  type="button"
                  onClick={() => { setAppQueryFilter(''); setAppStatusFilter(''); }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              Showing <strong className="text-teal-700">{applications.length}</strong> applicant(s)
            </div>

            {loadingApps ? (
              <LoadingSpinner text="Fetching applicants..." />
            ) : applications.length === 0 ? (
              <EmptyState
                title="No applicants found"
                description={
                  appQueryFilter || appStatusFilter
                    ? "No applicants match the current filters."
                    : "Skilled workers in this area haven't applied yet. Ensure your daily wage is competitive."
                }
              />
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {applications.map((app) => (
                  <Card key={app.id} className="p-4 border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{app.workerFullName}</h4>
                          <Badge color={APPLICATION_STATUSES[app.status]?.color || 'bg-slate-100'}>
                            {APPLICATION_STATUSES[app.status]?.label || app.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {app.workerHeadline || 'Skilled Worker'} • {app.workerYearsOfExperience || 0} yrs exp
                        </div>
                        {app.workerRating > 0 && (
                          <div className="mt-1">
                            <StarRating rating={app.workerRating} size="sm" />
                          </div>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <div className="text-[11px] text-slate-400">Bid / Expected</div>
                        <div className="text-base font-extrabold text-teal-700">
                          {formatCurrency(app.bidAmount)}{activeJob?.jobType === 'REGULAR' || activeJob?.jobType === 'REGULAR_EMPLOYMENT' ? '/mo' : '/day'}
                        </div>
                      </div>
                    </div>

                    {app.coverNote && (
                      <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-600 mb-3 border border-slate-100">
                        "{app.coverNote}"
                      </div>
                    )}

                    {app.workerSkills && app.workerSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.workerSkills.map((sk, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-500 flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>{app.workerPhone || 'Phone upon hire'}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {app.status === 'APPLIED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={processingAppId === app.id}
                            onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                          >
                            Shortlist
                          </Button>
                        )}

                        {app.status !== 'ACCEPTED' && (
                          <Button
                            size="sm"
                            variant="success"
                            loading={processingAppId === app.id}
                            onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                          >
                            Hire / Accept
                          </Button>
                        )}

                        {app.status !== 'REJECTED' && app.status !== 'ACCEPTED' && (
                          <Button
                            size="sm"
                            variant="danger"
                            loading={processingAppId === app.id}
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageJobsPage;
