import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, VERIFICATION_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Wrench,
  Search,
  MapPin,
  ShieldCheck,
  Navigation,
  Clock,
  Calendar,
  CheckCircle,
  IndianRupee,
  AlertCircle,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

const ServiceDiscoveryPage = () => {
  const { user, isAuthenticated, hasRole, dashboardRoute } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [radiusKm, setRadiusKm] = useState('25');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);

  // Booking modal
  const [bookingProvider, setBookingProvider] = useState(null);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingCity, setBookingCity] = useState('');
  const [bookingCategory, setBookingCategory] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    // Fetch categories
    api.get('/categories')
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error("Could not load categories", err));
  }, []);

  const fetchProviders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (city) params.set('city', city);
    if (query) params.set('query', query);
    if (lat && lng) {
      params.set('lat', lat);
      params.set('lng', lng);
      params.set('radiusKm', radiusKm);
    }
    params.set('page', page);
    params.set('size', 12);

    api.get(`/services/providers?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.content) {
          let list = res.data.content;
          if (verificationFilter === 'APPROVED') {
            list = list.filter((p) => p.verificationStatus === 'APPROVED');
          }
          setProviders(list);
          setTotalPages(res.data.totalPages || 1);
          setTotalProviders(res.data.totalElements || list.length);
        } else {
          setProviders([]);
          setTotalProviders(0);
        }
      })
      .catch((err) => {
        console.error("Could not load providers", err);
        error('Failed to load service providers.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, verificationFilter, lat, lng, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 350);
    return () => clearTimeout(timer);
  }, [query, city]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGettingLocation(false);
        success('Coordinates retrieved. Showing nearby service providers.');
      },
      (err) => {
        console.warn("Geolocation denied or unavailable", err);
        setGettingLocation(false);
        info('Location access denied. Please filter by city manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setCity('');
    setQuery('');
    setVerificationFilter('');
    setLat(null);
    setLng(null);
    setPage(0);
    setSearchParams({});
  };

  const hasActiveFilters = !!(selectedCategory || city || query || verificationFilter || (lat && lng));

  const openBookingModal = (provider) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/services');
      return;
    }
    setBookingProvider(provider);
    setBookingTitle('');
    setBookingDesc('');
    setBookingAddress(user?.address || '');
    setBookingCity(user?.city || provider.city || '');
    setBookingCategory(provider.categoryNames?.[0] ? provider.categories?.[0]?.id : (selectedCategory || ''));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);

    try {
      await api.post('/requests', {
        providerId: bookingProvider.id,
        categoryId: bookingCategory || categories[0]?.id,
        title: bookingTitle,
        description: bookingDesc,
        serviceAddress: bookingAddress,
        city: bookingCity,
        estimatedCost: bookingProvider.baseRate
      });

      success('Service request sent to provider! Track progress in your dashboard.');
      setBookingProvider(null);
      navigate('/customer/requests');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      error(msg);
    } finally {
      setSubmittingBooking(false);
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

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">On-Demand Local Services</h1>
        <p className="text-sm text-slate-600 mt-1">
          Connect with certified, background-verified technicians and service contractors with smart filters.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-5 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Search Services or Business"
            placeholder="e.g. Plumber, Leak fix, Electrician"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Select
            label="Service Category"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
            placeholder="All Categories"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          <Input
            label="City / Area"
            placeholder="e.g. Bangalore"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Select
            label="Verification Status"
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setPage(0); }}
            placeholder="All Providers"
            options={[
              { value: 'APPROVED', label: 'Verified Badge Only' },
              { value: '', label: 'All Registered Providers' },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 mt-3 border-t border-slate-100">
          <div className="flex items-center space-x-3 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-slate-700 hover:text-teal-700"
              onClick={handleUseLocation}
              loading={gettingLocation}
            >
              <Navigation className="w-3.5 h-3.5 mr-1 text-teal-600" />
              {lat && lng ? 'GPS Active' : 'Use Current GPS'}
            </Button>

            {lat && lng ? (
              <span className="text-teal-700 font-semibold flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Within {radiusKm} km radius
              </span>
            ) : (
              <span className="text-slate-400">
                Tip: Enter your city or click GPS to view closest providers.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Found <strong className="text-teal-700">{totalProviders}</strong> available service provider(s)
          </span>
          {totalPages > 1 && (
            <span>Page {page + 1} of {totalPages}</span>
          )}
        </div>
      </Card>

      {/* Categories quick chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => { setSelectedCategory(''); setSearchParams({}); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
            !selectedCategory
              ? 'bg-teal-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(String(cat.id)); setSearchParams({ category: cat.id }); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              String(selectedCategory) === String(cat.id)
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Providers Grid */}
      {loading ? (
        <LoadingSpinner text="Searching service providers..." />
      ) : providers.length === 0 ? (
        <EmptyState
          title="No providers found"
          description="We couldn't find available verified providers matching your location or category filter."
          actionText={hasActiveFilters ? "Reset Filters" : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <Card key={p.id} hover className="flex flex-col justify-between border-slate-200/80 hover:border-teal-300">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="pr-2">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-slate-900 text-base">{p.businessName}</h3>
                      {p.verificationStatus === 'APPROVED' && (
                        <span title="Administrator Verified" className="inline-flex items-center text-teal-600">
                          <ShieldCheck className="w-5 h-5 fill-teal-50" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.yearsOfExperience || 0} Years In Business</div>
                  </div>

                  <Badge color={p.available ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                    {p.available ? 'Available' : 'Busy'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {p.bio || 'Professional service contractor offering reliable local service.'}
                </p>

                {p.categoryNames && p.categoryNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.categoryNames.map((catName, idx) => (
                      <span key={idx} className="text-[10px] bg-teal-50 text-teal-800 font-medium px-2 py-0.5 rounded-md border border-teal-100">
                        {catName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Base Inspection</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(p.baseRate)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Service City</span>
                    <span className="font-semibold text-slate-700">
                      {p.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center space-x-1">
                    <StarRating rating={p.rating || 0} size="sm" />
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({p.reviewCount || 0})
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => openBookingModal(p)}
                  >
                    Book Service
                  </Button>
                </div>
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

      {/* Booking Modal */}
      {bookingProvider && (
        <Modal
          isOpen={!!bookingProvider}
          onClose={() => setBookingProvider(null)}
          title={`Book Service: ${bookingProvider.businessName}`}
        >
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>Provider: <strong>{bookingProvider.businessName}</strong></div>
              <div>Base Inspection Fee: <strong>{formatCurrency(bookingProvider.baseRate)}</strong></div>
              <div>Service City: <strong>{bookingProvider.city}</strong></div>
            </div>

            <Input
              label="Service Task / Issue Title"
              placeholder="e.g. Kitchen Pipe Leakage, MCB Tripping"
              value={bookingTitle}
              onChange={(e) => setBookingTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Trade Category</label>
              <select
                value={bookingCategory}
                onChange={(e) => setBookingCategory(e.target.value)}
                className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Select Service Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Problem Details</label>
              <textarea
                rows="3"
                value={bookingDesc}
                onChange={(e) => setBookingDesc(e.target.value)}
                placeholder="Describe what needs repair or servicing in detail..."
                className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Service Address"
                placeholder="Flat / Street / Landmark"
                value={bookingAddress}
                onChange={(e) => setBookingAddress(e.target.value)}
                required
              />

              <Input
                label="City"
                placeholder="City"
                value={bookingCity}
                onChange={(e) => setBookingCity(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setBookingProvider(null)}
                disabled={submittingBooking}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submittingBooking}
              >
                Confirm & Request Service
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServiceDiscoveryPage;
