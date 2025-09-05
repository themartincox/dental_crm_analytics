import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  FileText,
  Crown
} from 'lucide-react';

const ApplicationModal = ({ application, onClose, onApprove, onReject }) => {
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await onApprove(application?.id);
      onClose();
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason?.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    try {
      await onReject(application?.id, rejectionReason);
      onClose();
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'under_review':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTierIcon = (tier) => {
    if (tier === 'premium') return <Crown className="h-5 w-5 text-yellow-500" />;
    return <User className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Membership Application Details
              </h3>
              <p className="text-sm text-gray-500">
                Application #{application?.application_number || 'N/A'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Patient Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {application?.patient?.first_name} {application?.patient?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">Full Name</p>
                  </div>
                </div>

                {application?.patient?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{application?.patient?.email}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>
                )}

                {application?.patient?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{application?.patient?.phone}</p>
                      <p className="text-xs text-gray-500">Phone Number</p>
                    </div>
                  </div>
                )}

                {application?.patient?.date_of_birth && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(application.patient.date_of_birth)?.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                    </div>
                  </div>
                )}

                {application?.patient?.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{application?.patient?.address}</p>
                      <p className="text-xs text-gray-500">Address</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Application Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  {getStatusIcon(application?.status)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {application?.status?.replace('_', ' ') || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">Current Status</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(application.created_at)?.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Application Submitted</p>
                  </div>
                </div>

                {application?.requested_start_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(application.requested_start_date)?.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Requested Start Date</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {application?.billing_frequency || 'Monthly'} Billing
                    </p>
                    <p className="text-xs text-gray-500">Billing Frequency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Plan */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Membership Plan</h4>
              
              {application?.membership_plan ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    {getTierIcon(application?.membership_plan?.tier)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {application?.membership_plan?.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {application?.membership_plan?.tier} tier
                      </p>
                    </div>
                  </div>

                  <div className="text-lg font-bold text-green-600 mb-2">
                    £{application?.membership_plan?.monthly_price}/month
                  </div>

                  {application?.membership_plan?.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {application?.membership_plan?.description}
                    </p>
                  )}

                  {application?.membership_plan?.benefits && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Benefits:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {application?.membership_plan?.benefits?.slice(0, 3)?.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                        {application?.membership_plan?.benefits?.length > 3 && (
                          <li className="text-xs text-gray-500 italic">
                            +{application?.membership_plan?.benefits?.length - 3} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No plan information available</p>
              )}
            </div>

            {/* Emergency Contact & Notes */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Additional Information</h4>
              
              <div className="space-y-3">
                {application?.emergency_contact_name && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Emergency Contact</p>
                    <p className="text-sm text-gray-900">{application?.emergency_contact_name}</p>
                    {application?.emergency_contact_phone && (
                      <p className="text-sm text-gray-600">{application?.emergency_contact_phone}</p>
                    )}
                  </div>
                )}

                {application?.additional_notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Additional Notes</p>
                    <p className="text-sm text-gray-900">{application?.additional_notes}</p>
                  </div>
                )}

                {application?.practice_location?.name && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Practice Location</p>
                    <p className="text-sm text-gray-900">{application?.practice_location?.name}</p>
                  </div>
                )}

                {application?.processed_by?.full_name && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Processed By</p>
                    <p className="text-sm text-gray-900">{application?.processed_by?.full_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h5 className="text-sm font-medium text-red-800 mb-3">Rejection Reason</h5>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e?.target?.value)}
                placeholder="Please provide a detailed reason for rejecting this application..."
                className="w-full p-3 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500"
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

          {application?.status === 'pending' && (
            <>
              {showRejectForm ? (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing || !rejectionReason?.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing ? 'Approving...' : 'Approve Application'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;