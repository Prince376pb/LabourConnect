import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Briefcase, ArrowLeft } from 'lucide-react';

const PostJobPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('DAILY_WAGE');
  const [dailyWage, setDailyWage] = useState('');
  const [minMonthlySalary, setMinMonthlySalary] = useState('');
  const [maxMonthlySalary, setMaxMonthlySalary] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(1);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/skills')
      .then((res) => {
        if (res.data) setSkills(res.data);
      })
      .catch((err) => console.error("Could not load skills", err));

    // Pre-fill employer city if available
    api.get('/profiles/employer')
      .then((res) => {
        if (res.data && res.data.city) setCity(res.data.city);
      })
      .catch(() => {});
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
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        jobType,
        city,
        area,
        requiredSkillIds: selectedSkillIds
      };

      if (jobType === 'REGULAR') {
        if (!minMonthlySalary) {
          error('Minimum monthly salary is required for Regular Employment.');
          setLoading(false);
          return;
        }
        payload.minMonthlySalary = Number(minMonthlySalary);
        if (maxMonthlySalary) {
          payload.maxMonthlySalary = Number(maxMonthlySalary);
        } else {
          payload.maxMonthlySalary = Number(minMonthlySalary);
        }
        payload.workingHours = workingHours.trim();
        payload.estimatedDays = 365;
        payload.dailyWage = Math.round(Number(minMonthlySalary) / 26);
      } else {
        if (!dailyWage) {
          error('Compensation (₹/day) is required.');
          setLoading(false);
          return;
        }
        payload.dailyWage = Number(dailyWage);
        payload.estimatedDays = Number(estimatedDays) || 1;
      }

      await api.post('/jobs', payload);
      success('Job published successfully!');
      navigate('/employer/manage-jobs');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post job.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post a New Job</h1>
          <p className="text-xs text-slate-500">Provide accurate job specifications to match skilled wage workers.</p>
        </div>
      </div>

      <Card className="p-8 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Job Title"
            placeholder="e.g. Need 2 Experienced Masons for Boundary Wall Plastering"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Detailed Description & Requirements <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the nature of work, site location, safety tools provided, timing, and expectations..."
              className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
              required
            ></textarea>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Job Engagement Type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                options={[
                  { value: 'DAILY_WAGE', label: 'Daily Wage' },
                  { value: 'CONTRACT', label: 'Short-term Contract' },
                  { value: 'REGULAR', label: 'Regular Employment' },
                ]}
                required
              />

              {jobType === 'REGULAR' ? (
                <>
                  <Input
                    label="Min Monthly Salary (₹/mo)"
                    type="number"
                    placeholder="e.g. 18000"
                    value={minMonthlySalary}
                    onChange={(e) => setMinMonthlySalary(e.target.value)}
                    required
                  />

                  <Input
                    label="Max Monthly Salary (₹/mo)"
                    type="number"
                    placeholder="e.g. 24000 (Optional)"
                    value={maxMonthlySalary}
                    onChange={(e) => setMaxMonthlySalary(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Compensation (₹/day)"
                    type="number"
                    placeholder="e.g. 850"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(e.target.value)}
                    required
                  />

                  <Input
                    label="Estimated Days"
                    type="number"
                    min="1"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    required
                  />
                </>
              )}
            </div>

            {jobType === 'REGULAR' && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Working Hours & Weekly Schedule"
                    placeholder="e.g. 10:00 AM - 8:30 PM (6 days a week)"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                  />
                  <div className="flex items-center text-xs text-blue-700 font-medium leading-relaxed pt-2 sm:pt-6">
                    Regular Employment is ideal for shop assistants, retail showroom salesmen, cashiers, office assistants, and other full-time staff.
                  </div>
                </div>
              </div>
            )}
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
              label="Area / Neighborhood"
              placeholder="e.g. Indiranagar, Sector 4"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Required Skills
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

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Publish Job Post
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PostJobPage;
