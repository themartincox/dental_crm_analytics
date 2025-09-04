import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Settings, Code } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const WidgetBuilder = ({ widget, onSave, onCancel }) => {
  const [formData, setFormData] = useState(widget);
  const [availableServices, setAvailableServices] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Load available services from practice data
    const mockServices = [
      { id: 'consultation', name: 'Initial Consultation' },
      { id: 'cleaning', name: 'Professional Cleaning' },
      { id: 'whitening', name: 'Teeth Whitening' },
      { id: 'filling', name: 'Dental Filling' },
      { id: 'crown', name: 'Dental Crown' },
      { id: 'implant', name: 'Dental Implant' },
      { id: 'emergency', name: 'Emergency Treatment' }
    ];
    setAvailableServices(mockServices);
  }, []);

  const handleBasicInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev?.settings,
        [field]: value
      }
    }));
  };

  const handleServiceToggle = (serviceId) => {
    const currentServices = formData?.settings?.allowedServices || [];
    const updatedServices = currentServices?.includes(serviceId)
      ? currentServices?.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    handleSettingsChange('allowedServices', updatedServices);
  };

  const addAllowedOrigin = () => {
    const newOrigin = prompt('Enter domain (e.g., https://example.com):');
    if (newOrigin) {
      const currentOrigins = formData?.settings?.allowedOrigins || ['*'];
      const updatedOrigins = [...currentOrigins?.filter(o => o !== '*'), newOrigin];
      handleSettingsChange('allowedOrigins', updatedOrigins);
    }
  };

  const removeAllowedOrigin = (origin) => {
    const currentOrigins = formData?.settings?.allowedOrigins || [];
    const updatedOrigins = currentOrigins?.filter(o => o !== origin);
    handleSettingsChange('allowedOrigins', updatedOrigins?.length > 0 ? updatedOrigins : ['*']);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData?.name?.trim()) {
      errors?.push('Widget name is required');
    }
    
    if (!formData?.practiceId) {
      errors?.push('Practice ID is required');
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (errors?.length > 0) {
      alert('Please fix the following errors:\n' + errors?.join('\n'));
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Widget Builder</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X size={16} />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save size={16} />
            Save Widget
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Name *
              </label>
              <Input
                value={formData?.name || ''}
                onChange={(e) => handleBasicInfoChange('name', e?.target?.value)}
                placeholder="e.g., Main Website Widget"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData?.status || 'draft'}
                onValueChange={(value) => handleBasicInfoChange('status', value)}
              >
                <option value="draft">Draft</option>
                <option value="testing">Testing</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deployment URL
            </label>
            <Input
              value={formData?.deploymentUrl || ''}
              onChange={(e) => handleBasicInfoChange('deploymentUrl', e?.target?.value)}
              placeholder="https://yourwebsite.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              The website where this widget will be embedded
            </p>
          </div>
        </div>

        {/* Service Configuration */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Available Services</h4>
          <p className="text-sm text-gray-600">
            Select which services should be available in this widget. Leave empty to show all services.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {availableServices?.map((service) => (
              <div key={service?.id} className="flex items-center">
                <Checkbox
                  id={`service-${service?.id}`}
                  checked={formData?.settings?.allowedServices?.includes(service?.id) || false}
                  onCheckedChange={() => handleServiceToggle(service?.id)}
                />
                <label 
                  htmlFor={`service-${service?.id}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {service?.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Display Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Checkbox
                id="auto-resize"
                checked={formData?.settings?.autoResize !== false}
                onCheckedChange={(checked) => handleSettingsChange('autoResize', checked)}
              />
              <label htmlFor="auto-resize" className="ml-2 text-sm text-gray-700">
                Auto-resize widget height based on content
              </label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="show-header"
                checked={formData?.settings?.showHeader !== false}
                onCheckedChange={(checked) => handleSettingsChange('showHeader', checked)}
              />
              <label htmlFor="show-header" className="ml-2 text-sm text-gray-700">
                Show widget header with progress indicators
              </label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="enable-analytics"
                checked={formData?.settings?.enableAnalytics !== false}
                onCheckedChange={(checked) => handleSettingsChange('enableAnalytics', checked)}
              />
              <label htmlFor="enable-analytics" className="ml-2 text-sm text-gray-700">
                Enable analytics tracking
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="show-gdc-info"
                checked={formData?.settings?.showGDCInfo === true}
                onCheckedChange={(checked) => handleSettingsChange('showGDCInfo', checked)}
              />
              <label htmlFor="show-gdc-info" className="ml-2 text-sm text-gray-700">
                Show GDC compliance information
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Display General Dental Council information and regulatory details. 
              Typically disabled when embedding on practice websites that already contain this information.
            </p>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Advanced Settings</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings size={16} />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Allowed Origins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Origins (CORS Security)
                </label>
                <div className="space-y-2">
                  {formData?.settings?.allowedOrigins?.map((origin, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={origin}
                        onChange={(e) => {
                          const updatedOrigins = [...formData?.settings?.allowedOrigins];
                          updatedOrigins[index] = e?.target?.value;
                          handleSettingsChange('allowedOrigins', updatedOrigins);
                        }}
                        className="flex-1"
                      />
                      {origin !== '*' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAllowedOrigin(origin)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAllowedOrigin}
                  >
                    <Plus size={16} />
                    Add Domain
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Control which domains can embed this widget. Use "*" for any domain (less secure).
                </p>
              </div>
              
              {/* Default Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <Select
                  value={formData?.settings?.language || 'en'}
                  onValueChange={(value) => handleSettingsChange('language', value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </div>
              
              {/* Custom CSS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS (Advanced)
                </label>
                <textarea
                  value={formData?.settings?.customCSS || ''}
                  onChange={(e) => handleSettingsChange('customCSS', e?.target?.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  placeholder="/* Custom CSS overrides */"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Advanced styling overrides. Use CSS custom properties for theming.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Code */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Integration Preview</h4>
          <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
            <pre>{`<!-- DentalCRM Booking Widget -->
<div id="dental-booking-widget-${formData?.id}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${window.location?.origin}/embeddable-booking-widget?practiceId=${formData?.practiceId}&theme=${encodeURIComponent(JSON.stringify(formData?.theme || {}))}&services=${formData?.settings?.allowedServices?.join(',') || ''}';
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    document.getElementById('dental-booking-widget-${formData?.id}').appendChild(iframe);
  })();
</script>`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetBuilder;