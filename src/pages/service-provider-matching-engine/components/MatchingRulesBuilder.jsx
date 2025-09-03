import React, { useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, Settings, Zap, ToggleLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const MatchingRulesBuilder = ({ 
  rules = [], 
  providers = [], 
  services = [],
  onRuleToggle,
  onRuleUpdate,
  onRuleCreate 
}) => {
  const [editingRule, setEditingRule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    conditions: {},
    actions: {},
    weight: 50,
    isActive: true
  });

  const ruleTemplates = [
    {
      id: 'emergency',
      name: 'Emergency Priority',
      description: 'Route emergency cases to available senior dentists',
      conditions: { appointmentType: 'emergency', urgencyLevel: 'high' },
      actions: { minimumCompetency: 3, skipWorkloadCheck: true },
      weight: 95
    },
    {
      id: 'high-value',
      name: 'High-Value Patient',
      description: 'Priority matching for high-value treatments',
      conditions: { treatmentValue: { min: 500 } },
      actions: { preferredCompetency: 4, allowOverride: true },
      weight: 85
    },
    {
      id: 'workload-balance',
      name: 'Workload Balancing',
      description: 'Distribute appointments to maintain balanced workloads',
      conditions: { workloadThreshold: 80 },
      actions: { redistributeAppointments: true },
      weight: 70
    }
  ];

  const conditionTypes = [
    { value: 'treatmentValue', label: 'Treatment Value', type: 'number' },
    { value: 'patientType', label: 'Patient Type', type: 'select', options: ['new', 'returning', 'VIP'] },
    { value: 'appointmentType', label: 'Appointment Type', type: 'select', options: ['regular', 'emergency', 'consultation'] },
    { value: 'urgencyLevel', label: 'Urgency Level', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
    { value: 'timeOfDay', label: 'Time of Day', type: 'select', options: ['morning', 'afternoon', 'evening'] },
    { value: 'dayOfWeek', label: 'Day of Week', type: 'select', options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    { value: 'providerSpecialization', label: 'Provider Specialization', type: 'multiselect' },
    { value: 'serviceComplexity', label: 'Service Complexity', type: 'range' },
    { value: 'waitTime', label: 'Maximum Wait Time (days)', type: 'number' },
    { value: 'workloadThreshold', label: 'Workload Threshold (%)', type: 'number' }
  ];

  const actionTypes = [
    { value: 'minimumCompetency', label: 'Minimum Competency Level', type: 'select', options: ['1', '2', '3', '4', '5'] },
    { value: 'preferredCompetency', label: 'Preferred Competency Level', type: 'select', options: ['1', '2', '3', '4', '5'] },
    { value: 'allowOverride', label: 'Allow Manual Override', type: 'boolean' },
    { value: 'skipWorkloadCheck', label: 'Skip Workload Check', type: 'boolean' },
    { value: 'notificationLevel', label: 'Notification Level', type: 'select', options: ['low', 'medium', 'high', 'urgent'] },
    { value: 'redistributeAppointments', label: 'Redistribute Appointments', type: 'boolean' },
    { value: 'considerAlternativeProviders', label: 'Consider Alternative Providers', type: 'boolean' },
    { value: 'priorityBoost', label: 'Priority Boost', type: 'number' },
    { value: 'maxWaitTime', label: 'Maximum Wait Time (hours)', type: 'number' },
    { value: 'autoAssign', label: 'Auto-assign if Available', type: 'boolean' }
  ];

  const handleCreateRule = (template = null) => {
    if (template) {
      setNewRule({
        ...template,
        id: undefined // Remove template ID
      });
    } else {
      setNewRule({
        name: '',
        description: '',
        conditions: {},
        actions: {},
        weight: 50,
        isActive: true
      });
    }
    setShowCreateModal(true);
  };

  const handleSaveRule = () => {
    if (editingRule) {
      onRuleUpdate(editingRule?.id, newRule);
      setEditingRule(null);
    } else {
      onRuleCreate(newRule);
      setShowCreateModal(false);
    }
    
    setNewRule({
      name: '',
      description: '',
      conditions: {},
      actions: {},
      weight: 50,
      isActive: true
    });
  };

  const handleEditRule = (rule) => {
    setNewRule({ ...rule });
    setEditingRule(rule);
    setShowCreateModal(true);
  };

  const handleConditionChange = (conditionType, value) => {
    setNewRule(prev => ({
      ...prev,
      conditions: {
        ...prev?.conditions,
        [conditionType]: value
      }
    }));
  };

  const handleActionChange = (actionType, value) => {
    setNewRule(prev => ({
      ...prev,
      actions: {
        ...prev?.actions,
        [actionType]: value
      }
    }));
  };

  const removeCondition = (conditionType) => {
    setNewRule(prev => {
      const newConditions = { ...prev?.conditions };
      delete newConditions?.[conditionType];
      return { ...prev, conditions: newConditions };
    });
  };

  const removeAction = (actionType) => {
    setNewRule(prev => {
      const newActions = { ...prev?.actions };
      delete newActions?.[actionType];
      return { ...prev, actions: newActions };
    });
  };

  const getRuleStatusIcon = (rule) => {
    if (!rule?.isActive) return <Settings className="w-4 h-4 text-gray-400" />;
    if (rule?.weight >= 90) return <Zap className="w-4 h-4 text-red-500" />;
    if (rule?.weight >= 70) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getWeightColor = (weight) => {
    if (weight >= 90) return 'text-red-600 bg-red-50';
    if (weight >= 70) return 'text-yellow-600 bg-yellow-50';
    if (weight >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Matching Rules Configuration</h3>
          <p className="text-gray-600">Define intelligent routing rules to optimize appointment matching and provider utilization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleCreateRule()}
            iconName="Plus"
          >
            Create Rule
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateModal(true)}
          >
            Rule Templates
          </Button>
        </div>
      </div>
      {/* Rules List */}
      <div className="space-y-4">
        {rules?.map((rule) => (
          <div
            key={rule?.id}
            className={`border rounded-lg p-4 transition-all ${
              rule?.isActive 
                ? 'border-gray-200 bg-white shadow-sm' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getRuleStatusIcon(rule)}
                  <h4 className="font-medium text-gray-900">{rule?.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWeightColor(rule?.weight)}`}>
                    Weight: {rule?.weight}
                  </span>
                  <button
                    onClick={() => onRuleToggle(rule?.id)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      rule?.isActive
                        ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rule?.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{rule?.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Conditions */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Conditions</h5>
                    <div className="space-y-1">
                      {Object.entries(rule?.conditions || {})?.map(([key, value]) => (
                        <div key={key} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                          <span className="font-medium">{key}:</span> {
                            typeof value === 'object' 
                              ? JSON.stringify(value)
                              : value?.toString()
                          }
                        </div>
                      ))}
                      {Object.keys(rule?.conditions || {})?.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No conditions defined</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Actions</h5>
                    <div className="space-y-1">
                      {Object.entries(rule?.actions || {})?.map(([key, value]) => (
                        <div key={key} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                          <span className="font-medium">{key}:</span> {
                            typeof value === 'boolean' ? (value ?'Yes' : 'No')
                              : value?.toString()
                          }
                        </div>
                      ))}
                      {Object.keys(rule?.actions || {})?.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No actions defined</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditRule(rule)}
                  iconName="Edit"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRuleToggle(rule?.id)}
                >
                  <ToggleLeft className={`w-4 h-4 ${rule?.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {rules?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Configured</h3>
            <p className="text-gray-600 mb-4">Create your first matching rule to start intelligent appointment routing.</p>
            <Button onClick={() => handleCreateRule()} iconName="Plus">
              Create Rule
            </Button>
          </div>
        )}
      </div>
      {/* Create/Edit Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRule(null);
                  }}
                  iconName="X"
                />
              </div>

              {!editingRule && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Start Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ruleTemplates?.map((template) => (
                      <button
                        key={template?.id}
                        onClick={() => handleCreateRule(template)}
                        className="p-3 border border-gray-200 rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="font-medium text-gray-900 mb-1">{template?.name}</div>
                        <div className="text-sm text-gray-600">{template?.description}</div>
                        <div className="text-xs text-gray-500 mt-2">Weight: {template?.weight}</div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Custom Rule</h4>
                  </div>
                </div>
              )}

              {/* Rule Form */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Rule Name"
                    value={newRule?.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e?.target?.value }))}
                    placeholder="Enter rule name"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (0-100)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newRule?.weight}
                      onChange={(e) => setNewRule(prev => ({ ...prev, weight: parseInt(e?.target?.value) }))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      Current: {newRule?.weight} (Higher weight = Higher priority)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRule?.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e?.target?.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Describe when and how this rule should be applied"
                  />
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Conditions</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Add condition logic
                        const newConditionType = conditionTypes?.[0]?.value;
                        handleConditionChange(newConditionType, '');
                      }}
                      iconName="Plus"
                    >
                      Add Condition
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(newRule?.conditions || {})?.map(([conditionType, value]) => (
                      <div key={conditionType} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Select
                          value={conditionType}
                          onValueChange={(newType) => {
                            const newConditions = { ...newRule?.conditions };
                            delete newConditions?.[conditionType];
                            newConditions[newType] = value;
                            setNewRule(prev => ({ ...prev, conditions: newConditions }));
                          }}
                          options={conditionTypes?.map(ct => ({ value: ct?.value, label: ct?.label }))}
                          className="w-48"
                        />
                        
                        <Input
                          value={typeof value === 'object' ? JSON.stringify(value) : value}
                          onChange={(e) => {
                            let parsedValue = e?.target?.value;
                            try {
                              if (e?.target?.value?.startsWith('{') || e?.target?.value?.startsWith('[')) {
                                parsedValue = JSON.parse(e?.target?.value);
                              }
                            } catch {}
                            handleConditionChange(conditionType, parsedValue);
                          }}
                          placeholder="Enter condition value"
                          className="flex-1"
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(conditionType)}
                          iconName="Trash2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Actions</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newActionType = actionTypes?.[0]?.value;
                        handleActionChange(newActionType, '');
                      }}
                      iconName="Plus"
                    >
                      Add Action
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(newRule?.actions || {})?.map(([actionType, value]) => (
                      <div key={actionType} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Select
                          value={actionType}
                          onValueChange={(newType) => {
                            const newActions = { ...newRule?.actions };
                            delete newActions?.[actionType];
                            newActions[newType] = value;
                            setNewRule(prev => ({ ...prev, actions: newActions }));
                          }}
                          options={actionTypes?.map(at => ({ value: at?.value, label: at?.label }))}
                          className="w-48"
                        />
                        
                        {actionTypes?.find(at => at?.value === actionType)?.type === 'boolean' ? (
                          <Select
                            value={value?.toString()}
                            onValueChange={(val) => handleActionChange(actionType, val === 'true')}
                            options={[
                              { value: 'true', label: 'Yes' },
                              { value: 'false', label: 'No' }
                            ]}
                            className="flex-1"
                          />
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) => handleActionChange(actionType, e?.target?.value)}
                            placeholder="Enter action value"
                            className="flex-1"
                          />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(actionType)}
                          iconName="Trash2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingRule(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRule}>
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingRulesBuilder;