import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatJobCompensation, getJobTypeBadge } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Briefcase, Users, PlusCircle, ArrowRight, CheckCircle2, Search, Clock } from 'lucide-react';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/profiles/employer'),
      api.get('/jobs/my-jobs?size=5')
    ])
      .then(([profileRes, jobsRes]) => {
        if (profileRes.data) setProfile(profileRes.data);
        if (jobsRes.data && jobsRes.data.content) setJobs(jobsRes.data.content);
      })
      .catch((err) => console.error("Error loading employer dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading workspace..." fullHeight />;

  const openJobsCount = jobs.filter((j) => j.status === 'OPEN').length;
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {profile?.contactPerson || user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.companyName || 'Your Business Workspace'} • {profile?.city || 'Location unset'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/employer/post-job">
            <Button size="md">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post a New Job
            </Button>
          </Link>
          <Link to="/employer/search-workers">
            <Button variant="outline" size="md">
              <Search className="w-4 h-4 mr-2" />
              Find Workers
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Total Posted Jobs</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{jobs.length}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Open for Hiring</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{openJobsCount}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Total Applicants</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalApplicants}</div>
          </div>
        </Card>
      </div>

      {/* Recent Jobs Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recently Posted Jobs</h2>
          <Link to="/employer/manage-jobs" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center">
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No job posts yet"
            description="You haven't posted any jobs. Create your first job posting to start receiving applications from verified workers."
            actionText="Post Your First Job"
            onAction={() => navigate('/employer/post-job')}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id} hover onClick={() => navigate(`/employer/manage-jobs?jobId=${job.id}`)} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-slate-900 text-sm">{job.title}</span>
                    {(() => {
                      const tb = getJobTypeBadge(job.jobType);
                      return (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${tb.bg} ${tb.text} ${tb.border}`}>
                          {tb.label}
                        </span>
                      );
                    })()}
                    <Badge color={job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-3 flex-wrap">
                    <span>{job.city}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{formatJobCompensation(job)}</span>
                    {job.workingHours && (
                      <>
                        <span>•</span>
                        <span>{job.workingHours}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                    {job.applicationCount || 0} Applicants
                  </span>
                  <Button size="sm" variant="outline">
                    Review Applicants
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
