import React, { useState } from 'react';
import { X, Code, Copy, ExternalLink, FileText, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const IntegrationGuide = ({ onClose, widgets }) => {
  const [selectedWidget, setSelectedWidget] = useState(widgets?.[0]?.id || '');
  const [selectedPlatform, setSelectedPlatform] = useState('html');
  const [copySuccess, setCopySuccess] = useState('');

  const widget = widgets?.find(w => w?.id === selectedWidget);

  const copyToClipboard = (text, type) => {
    navigator.clipboard?.writeText(text)?.then(() => {
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const generateEmbedCode = (platform) => {
    if (!widget) return '';

    const baseUrl = window.location?.origin;
    const widgetUrl = `${baseUrl}/embeddable-booking-widget`;
    
    const config = {
      practiceId: widget?.practiceId,
      theme: widget?.theme,
      services: widget?.settings?.allowedServices?.join(','),
      autoResize: widget?.settings?.autoResize,
      showHeader: widget?.settings?.showHeader,
      analytics: widget?.settings?.enableAnalytics
    };

    const queryString = Object.entries(config)?.filter(([_, value]) => value !== undefined && value !== null)?.map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${key}=${encodeURIComponent(value)}`;
      })?.join('&');

    switch (platform) {
      case 'html':
        return `<!-- DentalCRM Booking Widget -->
<div id="dental-booking-widget-${widget?.id}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${widgetUrl}?${queryString}';
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('allowtransparency', 'true');
    
    // Responsive height adjustment
    window.addEventListener('message', function(event) {
      if (event.data.type === 'widget:sizeChanged') {
        iframe.style.height = event.data.data.height + 'px';
      }
    });
    
    document.getElementById('dental-booking-widget-${widget?.id}').appendChild(iframe);
  })();
</script>`;

      case 'wordpress':
        return `<!-- Add this to your WordPress post/page -->
[dental_booking_widget id="${widget?.id}" src="${widgetUrl}?${queryString}"]

<!-- Or use this PHP code in your theme -->
<?php
echo '<div id="dental-booking-widget-${widget?.id}"></div>';
echo '<script>
  (function() {
    var iframe = document.createElement("iframe");
    iframe.src = "${widgetUrl}?${queryString}";
    iframe.style.width = "100%";
    iframe.style.minHeight = "400px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    document.getElementById("dental-booking-widget-${widget?.id}").appendChild(iframe);
  })();
</script>';
?>`;

      case 'react':
        return `import React, { useEffect, useRef } from 'react';

const DentalBookingWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.src = '${widgetUrl}?${queryString}';
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('allowtransparency', 'true');
    
    // Responsive height adjustment
    const handleMessage = (event) => {
      if (event.data.type === 'widget:sizeChanged') {
        iframe.style.height = event.data.data.height + 'px';
      }
    };
    
    window.addEventListener('message', handleMessage);
    containerRef.current.appendChild(iframe);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return <div ref={containerRef} className="dental-booking-widget" />;
};

export default DentalBookingWidget;`;

      case 'squarespace':
        return `<!-- Add this to a Code Block in Squarespace -->
<div id="dental-booking-widget-${widget?.id}" style="width: 100%; min-height: 400px;"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${widgetUrl}?${queryString}';
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('allowtransparency', 'true');
    
    window.addEventListener('message', function(event) {
      if (event.data.type === 'widget:sizeChanged') {
        iframe.style.height = event.data.data.height + 'px';
      }
    });
    
    document.getElementById('dental-booking-widget-${widget?.id}').appendChild(iframe);
  })();
</script>`;

      default:
        return '';
    }
  };

  const platforms = [
    { id: 'html', name: 'HTML/JavaScript', icon: Code },
    { id: 'wordpress', name: 'WordPress', icon: FileText },
    { id: 'react', name: 'React', icon: Zap },
    { id: 'squarespace', name: 'Squarespace', icon: ExternalLink }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Integration Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Widget Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Widget
            </label>
            <Select
              value={selectedWidget}
              onValueChange={setSelectedWidget}
            >
              {widgets?.map(widget => (
                <option key={widget?.id} value={widget?.id}>
                  {widget?.name} - {widget?.status}
                </option>
              ))}
            </Select>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Platform
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms?.map(platform => (
                <button
                  key={platform?.id}
                  onClick={() => setSelectedPlatform(platform?.id)}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    selectedPlatform === platform?.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700' :'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <platform.icon size={20} />
                  <span className="text-sm font-medium">{platform?.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Example */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Integration Code</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateEmbedCode(selectedPlatform), 'code')}
              >
                <Copy size={16} />
                {copySuccess === 'code' ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                <code>{generateEmbedCode(selectedPlatform)}</code>
              </pre>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Setup Instructions</h3>
            
            {selectedPlatform === 'html' && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">HTML/JavaScript Integration</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Copy the code above</li>
                    <li>Paste it into your HTML where you want the widget to appear</li>
                    <li>The widget will automatically resize to fit your content</li>
                    <li>Test the integration to ensure proper functionality</li>
                  </ol>
                </div>
              </div>
            )}

            {selectedPlatform === 'wordpress' && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">WordPress Integration</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Go to your WordPress admin dashboard</li>
                    <li>Edit the page/post where you want to add the widget</li>
                    <li>Add a Custom HTML block or Code block</li>
                    <li>Paste the code from above</li>
                    <li>Save and preview your page</li>
                  </ol>
                </div>
              </div>
            )}

            {selectedPlatform === 'react' && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">React Integration</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Create a new component file (e.g., DentalBookingWidget.jsx)</li>
                    <li>Copy the React component code above</li>
                    <li>Import and use the component in your React app</li>
                    <li>Ensure your build process can handle iframe elements</li>
                  </ol>
                </div>
              </div>
            )}

            {selectedPlatform === 'squarespace' && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Squarespace Integration</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Edit the page where you want to add the widget</li>
                    <li>Add a Code Block from the content blocks</li>
                    <li>Paste the code from above into the code block</li>
                    <li>Save and publish your page</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Security Notes */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Security & CORS Settings</h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                <li>Configure allowed origins in widget settings for enhanced security</li>
                <li>Use HTTPS for production deployments</li>
                <li>Test the widget thoroughly before going live</li>
                <li>Monitor analytics for any security issues</li>
              </ul>
            </div>

            {/* Customization Notes */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Customization Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                <li>Use the Theme Customizer to match your brand colors</li>
                <li>Configure which services appear in the widget</li>
                <li>Enable/disable analytics tracking as needed</li>
                <li>Set up cross-origin policies for enhanced security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;