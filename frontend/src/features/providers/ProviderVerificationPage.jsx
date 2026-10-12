import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { VERIFICATION_STATUSES } from '../../utils/constants';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldCheck, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const ProviderVerificationPage = () => {
  const { success, error } = useToast();
  const [profile, setProfile] = useState(null);
  const [idProofUrl, setIdProofUrl] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/profiles/provider')
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setIdProofUrl(res.data.idProofUrl || '');
          setVerificationNotes(res.data.verificationNotes || '');
        }
      })
      .catch((err) => console.error("Could not load provider profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put('/profiles/provider', {
        ...profile,
        idProofUrl,
        verificationStatus: 'PENDING',
        verificationNotes: 'Resubmitted for administrative verification'
      });
      success('Verification submission recorded! Our administrative team will review your credentials.');
      setProfile({
        ...profile,
        idProofUrl,
        verificationStatus: 'PENDING'
      });
    } catch (err) {
      error('Failed to submit verification details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading verification records..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Provider Verification & Trust Badges</h1>
        <p className="text-xs text-slate-500">
          Earn the verified badge displayed to all prospective customers across search results.
        </p>
      </div>

      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800">Current Verification Status:</span>
            <Badge color={VERIFICATION_STATUSES[profile?.verificationStatus]?.color || 'bg-slate-100'}>
              {VERIFICATION_STATUSES[profile?.verificationStatus]?.label || profile?.verificationStatus}
            </Badge>
          </div>
          {profile?.verificationStatus === 'APPROVED' && (
            <span className="text-xs font-bold text-teal-700 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1" />
              Verified Status Active
            </span>
          )}
        </div>

        {profile?.verificationStatus === 'APPROVED' ? (
          <div className="p-6 bg-teal-50/60 rounded-2xl border border-teal-200 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-lg font-bold text-teal-950">You Are a Verified Service Provider</h3>
            <p className="text-xs text-teal-800 max-w-md mx-auto leading-relaxed">
              Your credentials have been validated by platform administrators. Your profile displays the official verified badge across all public searches.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert
              type="info"
              title="Verification Requirements"
              message="Please provide a link or reference number to your government-issued identity proof (Aadhaar / Voter ID / Trade License / Electrical/Plumbing Contractor Certificate)."
            />

            <Input
              label="Document Identification / Certificate Link"
              placeholder="e.g. License ID: KA-ELEC-2023-8941 or Secure Document Link"
              value={idProofUrl}
              onChange={(e) => setIdProofUrl(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes for Administration Reviewer
              </label>
              <textarea
                rows="3"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Include any trade registration details, years registered, or previous certifications..."
                className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" loading={submitting}>
                Submit for Administrator Review
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ProviderVerificationPage;
