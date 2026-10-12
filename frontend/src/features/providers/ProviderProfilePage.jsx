import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Wrench, ShieldCheck, MapPin } from 'lucide-react';

const ProviderProfilePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [baseRate, setBaseRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [serviceAreaRadiusKm, setServiceAreaRadiusKm] = useState(15);
  const [available, setAvailable] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/profiles/provider')
    ])
      .then(([catRes, profRes]) => {
        if (catRes.data) setCategories(catRes.data);
        if (profRes.data) {
          const d = profRes.data;
          setBusinessName(d.businessName || '');
          setBio(d.bio || '');
          setYearsOfExperience(d.yearsOfExperience || 0);
          setBaseRate(d.baseRate || '');
          setHourlyRate(d.hourlyRate || '');
          setCity(d.city || '');
          setServiceAreaRadiusKm(d.serviceAreaRadiusKm || 15);
          setAvailable(d.available !== false);
          if (d.categoryIds) setSelectedCategoryIds(Array.from(d.categoryIds));
        }
      })
      .catch((err) => console.error("Could not load provider profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryToggle = (id) => {
    if (selectedCategoryIds.includes(id)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((cId) => cId !== id));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/provider', {
        businessName,
        bio,
        yearsOfExperience: Number(yearsOfExperience),
        baseRate: Number(baseRate),
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
        city,
        serviceAreaRadiusKm: Number(serviceAreaRadiusKm),
        available,
        categoryIds: selectedCategoryIds
      });
      success('Provider profile and rates updated successfully!');
    } catch (err) {
      error('Failed to update provider profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Provider Profile & Indicative Rates</h1>
        <p className="text-xs text-slate-500">Define your service categories, inspection fees, and operational radius.</p>
      </div>

      <Card className="p-8 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Business / Trading Name"
            placeholder="e.g. Master Plumbers & Pipe Fitters"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Bio / Description</label>
            <textarea
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your specialized services, certifications, guarantees, and past work..."
              className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Years in Service"
              type="number"
              min="0"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              required
            />

            <Input
              label="Base Inspection Fee (₹)"
              type="number"
              placeholder="e.g. 350"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              required
            />

            <Input
              label="Hourly Labour Rate (₹)"
              type="number"
              placeholder="e.g. 200"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base City"
              placeholder="e.g. Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <Input
              label="Service Radius (km)"
              type="number"
              min="1"
              max="100"
              value={serviceAreaRadiusKm}
              onChange={(e) => setServiceAreaRadiusKm(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Service Categories Offered (Select all applicable)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProviderProfilePage;
