import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building, Phone, MapPin, User } from 'lucide-react';

const EmployerProfilePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('INDIVIDUAL');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profiles/employer')
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setCompanyName(d.companyName || '');
          setBusinessType(d.businessType || 'INDIVIDUAL');
          setAddress(d.address || '');
          setCity(d.city || '');
          setContactPerson(d.contactPerson || '');
          setPhone(d.phone || '');
        }
      })
      .catch((err) => console.error("Could not load employer profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/employer', {
        companyName,
        businessType,
        address,
        city,
        contactPerson,
        phone
      });
      success('Employer profile updated successfully!');
    } catch (err) {
      error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Company & Employer Profile</h1>
        <p className="text-xs text-slate-500">Keep your business details current for prospective job applicants.</p>
      </div>

      <Card className="p-8 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Company / Enterprise Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Business Entity Type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              options={[
                { value: 'INDIVIDUAL', label: 'Individual Employer' },
                { value: 'SHOPKEEPER', label: 'Local Shopkeeper / Retailer' },
                { value: 'CONTRACTOR', label: 'Civil / Labour Contractor' },
                { value: 'ENTERPRISE', label: 'Registered Enterprise' },
              ]}
              required
            />

            <Input
              label="Contact Person Name"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Address</label>
            <textarea
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full shop or site office address..."
              className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
            ></textarea>
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

export default EmployerProfilePage;
