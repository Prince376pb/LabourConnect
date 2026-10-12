import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatJobCompensation, getJobTypeBadge, APPLICATION_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Briefcase, FileCheck, CheckCircle2, ArrowRight, MapPin, UserCheck, Clock } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/profiles/worker'),
      api.get('/jobs/applications/my-applications?size=5'),
      api.get('/jobs?size=3&status=OPEN')
    ])
      .then(([profRes, appsRes, jobsRes]) => {
        if (profRes.data) setProfile(profRes.data);
        if (appsRes.data && appsRes.data.content) setApplications(appsRes.data.content);
        if (jobsRes.data && jobsRes.data.content) setRecentJobs(jobsRes.data.content);
      })
      .catch((err) => console.error("Error loading worker dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading worker hub..." fullHeight />;

  const hiredCount = applications.filter((a) => a.status === 'ACCEPTED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.headline || 'Skilled Labourer'} • {profile?.city || 'Location unset'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/jobs">
            <Button size="md">
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Open Jobs
            </Button>
          </Link>
          <Link to="/worker/profile">
            <Button variant="outline" size="md">
              Update Skills
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Applied Jobs</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{applications.length}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Hired / Accepted</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{hiredCount}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Daily Rate</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(profile?.dailyRate)}
            </div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Status</div>
            <div className="mt-1">
              <Badge color={profile?.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}>
                {profile?.availabilityStatus || 'AVAILABLE'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Your Recent Applications</h2>
            <Link to="/worker/applications" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Browse open wage jobs and submit applications to start working."
              actionText="Search Jobs"
              onAction={() => navigate('/jobs')}
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id} className="p-4 border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {app.employerCompanyName} • Bid: {formatCurrency(app.bidAmount)}{app.jobType === 'REGULAR' || app.jobType === 'REGULAR_EMPLOYMENT' ? '/mo' : '/day'}
                    </div>
                  </div>
                  <Badge color={APPLICATION_STATUSES[app.status]?.color || 'bg-slate-100'}>
                    {APPLICATION_STATUSES[app.status]?.label || app.status}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Open Jobs in Your Area</h2>
            <Link to="/jobs" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center">
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Card key={job.id} hover onClick={() => navigate(`/jobs/${job.id}`)} className="p-4 border-slate-200">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                    {(() => {
                      const tb = getJobTypeBadge(job.jobType);
                      return (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${tb.bg} ${tb.text} ${tb.border}`}>
                          {tb.label}
                        </span>
                      );
                    })()}
                  </div>
                  <span className="font-extrabold text-teal-700 text-xs shrink-0">
                    {formatJobCompensation(job)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{job.city}</span>
                  <span>•</span>
                  <span>{job.employerCompanyName}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
