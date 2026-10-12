import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Briefcase, MapPin, IndianRupee } from 'lucide-react';

const WorkerProfilePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [dailyRate, setDailyRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/skills'),
      api.get('/profiles/worker')
    ])
      .then(([skillsRes, profRes]) => {
        if (skillsRes.data) setSkills(skillsRes.data);
        if (profRes.data) {
          const d = profRes.data;
          setHeadline(d.headline || '');
          setBio(d.bio || '');
          setYearsOfExperience(d.yearsOfExperience || 0);
          setDailyRate(d.dailyRate || '');
          setHourlyRate(d.hourlyRate || '');
          setCity(d.city || '');
          setArea(d.area || '');
          setAvailabilityStatus(d.availabilityStatus || 'AVAILABLE');
          if (d.skillIds) setSelectedSkillIds(Array.from(d.skillIds));
        }
      })
      .catch((err) => console.error("Could not load worker profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSkillToggle = (id) => {
    if (selectedSkillIds.includes(id)) {
      setSelectedSkillIds(selectedSkillIds.filter((sId) => sId !== id));
    } else {
      setSelectedSkillIds([...selectedSkillIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/worker', {
        headline,
        bio,
        yearsOfExperience: Number(yearsOfExperience),
        dailyRate: Number(dailyRate),
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
        city,
        area,
        availabilityStatus,
        skillIds: selectedSkillIds
      });
      success('Worker profile updated successfully!');
    } catch (err) {
      error('Failed to update worker profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Worker Profile & Skills</h1>
        <p className="text-xs text-slate-500">Showcase your trade skills and availability to employers.</p>
      </div>

      <Card className="p-8 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Professional Headline"
            placeholder="e.g. Master Mason with 8 Years Experience in Residential Brickwork"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio & Trade Experience</label>
            <textarea
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight the types of projects, specialized tools, and past works..."
              className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              required
            />

            <Input
              label="Expected Daily Wage (₹)"
              type="number"
              placeholder="e.g. 900"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              required
            />

            <Select
              label="Availability Status"
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              options={[
                { value: 'AVAILABLE', label: 'Available for Work' },
                { value: 'BUSY', label: 'Currently Busy on a Site' },
                { value: 'UNAVAILABLE', label: 'Unavailable / On Leave' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="e.g. Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <Input
              label="Operational Area / Hub"
              placeholder="e.g. Indiranagar, Whitefield"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trade Skills (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {skill.name}
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

export default WorkerProfilePage;
