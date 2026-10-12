import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES, formatCurrency, formatDate, formatJobCompensation, getJobTypeBadge } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Briefcase, MapPin, Calendar, Search, Filter, CheckCircle2, ArrowLeft, RotateCcw, Clock } from 'lucide-react';

const JobBrowsePage = () => {
  const { user, isAuthenticated, hasRole, dashboardRoute } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [skillId, setSkillId] = useState(searchParams.get('skillId') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'OPEN');
  const [minWage, setMinWage] = useState(searchParams.get('minWage') || '');
  const [maxWage, setMaxWage] = useState(searchParams.get('maxWage') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Apply Modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  useEffect(() => {
    // Fetch skills catalog
    api.get('/skills')
      .then((res) => {
        if (res.data) setSkills(res.data);
      })
      .catch((err) => console.error("Could not load skills", err));
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.set('status', status);
    if (query) params.set('query', query);
    if (city) params.set('city', city);
    if (skillId) params.set('skillId', skillId);
    if (jobType) params.set('jobType', jobType);
    if (minWage) params.set('minWage', minWage);
    if (maxWage) params.set('maxWage', maxWage);
    params.set('page', page);
    params.set('size', 12);

    api.get(`/jobs?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setJobs(res.data.content);
          setTotalPages(res.data.totalPages || 1);
          setTotalJobs(res.data.totalElements || 0);
        } else {
          setJobs([]);
          setTotalJobs(0);
        }
      })
      .catch((err) => {
        console.error("Could not load jobs", err);
        error('Failed to load jobs.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [skillId, jobType, status, page]);

  // Debounced auto-fetch on text changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 350);
    return () => clearTimeout(timer);
  }, [query, city, minWage, maxWage]);

  const handleClearFilters = () => {
    setQuery('');
    setCity('');
    setSkillId('');
    setJobType('');
    setStatus('OPEN');
    setMinWage('');
    setMaxWage('');
    setPage(0);
    setSearchParams({});
  };

  const hasActiveFilters = !!(query || city || skillId || jobType || status !== 'OPEN' || minWage || maxWage);

  const openApplyModal = (job, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login?redirect=/jobs');
      return;
    }
    if (!hasRole(ROLES.WORKER)) {
      error('Only accounts registered with the Skilled Worker role can apply for jobs.');
      return;
    }
    setSelectedJob(job);
    const initialBid = job.jobType === 'REGULAR' 
      ? (job.minMonthlySalary || (job.dailyWage ? Math.round(Number(job.dailyWage) * 26) : '')) 
      : (job.dailyWage || '');
    setBidAmount(initialBid);
    setCoverNote('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingApply(true);

    try {
      await api.post(`/jobs/${selectedJob.id}/apply`, {
        coverNote,
        bidAmount: Number(bidAmount)
      });
      success('Application submitted successfully!');
      setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      error(msg);
    } finally {
      setSubmittingApply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Back Navigation */}
      <div>
        <Link
          to={isAuthenticated ? dashboardRoute() : '/'}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-teal-600" />
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Employment Opportunities</h1>
        <p className="text-sm text-slate-600 mt-1">
          Browse verified wage jobs, short-term contracts, and daily labour positions with smart filtering.
        </p>
      </div>

      {/* SMART FILTERS TOOLBAR */}
      <Card className="p-5 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Search Keywords"
            placeholder="e.g. Mason, Welder, Helper"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Input
            label="City"
            placeholder="e.g. Bangalore, Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Select
            label="Required Skill"
            value={skillId}
            onChange={(e) => { setSkillId(e.target.value); setPage(0); }}
            placeholder="All Skills"
            options={skills.map((s) => ({ value: s.id, label: s.name }))}
          />

          <Select
            label="Job Type"
            value={jobType}
            onChange={(e) => { setJobType(e.target.value); setPage(0); }}
            placeholder="All Job Types"
            options={[
              { value: 'DAILY_WAGE', label: 'Daily Wage' },
              { value: 'CONTRACT', label: 'Contract' },
              { value: 'REGULAR', label: 'Regular Employment' },
            ]}
          />
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 items-end">
          <Select
            label="Job Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            placeholder="All Statuses"
            options={[
              { value: 'OPEN', label: 'Open for Applications' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ALL', label: 'All Postings' },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {jobType === 'REGULAR' ? 'Monthly Salary Range (₹)' : 'Daily Wage / Salary Range (₹)'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minWage}
                onChange={(e) => setMinWage(e.target.value)}
                className="w-1/2 text-xs py-2 px-3 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxWage}
                onChange={(e) => setMaxWage(e.target.value)}
                className="w-1/2 text-xs py-2 px-3 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Showing <strong className="text-teal-700">{totalJobs}</strong> job opportunity{totalJobs === 1 ? '' : 'ies'}
          </span>
          {totalPages > 1 && (
            <span>Page {page + 1} of {totalPages}</span>
          )}
        </div>
      </Card>

      {/* Jobs List */}
      {loading ? (
        <LoadingSpinner text="Searching jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs matching criteria"
          description="Try broadening your city or wage filters to find more opportunities."
          actionText={hasActiveFilters ? "Clear Filters" : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              hover
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="flex flex-col justify-between border-slate-200/80 hover:border-teal-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge color={getJobTypeBadge(job.jobType).color}>
                    {getJobTypeBadge(job.jobType).label}
                  </Badge>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 text-right">
                    {formatJobCompensation(job)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">{job.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mb-2">{job.employerCompanyName}</p>

                {job.workingHours && (
                  <div className="flex items-center text-[11px] text-blue-700 font-medium mb-3 bg-blue-50/70 px-2.5 py-1 rounded-md border border-blue-100 max-w-fit">
                    <Clock className="w-3 h-3 mr-1.5 shrink-0 text-blue-500" />
                    <span className="truncate">{job.workingHours}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{job.description}</p>

                {job.requiredSkillNames && job.requiredSkillNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.requiredSkillNames.map((skillName, i) => (
                      <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {skillName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1 truncate max-w-[150px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{job.city}</span>
                </div>

                {job.status === 'OPEN' && (
                  <Button
                    size="sm"
                    onClick={(e) => openApplyModal(job, e)}
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">Page {page + 1} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Worker Apply Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Apply for ${selectedJob.title}`}
        >
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>Employer: <strong>{selectedJob.employerCompanyName}</strong></div>
              <div>Location: <strong>{selectedJob.city}{selectedJob.area ? `, ${selectedJob.area}` : ''}</strong></div>
              <div>Employment Type: <strong>{getJobTypeBadge(selectedJob.jobType).label}</strong></div>
              <div>Offered Compensation: <strong>{formatJobCompensation(selectedJob)}</strong></div>
              {selectedJob.workingHours && <div>Working Hours: <strong>{selectedJob.workingHours}</strong></div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {selectedJob.jobType === 'REGULAR' ? 'Your Expected Monthly Salary (₹)' : 'Your Proposed Daily Bid (₹)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={selectedJob.jobType === 'REGULAR' ? 'Enter expected monthly salary (₹)' : 'Enter your daily wage bid (₹)'}
                className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {selectedJob.jobType === 'REGULAR'
                  ? 'Propose your expected monthly salary for this regular employment position.'
                  : 'You can bid the requested amount or propose your standard daily rate.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cover Note / Message to Employer
              </label>
              <textarea
                rows="3"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Mention your relevant experience, tools available, or start date..."
                className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setSelectedJob(null)}
                disabled={submittingApply}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submittingApply}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default JobBrowsePage;
