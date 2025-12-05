import React, { useState } from 'react';
import { X, Building2, Mail, Phone, CheckCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../../../services/secureApiService';

const TenantSignupModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ organization_name: '', contact_email: '', contact_phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const resp = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/public/tenants/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(body || 'Signup failed');
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2500);
    } catch (err) {
      setError(err?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Create Your Clinic</h3>
            <p className="text-sm text-gray-600 mt-1">Start your tenant setup (pending approval)</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Request received</h4>
            <p className="text-gray-600 text-sm">We’ll email you once your clinic is approved.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="organization_name" name="organization_name" required value={form.organization_name} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Pear Tree Dental" />
              </div>
            </div>
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="contact_email" name="contact_email" type="email" required value={form.contact_email} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="owner@practice.com" />
              </div>
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="contact_phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+44 20 7123 4567" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center">
              {submitting ? (<><Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />Submitting.</>) : 'Create Clinic'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TenantSignupModal;

