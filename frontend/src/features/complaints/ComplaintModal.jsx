import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ComplaintModal = ({ isOpen, onClose, reportedUserId, reportedUserName, jobId, serviceRequestId, onComplaintFiled }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        reportedUserId,
        subject,
        description,
        jobId: jobId || null,
        serviceRequestId: serviceRequestId || null
      };

      await api.post('/complaints', payload);
      success('Complaint registered successfully. Platform administrators will investigate.');
      if (onComplaintFiled) onComplaintFiled();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to file complaint.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report Dispute with ${reportedUserName || 'User'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject of Dispute"
          placeholder="e.g. Unfinished service, no-show, improper behavior"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Detailed Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail the timeline, issues faced, and any relevant communication..."
            className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
            required
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Submit Complaint
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ComplaintModal;
