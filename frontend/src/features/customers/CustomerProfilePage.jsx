import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Navigation } from 'lucide-react';

const CustomerProfilePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profiles/customer')
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setAddress(d.address || '');
          setCity(d.city || '');
          setArea(d.area || '');
          setLatitude(d.latitude || null);
          setLongitude(d.longitude || null);
        }
      })
      .catch((err) => console.error("Could not load customer profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleFetchCoordinates = () => {
    if (!navigator.geolocation) {
      error('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        success('GPS coordinates detected.');
      },
      () => error('Permission denied or GPS unavailable.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/customer', {
        address,
        city,
        area,
        latitude,
        longitude
      });
      success('Customer address and profile updated.');
    } catch (err) {
      error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Address & Settings</h1>
        <p className="text-xs text-slate-500">Provide your home or site address for on-demand technician visits.</p>
      </div>

      <Card className="p-8 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery / Service Address</label>
            <textarea
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Apartment, flat, street, and landmarks..."
              className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bangalore"
              required
            />

            <Input
              label="Area / Neighborhood"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Indiranagar"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Precise Geolocation (Coordinates)</span>
              <Button type="button" size="sm" variant="outline" onClick={handleFetchCoordinates}>
                <Navigation className="w-3.5 h-3.5 mr-1 text-teal-600" />
                Capture GPS
              </Button>
            </div>
            <p className="text-slate-500">
              Latitude: {latitude ? latitude.toFixed(4) : 'Not captured'} | Longitude: {longitude ? longitude.toFixed(4) : 'Not captured'}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" loading={saving}>
              Save Address
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerProfilePage;
