import React from 'react';
import { User, Calendar, Phone, Mail, CheckCircle, AlertCircle, Crown, Users } from 'lucide-react';

const MembersDirectory = ({ members = [], onViewMember }) => {
  const getTierIcon = (tier) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'family':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'standard':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'basic':
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
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
    return daysDiff <= 7; // Within 7 days
  };

  if (!members?.length) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Members</h3>
          <p className="text-gray-500">There are no active membership members to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Active Members Directory</h3>
        <p className="text-sm text-gray-500 mt-1">
          View and manage active membership members and their benefits
        </p>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members?.map((member) => (
                <tr key={member?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member?.patient?.first_name} {member?.patient?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {member?.membership_number || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {member?.patient?.email || 'No email'}
                      </div>
                      {member?.patient?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {member?.patient?.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTierIcon(member?.membership_plan?.tier)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {member?.membership_plan?.name || 'Unknown Plan'}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {member?.membership_plan?.tier || 'N/A'} tier
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          £{member?.monthly_amount || '0.00'}/month
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(member?.status)}>
                      {member?.status || 'unknown'}
                    </span>
                    {member?.family_members_count > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Family: {member?.family_members_count} members
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {member?.next_billing_date ? 
                          new Date(member.next_billing_date)?.toLocaleDateString() : 
                          'Unknown'
                        }
                      </div>
                      {isNearRenewal(member?.next_billing_date) && (
                        <div className="flex items-center mt-1 text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Due Soon
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewMember(member)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {members?.map((member) => (
            <div key={member?.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-medium text-gray-900">
                      {member?.patient?.first_name} {member?.patient?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member?.membership_number || 'N/A'}
                    </div>
                  </div>
                </div>
                <span className={getStatusBadge(member?.status)}>
                  {member?.status || 'unknown'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{member?.patient?.email || 'No email'}</span>
                </div>
                
                {member?.patient?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{member?.patient?.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTierIcon(member?.membership_plan?.tier)}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {member?.membership_plan?.name || 'Unknown Plan'}
                    </span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    £{member?.monthly_amount || '0.00'}/month
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Next billing: {member?.next_billing_date ? 
                      new Date(member.next_billing_date)?.toLocaleDateString() : 
                      'Unknown'
                    }
                  </div>
                  <button
                    onClick={() => onViewMember(member)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersDirectory;