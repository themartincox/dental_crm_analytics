import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/Button';

const WidgetPreview = ({ widget, device, onDeviceChange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  const deviceDimensions = {
    desktop: { width: '100%', height: '600px', maxWidth: 'none' },
    tablet: { width: '768px', height: '600px', maxWidth: '100%' },
    mobile: { width: '375px', height: '600px', maxWidth: '100%' }
  };

  const generatePreviewUrl = () => {
    const baseUrl = `${window.location?.origin}/embeddable-booking-widget`;
    const params = new URLSearchParams({
      practiceId: widget?.practiceId || 'demo',
      theme: JSON.stringify(widget?.theme || {}),
      services: widget?.settings?.allowedServices?.join(',') || '',
      autoResize: widget?.settings?.autoResize !== false,
      showHeader: widget?.settings?.showHeader !== false,
      analytics: false, // Disable analytics in preview
      preview: true
    });
    
    return `${baseUrl}?${params?.toString()}`;
  };

  const refreshPreview = () => {
    setIsLoading(true);
    if (iframeRef?.current) {
      iframeRef.current.src = generatePreviewUrl();
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [widget]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
          <Button variant="outline" size="sm" onClick={refreshPreview}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>
      {/* Device Selector */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`p-2 rounded-md ${
              device === 'desktop' ?'bg-blue-100 text-blue-600' :'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => onDeviceChange('tablet')}
            className={`p-2 rounded-md ${
              device === 'tablet' 
                ? 'bg-blue-100 text-blue-600' :'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`p-2 rounded-md ${
              device === 'mobile' ?'bg-blue-100 text-blue-600' :'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Smartphone size={16} />
          </button>
        </div>
      </div>
      {/* Preview Container */}
      <div className="p-4">
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
          <div 
            className="mx-auto bg-white rounded-lg shadow-sm"
            style={{
              width: deviceDimensions?.[device]?.width,
              maxWidth: deviceDimensions?.[device]?.maxWidth,
              minHeight: deviceDimensions?.[device]?.height,
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={generatePreviewUrl()}
              className="w-full h-full border-none rounded-lg"
              style={{ 
                minHeight: deviceDimensions?.[device]?.height,
                display: isLoading ? 'none' : 'block'
              }}
              onLoad={() => setIsLoading(false)}
              title="Widget Preview"
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Notes</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• This is a live preview of your widget</li>
            <li>• Analytics tracking is disabled in preview mode</li>
            <li>• Changes to theme and settings update automatically</li>
            <li>• Test bookings will not be saved</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;