import React, { useState } from 'react';
import { Star, Clock, Edit, Save, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProviderServiceMatrix = ({ providers = [], services = [], filters, onProviderUpdate }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  // Filter providers and services based on current filters
  const filteredProviders = providers?.filter(provider => {
    if (filters?.provider !== 'all' && provider?.id !== filters?.provider) return false;
    if (filters?.status !== 'all' && provider?.status !== filters?.status) return false;
    if (filters?.competencyLevel !== 'all' && provider?.competencyLevel !== parseInt(filters?.competencyLevel)) return false;
    return true;
  });

  const filteredServices = services?.filter(service => {
    if (filters?.service !== 'all' && service?.id !== filters?.service) return false;
    return true;
  });

  // Mock provider-service specializations
  const getProviderServiceData = (providerId, serviceId) => {
    // This would come from actual data/API
    const mockData = {
      'dr-smith': {
        'consultation': { competency: 5, preference: 90, pricing: 120, bufferTime: 15 },
        'cleaning': { competency: 4, preference: 70, pricing: 100, bufferTime: 15 },
        'filling': { competency: 5, preference: 85, pricing: 150, bufferTime: 20 },
        'crown': { competency: 5, preference: 95, pricing: 550, bufferTime: 30 },
        'implant': { competency: 5, preference: 100, pricing: 1500, bufferTime: 45 },
        'orthodontic': { competency: 3, preference: 40, pricing: 250, bufferTime: 25 }
      },
      'dr-johnson': {
        'consultation': { competency: 4, preference: 85, pricing: 95, bufferTime: 15 },
        'cleaning': { competency: 4, preference: 75, pricing: 95, bufferTime: 15 },
        'filling': { competency: 4, preference: 80, pricing: 130, bufferTime: 20 },
        'crown': { competency: 4, preference: 70, pricing: 480, bufferTime: 30 },
        'implant': { competency: 3, preference: 60, pricing: 1300, bufferTime: 45 },
        'orthodontic': { competency: 5, preference: 100, pricing: 220, bufferTime: 25 }
      },
      'dr-wilson': {
        'consultation': { competency: 3, preference: 80, pricing: 85, bufferTime: 15 },
        'cleaning': { competency: 4, preference: 90, pricing: 90, bufferTime: 15 },
        'filling': { competency: 3, preference: 75, pricing: 125, bufferTime: 20 },
        'crown': { competency: 2, preference: 50, pricing: 420, bufferTime: 30 },
        'implant': { competency: 1, preference: 10, pricing: 1200, bufferTime: 45 },
        'orthodontic': { competency: 2, preference: 30, pricing: 200, bufferTime: 25 }
      }
    };

    return mockData?.[providerId]?.[serviceId] || { competency: 1, preference: 0, pricing: 0, bufferTime: 15 };
  };

  const getCompetencyColor = (level) => {
    if (level >= 5) return 'bg-purple-500';
    if (level >= 4) return 'bg-blue-500';
    if (level >= 3) return 'bg-green-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getPreferenceColor = (preference) => {
    if (preference >= 90) return 'text-green-600';
    if (preference >= 70) return 'text-blue-600';
    if (preference >= 50) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const handleCellEdit = (providerId, serviceId, field, value) => {
    const cellKey = `${providerId}-${serviceId}`;
    setEditValues(prev => ({
      ...prev,
      [cellKey]: {
...prev?.[cellKey],
        [field]: value
      }
    }));
  };

  const handleSaveCell = (providerId, serviceId) => {
    const cellKey = `${providerId}-${serviceId}`;
    const updatedValues = editValues?.[cellKey];
    
    // Here you would typically make an API call to save the changes
    console.log('Saving provider-service configuration:', {
      providerId,
      serviceId,
      updates: updatedValues
    });

    setEditingCell(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues?.[cellKey];
      return newValues;
    });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValues({});
  };

  const handleDragStart = (providerId, serviceId) => {
    setDraggedItem({ providerId, serviceId });
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
  };

  const handleDrop = (e, targetProviderId, targetServiceId) => {
    e?.preventDefault();
    
    if (draggedItem && (draggedItem?.providerId !== targetProviderId || draggedItem?.serviceId !== targetServiceId)) {
      // Handle reordering or swapping logic here
      console.log('Moving from:', draggedItem, 'to:', { targetProviderId, targetServiceId });
    }
    
    setDraggedItem(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Provider-Service Specialization Matrix</h3>
          <p className="text-gray-600">Configure competency levels, preferences, and pricing for each provider-service combination.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Bulk Edit
          </Button>
          <Button variant="outline" size="sm">
            Import CSV
          </Button>
          <Button size="sm">
            Save Changes
          </Button>
        </div>
      </div>
      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 min-w-48">
                Provider
              </th>
              {filteredServices?.map((service) => (
                <th 
                  key={service?.id} 
                  className="border border-gray-200 p-3 text-center font-medium text-gray-900 min-w-40"
                >
                  <div>
                    <div className="font-medium">{service?.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{service?.duration}min</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProviders?.map((provider) => (
              <tr key={provider?.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {provider?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{provider?.name}</div>
                      <div className="text-sm text-gray-600">{provider?.role}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{provider?.averageRating}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider?.utilizationRate}% utilized
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                
                {filteredServices?.map((service) => {
                  const serviceData = getProviderServiceData(provider?.id, service?.id);
                  const cellKey = `${provider?.id}-${service?.id}`;
                  const isEditing = editingCell === cellKey;
                  const editData = editValues?.[cellKey] || serviceData;

                  return (
                    <td 
                      key={`${provider?.id}-${service?.id}`}
                      className="border border-gray-200 p-2"
                      draggable={!isEditing}
                      onDragStart={() => handleDragStart(provider?.id, service?.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, provider?.id, service?.id)}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <label className="text-xs text-gray-600">Competency</label>
                              <select
                                value={editData?.competency || 1}
                                onChange={(e) => handleCellEdit(provider?.id, service?.id, 'competency', parseInt(e?.target?.value))}
                                className="w-full text-xs border border-gray-300 rounded p-1"
                              >
                                {[1, 2, 3, 4, 5]?.map(level => (
                                  <option key={level} value={level}>{level}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Preference</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editData?.preference || 0}
                                onChange={(e) => handleCellEdit(provider?.id, service?.id, 'preference', parseInt(e?.target?.value))}
                                className="text-xs p-1 h-6"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <label className="text-xs text-gray-600">Price (£)</label>
                              <Input
                                type="number"
                                min="0"
                                value={editData?.pricing || 0}
                                onChange={(e) => handleCellEdit(provider?.id, service?.id, 'pricing', parseInt(e?.target?.value))}
                                className="text-xs p-1 h-6"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Buffer (min)</label>
                              <Input
                                type="number"
                                min="0"
                                max="60"
                                value={editData?.bufferTime || 15}
                                onChange={(e) => handleCellEdit(provider?.id, service?.id, 'bufferTime', parseInt(e?.target?.value))}
                                className="text-xs p-1 h-6"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-1 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveCell(provider?.id, service?.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Save size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-6 px-2 text-xs"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="text-center space-y-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                          onClick={() => setEditingCell(cellKey)}
                        >
                          {/* Competency Level */}
                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5]?.map(level => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <= serviceData?.competency 
                                      ? getCompetencyColor(serviceData?.competency)
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Preference Score */}
                          <div className={`text-xs font-medium ${getPreferenceColor(serviceData?.preference)}`}>
                            {serviceData?.preference}%
                          </div>

                          {/* Pricing */}
                          <div className="text-xs text-gray-700 font-medium">
                            £{serviceData?.pricing}
                          </div>

                          {/* Buffer Time */}
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <Clock size={10} />
                            <span>{serviceData?.bufferTime}m</span>
                          </div>

                          {/* Edit indicator */}
                          <div className="opacity-0 hover:opacity-100 transition-opacity">
                            <Edit size={12} className="text-gray-400" />
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Matrix Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700 mb-2">Competency Levels</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Level 5: Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Level 4: Advanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Level 3: Intermediate</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">Preference Score</div>
            <div className="space-y-1 text-xs">
              <div>90-100%: Highly Preferred</div>
              <div>70-89%: Preferred</div>
              <div>50-69%: Acceptable</div>
              <div>&lt;50%: Last Resort</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">Pricing</div>
            <div className="space-y-1 text-xs">
              <div>Base service cost</div>
              <div>Provider-specific multiplier</div>
              <div>Complexity adjustments</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">Buffer Time</div>
            <div className="space-y-1 text-xs">
              <div>Post-appointment cleanup</div>
              <div>Setup for next patient</div>
              <div>Provider rest time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderServiceMatrix;