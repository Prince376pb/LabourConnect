import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES, formatCurrency, formatDate, formatJobCompensation, getJobTypeBadge } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, MapPin, Calendar, Clock, ArrowLeft, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, hasRole } = useAuth();
  const { success, error } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => {
        if (res.data) {
          setJob(res.data);
          const initialBid = res.data.jobType === 'REGULAR'
            ? (res.data.minMonthlySalary || (res.data.dailyWage ? Math.round(Number(res.data.dailyWage) * 26) : ''))
            : (res.data.dailyWage || '');
          setBidAmount(initialBid);
        }
      })
      .catch((err) => {
        console.error("Could not load job", err);
        error('Failed to load job details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingApply(true);

    try {
      await api.post(`/jobs/${id}/apply`, {
        coverNote,
        bidAmount: Number(bidAmount)
      });
      success('Application submitted successfully!');
      setApplyModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      error(msg);
    } finally {
      setSubmittingApply(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading job information..." fullHeight />;
  if (!job) return <div className="text-center py-20">Job post not found.</div>;

  const isOwner = user && job.employerId && user.id === job.employerUserId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/jobs');
            }
          }}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-teal-600" />
          Back to Jobs
        </button>
      </div>

      <Card className="p-8 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge color="bg-emerald-100 text-emerald-800 border-emerald-200">{job.status}</Badge>
              <Badge color={getJobTypeBadge(job.jobType).color}>{getJobTypeBadge(job.jobType).label}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>
            <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{job.employerCompanyName}</span>
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-slate-500 font-medium">
              {job.jobType === 'REGULAR' ? 'Monthly Compensation' : 'Daily Wage Compensation'}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatJobCompensation(job)}
            </div>
          </div>
        </div>

        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Job Description</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>

          {job.requiredSkillNames && job.requiredSkillNames.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkillNames.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-1">Job Location</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.city}{job.area ? `, ${job.area}` : ''}
              </span>
            </div>

            {job.jobType === 'REGULAR' ? (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/60">
                <span className="text-blue-500 font-medium block mb-1">Working Hours</span>
                <span className="font-semibold text-slate-800 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  {job.workingHours || 'Standard full-time working hours'}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Estimated Duration</span>
                <span className="font-semibold text-slate-800 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.estimatedDays} Day(s)
                </span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-1">Applications Received</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.applicationCount || 0} Applicants
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Posted on {formatDate(job.createdAt)}
          </div>

          <div>
            {isOwner ? (
              <Link to={`/employer/manage-jobs?jobId=${job.id}`}>
                <Button variant="secondary">Manage Applicants for this Job</Button>
              </Link>
            ) : hasRole(ROLES.WORKER) ? (
              <Button size="lg" onClick={() => setApplyModalOpen(true)}>
                Apply for this Position
              </Button>
            ) : !isAuthenticated ? (
              <Link to="/login">
                <Button size="lg">Log In to Apply</Button>
              </Link>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Only worker accounts can submit applications.
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Apply Modal */}
      {applyModalOpen && (
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title={`Apply for: ${job.title}`}
        >
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <Input
              label={job.jobType === 'REGULAR' ? "Your Expected Monthly Salary (₹/month)" : "Your Bid / Expected Wage (₹/day)"}
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={job.jobType === 'REGULAR' ? "e.g. 20000" : "e.g. 900"}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Note to Employer (Experience & Availability)
              </label>
              <textarea
                rows="4"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Mention your relevant experience, tools available, and when you can start..."
                className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                required
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setApplyModalOpen(false)} disabled={submittingApply}>
                Cancel
              </Button>
              <Button type="submit" loading={submittingApply}>
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default JobDetailsPage;
