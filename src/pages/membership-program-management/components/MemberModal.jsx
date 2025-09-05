import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  Crown,
  Users,
  CheckCircle,
  Activity,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { membershipsService } from '../../../services/membershipService';

const MemberModal = ({ member, onClose }) => {
  const [memberDetails, setMemberDetails] = useState(member);
  const [loading, setLoading] = useState(false);

  // Load full member details on modal open
  useEffect(() => {
    loadMemberDetails();
  }, [member?.id]);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await membershipsService?.getById(member?.id);
      if (error) {
        console.error('Failed to load member details:', error);
      } else {
        setMemberDetails(data || member);
      }
    } catch (err) {
      console.error('Member details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'family':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'standard':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'basic':
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'suspended':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const isNearRenewal = (nextBillingDate) => {
    if (!nextBillingDate) return false;
    const today = new Date();
    const billing = new Date(nextBillingDate);
    const daysDiff = Math.ceil((billing - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  const calculateMembershipDuration = (startDate) => {
    if (!startDate) return 'Unknown';
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-medium text-gray-900">
                {memberDetails?.patient?.first_name} {memberDetails?.patient?.last_name}
              </h3>
              <p className="text-sm text-gray-500">
                Member ID: {memberDetails?.membership_number || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={getStatusBadge(memberDetails?.status)}>
              {memberDetails?.status || 'unknown'}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
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
                      {memberDetails?.patient?.first_name} {memberDetails?.patient?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">Full Name</p>
                  </div>
                </div>

                {memberDetails?.patient?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{memberDetails?.patient?.email}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>
                )}

                {memberDetails?.patient?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{memberDetails?.patient?.phone}</p>
                      <p className="text-xs text-gray-500">Phone Number</p>
                    </div>
                  </div>
                )}

                {memberDetails?.patient?.date_of_birth && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(memberDetails.patient.date_of_birth)?.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                    </div>
                  </div>
                )}

                {memberDetails?.practice_location?.name && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{memberDetails?.practice_location?.name}</p>
                      <p className="text-xs text-gray-500">Practice Location</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Details */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Membership Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {memberDetails?.start_date ? 
                        new Date(memberDetails.start_date)?.toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Member Since</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {calculateMembershipDuration(memberDetails?.start_date)}
                    </p>
                    <p className="text-xs text-gray-500">Membership Duration</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {memberDetails?.billing_frequency || 'Monthly'} Billing
                    </p>
                    <p className="text-xs text-gray-500">Billing Frequency</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {memberDetails?.next_billing_date ? 
                        new Date(memberDetails.next_billing_date)?.toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Next Billing Date</p>
                    {isNearRenewal(memberDetails?.next_billing_date) && (
                      <div className="flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                        <span className="text-xs text-orange-600">Due soon</span>
                      </div>
                    )}
                  </div>
                </div>

                {memberDetails?.family_members_count > 1 && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {memberDetails?.family_members_count} members
                      </p>
                      <p className="text-xs text-gray-500">Family Plan</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Plan */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Current Plan</h4>
              
              {memberDetails?.membership_plan ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    {getTierIcon(memberDetails?.membership_plan?.tier)}
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-900">
                        {memberDetails?.membership_plan?.name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {memberDetails?.membership_plan?.tier} tier
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-lg font-bold text-green-600">
                      £{memberDetails?.monthly_amount || '0.00'}/month
                    </span>
                  </div>

                  {memberDetails?.membership_plan?.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {memberDetails?.membership_plan?.description}
                    </p>
                  )}

                  {memberDetails?.membership_plan?.benefits && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Plan Benefits:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {memberDetails?.membership_plan?.benefits?.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {memberDetails?.membership_plan?.service_inclusions && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Service Inclusions:</p>
                      <div className="text-sm text-gray-600">
                        {Object.entries(memberDetails?.membership_plan?.service_inclusions)?.map(([service, count]) => (
                          <div key={service} className="flex justify-between">
                            <span className="capitalize">{service?.replace('_', ' ')}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No plan information available</p>
              )}
            </div>

            {/* Benefit Usage & History */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Benefit Usage</h4>
              
              {memberDetails?.benefits_used && Object.keys(memberDetails?.benefits_used)?.length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(memberDetails?.benefits_used)?.map(([benefit, used]) => (
                    <div key={benefit} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize text-gray-700">
                        {benefit?.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{used} used</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No benefit usage recorded yet</p>
                </div>
              )}

              {/* Application Reference */}
              {memberDetails?.application && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700">Original Application</p>
                  <p className="text-sm text-gray-600">
                    #{memberDetails?.application?.application_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {memberDetails?.application?.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50">
            Edit Member
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            View Payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;