import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, SERVICE_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Wrench, Clock, CheckCircle2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/profiles/customer'),
      api.get('/requests/my-requests?size=5'),
      api.get('/categories')
    ])
      .then(([profRes, reqRes, catRes]) => {
        if (profRes.data) setProfile(profRes.data);
        if (reqRes.data && reqRes.data.content) setRequests(reqRes.data.content);
        if (catRes.data) setCategories(catRes.data.slice(0, 6));
      })
      .catch((err) => console.error("Error loading customer dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading customer portal..." fullHeight />;

  const activeCount = requests.filter((r) => ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'SERVICE_STARTED'].includes(r.status)).length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.address || 'Set your delivery address for fast service arrival'}
          </p>
        </div>

        <Link to="/services">
          <Button size="md">
            <Wrench className="w-4 h-4 mr-2" />
            Book a New Service
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Total Requests</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{requests.length}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Active In Progress</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{activeCount}</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Completed Services</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</div>
          </div>
        </Card>
      </div>

      {/* Quick Category Booking Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Need Service Today?</h2>
          <Link to="/services" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/services?category=${cat.id}`}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all text-center flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
                <Wrench className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Requests Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your Recent Service Orders</h2>
          <Link to="/customer/requests" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center">
            <span>Track All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Whenever you need plumbing, electrical repair, or carpentry, book certified technicians directly."
            actionText="Browse Service Providers"
            onAction={() => navigate('/services')}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id} hover onClick={() => navigate('/customer/requests')} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                    <Badge color={SERVICE_STATUSES[req.status]?.color || 'bg-slate-100'}>
                      {SERVICE_STATUSES[req.status]?.label || req.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-3">
                    <span>Provider: <strong className="text-slate-700">{req.providerBusinessName}</strong></span>
                    <span>•</span>
                    <span>{req.categoryName}</span>
                    <span>•</span>
                    <span>Booked {formatDate(req.createdAt)}</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-xs text-slate-400">Estimated Cost</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatCurrency(req.finalCost || req.estimatedCost)}
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

export default CustomerDashboard;
