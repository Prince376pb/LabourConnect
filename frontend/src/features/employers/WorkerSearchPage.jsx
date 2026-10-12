import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, MapPin, Briefcase, Phone, Mail, CheckCircle, RotateCcw, Filter, X } from 'lucide-react';

const WorkerSearchPage = () => {
  const [workers, setWorkers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [skillId, setSkillId] = useState('');
  const [availability, setAvailability] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    api.get('/skills')
      .then((res) => {
        if (res.data) setSkills(res.data);
      })
      .catch((err) => console.error("Could not load skills", err));

    fetchWorkers();
  }, []);

  const fetchWorkers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (city) params.set('city', city);
    if (skillId) params.set('skillId', skillId);
    if (availability) params.set('availability', availability);

    api.get(`/workers?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          setWorkers(res.data.content);
          setTotalCount(res.data.totalElements || res.data.content.length);
        } else {
          setWorkers([]);
          setTotalCount(0);
        }
      })
      .catch((err) => console.error("Could not load workers", err))
      .finally(() => setLoading(false));
  };

  // Debounced auto-fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers();
    }, 350);
    return () => clearTimeout(timer);
  }, [query, city, skillId, availability]);

  const handleClearFilters = () => {
    setQuery('');
    setCity('');
    setSkillId('');
    setAvailability('');
  };

  const hasActiveFilters = !!(query || city || skillId || availability);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Search Skilled Workers</h1>
        <p className="text-xs text-slate-500">Discover vetted masons, carpenters, plumbers, and general daily-wage labour profiles.</p>
      </div>

      <Card className="p-5 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Input
            label="Name or Keywords"
            placeholder="e.g. Mason, Concrete"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Input
            label="City"
            placeholder="e.g. Bangalore"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Select
            label="Trade Skill"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            placeholder="All Skills"
            options={skills.map((s) => ({ value: s.id, label: s.name }))}
          />

          <Select
            label="Availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="All Availability"
            options={[
              { value: 'AVAILABLE', label: 'Available Now' },
              { value: 'BUSY', label: 'Currently Busy' },
              { value: 'UNAVAILABLE', label: 'Unavailable' },
            ]}
          />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">
              Showing <strong className="text-teal-700">{totalCount}</strong> skilled worker profile(s)
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Searching skilled workers..." />
      ) : workers.length === 0 ? (
        <EmptyState
          title="No workers match your filters"
          description="Try broadening your city or skill filters to find more available workers."
          actionText={hasActiveFilters ? "Clear Filters" : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <Card key={worker.id} hover className="flex flex-col justify-between p-6 border-slate-200/80">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{worker.fullName}</h3>
                    <div className="text-xs text-slate-500">{worker.yearsOfExperience || 0} Years Experience</div>
                  </div>
                  <Badge color={worker.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}>
                    {worker.availabilityStatus}
                  </Badge>
                </div>

                <p className="text-xs font-semibold text-teal-700 mb-2">{worker.headline || 'Skilled Labour'}</p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{worker.bio || 'No bio provided yet.'}</p>

                {worker.skillNames && worker.skillNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {worker.skillNames.map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{worker.city || 'India'}</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    {formatCurrency(worker.expectedDailyWage)}/day
                  </div>
                </div>

                {worker.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <StarRating rating={worker.rating} size="sm" />
                    <span className="text-[11px] text-slate-400">({worker.reviewCount || 0} reviews)</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerSearchPage;
