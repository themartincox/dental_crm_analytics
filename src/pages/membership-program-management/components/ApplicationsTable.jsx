import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock, User, Calendar, Phone, Mail } from 'lucide-react';

const ApplicationsTable = ({ 
  applications = [], 
  onViewApplication,
  onApproveApplication,
  onRejectApplication 
}) => {
  const [processingId, setProcessingId] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'under_review':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleApprove = async (applicationId) => {
    setProcessingId(applicationId);
    try {
      await onApproveApplication(applicationId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    setProcessingId(applicationId);
    try {
      await onRejectApplication(applicationId, reason);
    } finally {
      setProcessingId(null);
    }
  };

  if (!applications?.length) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-500">There are no membership applications to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Membership Applications</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage membership applications from dental practice prospects
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications?.map((application) => (
              <tr key={application?.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {application?.application_number || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application?.billing_frequency || 'monthly'} billing
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">
                      {application?.patient?.first_name} {application?.patient?.last_name}
                    </div>
                    <div className="text-gray-500 flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {application?.patient?.email || 'No email'}
                    </div>
                    {application?.patient?.phone && (
                      <div className="text-gray-500 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {application?.patient?.phone}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{application?.membership_plan?.name || 'Unknown Plan'}</div>
                    <div className="text-gray-500 capitalize">
                      {application?.membership_plan?.tier || 'N/A'} tier
                    </div>
                    <div className="text-green-600 font-medium">
                      £{application?.membership_plan?.monthly_price || '0.00'}/month
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(application?.status)}
                    <span className={`ml-2 ${getStatusBadge(application?.status)}`}>
                      {application?.status?.replace('_', ' ') || 'unknown'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {application?.created_at ? 
                      new Date(application.created_at)?.toLocaleDateString() : 
                      'Unknown'
                    }
                  </div>
                  {application?.requested_start_date && (
                    <div className="text-xs text-gray-400 mt-1">
                      Start: {new Date(application.requested_start_date)?.toLocaleDateString()}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewApplication(application)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>

                  {application?.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(application?.id)}
                        disabled={processingId === application?.id}
                        className="text-green-600 hover:text-green-900 inline-flex items-center disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {processingId === application?.id ? 'Processing...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => handleReject(application?.id)}
                        disabled={processingId === application?.id}
                        className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;