import React, { useState } from 'react';
import { Plus, Edit, Trash2, Crown, Users, CheckCircle, User, DollarSign, Settings, Save, X } from 'lucide-react';
import { membershipPlansService } from '../../../services/membershipService';

const PlanConfiguration = ({ plans = [], onPlansUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultPlan = {
    name: '',
    description: '',
    tier: 'basic',
    monthly_price: 0,
    quarterly_price: 0,
    annual_price: 0,
    benefits: [],
    service_inclusions: {},
    max_family_members: 1,
    is_active: true
  };

  const [formData, setFormData] = useState(defaultPlan);

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

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium':
        return 'bg-yellow-50 border-yellow-200';
      case 'family':
        return 'bg-purple-50 border-purple-200';
      case 'standard':
        return 'bg-blue-50 border-blue-200';
      case 'basic':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleCreatePlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await membershipPlansService?.create(formData);
      if (error) throw error;
      
      await onPlansUpdate();
      setShowCreateForm(false);
      setFormData(defaultPlan);
    } catch (err) {
      setError('Failed to create membership plan');
      console.error('Create plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await membershipPlansService?.update(editingPlan?.id, formData);
      if (error) throw error;
      
      await onPlansUpdate();
      setEditingPlan(null);
      setFormData(defaultPlan);
    } catch (err) {
      setError('Failed to update membership plan');
      console.error('Update plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      benefits: plan?.benefits || [],
      service_inclusions: plan?.service_inclusions || {}
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingPlan(null);
    setFormData(defaultPlan);
    setError('');
  };

  const addBenefit = () => {
    const newBenefit = prompt("Enter new benefit:");
    if (newBenefit) {
      setFormData(prev => ({
        ...prev,
        benefits: [...(prev?.benefits || []), newBenefit]
      }));
    }
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev?.benefits?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Membership Plans Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage membership plan tiers and pricing
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </button>
      </div>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-gray-900">
              {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
            </h4>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  value={formData?.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e?.target?.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData?.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e?.target?.value }))}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tier</label>
                <select
                  value={formData?.tier}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e?.target?.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="family">Family</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Family Members</label>
                <input
                  type="number"
                  min="1"
                  value={formData?.max_family_members}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_family_members: parseInt(e?.target?.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData?.monthly_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: parseFloat(e?.target?.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quarterly Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData?.quarterly_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quarterly_price: parseFloat(e?.target?.value) || null }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData?.annual_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, annual_price: parseFloat(e?.target?.value) || null }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData?.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e?.target?.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active Plan
                </label>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Benefits</label>
              <button
                onClick={addBenefit}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add Benefit
              </button>
            </div>
            <div className="space-y-2">
              {formData?.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-900">{benefit}</span>
                  <button
                    onClick={() => removeBenefit(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!formData?.benefits?.length && (
                <p className="text-sm text-gray-500 italic">No benefits added yet.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
            </button>
          </div>
        </div>
      )}
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div key={plan?.id} className={`border-2 rounded-lg p-6 ${getTierColor(plan?.tier)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getTierIcon(plan?.tier)}
                <h4 className="ml-2 text-lg font-semibold text-gray-900">{plan?.name}</h4>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{plan?.description}</p>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-green-600">£{plan?.monthly_price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              
              {plan?.quarterly_price && (
                <div className="text-sm text-gray-600">
                  Quarterly: £{plan?.quarterly_price}
                </div>
              )}
              
              {plan?.annual_price && (
                <div className="text-sm text-gray-600">
                  Annual: £{plan?.annual_price}
                </div>
              )}
            </div>

            {/* Benefits */}
            {plan?.benefits?.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan?.benefits?.slice(0, 3)?.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                  {plan?.benefits?.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{plan?.benefits?.length - 3} more benefits
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Max {plan?.max_family_members} member{plan?.max_family_members !== 1 ? 's' : ''}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                plan?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {plan?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
      {!plans?.length && !showCreateForm && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Membership Plans</h3>
          <p className="text-gray-500 mb-4">Create your first membership plan to get started.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanConfiguration;