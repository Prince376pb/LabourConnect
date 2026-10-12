import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, SERVICE_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Wrench, MapPin, Phone, Search, RotateCcw } from 'lucide-react';

const ProviderRequestsPage = () => {
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

    api.get(`/requests/provider-requests?${params.toString()}`)
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
      .catch((err) => console.error("Could not load provider requests", err))
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

  const handleClearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setQueryFilter('');
    setPage(0);
  };

  const hasActiveFilters = !!(statusFilter || categoryFilter || queryFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">All Service Inquiries & Orders</h1>
        <p className="text-xs text-slate-500">Complete archive of incoming, active, and completed requests with smart filtering.</p>
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
              placeholder="Search title, customer, notes, or city..."
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
              <option value="REQUESTED">Requested / Needs Action</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="ON_THE_WAY">On The Way</option>
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
            Showing <strong className="text-teal-700">{totalRequests}</strong> service order(s)
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
          title={hasActiveFilters ? "No orders match filter criteria" : "No service orders yet"}
          description={hasActiveFilters ? "Try resetting the filters above to see more requests." : "Your incoming orders will be listed here."}
          actionText={hasActiveFilters ? "Reset Filters" : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
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
                    Category: <strong>{req.categoryName}</strong> • Date: {formatDate(req.createdAt)}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs text-slate-400">Total Charged</div>
                  <div className="text-lg font-black text-teal-700">
                    {formatCurrency(req.finalCost || req.estimatedCost)}
                  </div>
                </div>
              </div>

              <div className="py-3 text-xs text-slate-600">
                <strong>Customer Notes:</strong> "{req.description}"
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{req.serviceAddress}, {req.city}</span>
                </div>
                <div className="flex items-center space-x-1 font-semibold text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{req.customerPhone || 'Customer contact'}</span>
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
    </div>
  );
};

export default ProviderRequestsPage;
