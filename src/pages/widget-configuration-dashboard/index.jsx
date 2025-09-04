import React, { useState, useEffect } from 'react';
import { Settings, Plus, Copy, Edit3, Trash2, ExternalLink, Activity, BarChart3, Users, CreditCard } from 'lucide-react';
import Button from '../../components/ui/Button';


import WidgetPreview from './components/WidgetPreview';
import ThemeCustomizer from './components/ThemeCustomizer';
import DeploymentAnalytics from './components/DeploymentAnalytics';
import IntegrationGuide from './components/IntegrationGuide';
import WidgetBuilder from './components/WidgetBuilder';

const WidgetConfigurationDashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [showIntegrationGuide, setShowIntegrationGuide] = useState(false);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    // Mock API call - replace with actual API
    const mockWidgets = [
      {
        id: 'widget-1',
        name: 'Main Website Widget',
        practiceId: 'practice-1',
        status: 'active',
        deploymentUrl: 'https://centraldental.co.uk',
        createdAt: new Date('2024-01-15'),
        lastModified: new Date('2024-02-28'),
        theme: {
          primaryColor: '#0066cc',
          secondaryColor: '#004499',
          backgroundColor: '#ffffff',
          borderRadius: '8px'
        },
        settings: {
          allowedServices: ['consultation', 'cleaning'],
          autoResize: true,
          showHeader: true,
          enableAnalytics: true
        },
        analytics: {
          views: 1247,
          bookings: 89,
          conversionRate: 7.1,
          avgSessionTime: '3:24'
        }
      },
      {
        id: 'widget-2',
        name: 'Emergency Page Widget',
        practiceId: 'practice-1',
        status: 'testing',
        deploymentUrl: 'https://centraldental.co.uk/emergency',
        createdAt: new Date('2024-02-20'),
        lastModified: new Date('2024-03-01'),
        theme: {
          primaryColor: '#dc2626',
          secondaryColor: '#b91c1c',
          backgroundColor: '#fef2f2',
          borderRadius: '12px'
        },
        settings: {
          allowedServices: ['emergency'],
          autoResize: true,
          showHeader: false,
          enableAnalytics: true
        },
        analytics: {
          views: 234,
          bookings: 34,
          conversionRate: 14.5,
          avgSessionTime: '2:15'
        }
      }
    ];
    
    setWidgets(mockWidgets);
  };

  const createNewWidget = () => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      name: 'New Widget',
      practiceId: 'practice-1',
      status: 'draft',
      deploymentUrl: '',
      theme: {
        primaryColor: '#0066cc',
        secondaryColor: '#004499',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      settings: {
        allowedServices: [],
        autoResize: true,
        showHeader: true,
        enableAnalytics: true,
        showGDCInfo: false,
        allowedOrigins: ['*'],
        language: 'en',
        customCSS: ''
      },
      analytics: {
        views: 0,
        bookings: 0,
        conversionRate: 0,
        avgSessionTime: '0:00'
      }
    };
    
    setSelectedWidget(newWidget);
    setIsCreating(true);
    setActiveTab('builder');
  };

  const saveWidget = async (widgetData) => {
    try {
      if (isCreating) {
        setWidgets(prev => [...prev, { ...widgetData, createdAt: new Date() }]);
      } else {
        setWidgets(prev => prev?.map(w => 
          w?.id === widgetData?.id 
            ? { ...widgetData, lastModified: new Date() }
            : w
        ));
      }
      setIsCreating(false);
      setActiveTab('overview');
    } catch (error) {
      console.error('Failed to save widget:', error);
    }
  };

  const deleteWidget = async (widgetId) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      setWidgets(prev => prev?.filter(w => w?.id !== widgetId));
      if (selectedWidget?.id === widgetId) {
        setSelectedWidget(null);
      }
    }
  };

  const copyEmbedCode = (widget) => {
    const embedCode = generateEmbedCode(widget);
    navigator.clipboard?.writeText(embedCode);
    // Show success notification
  };

  const generateEmbedCode = (widget) => {
    const baseUrl = window.location?.origin;
    const widgetUrl = `${baseUrl}/embeddable-booking-widget`;
    
    const config = {
      practiceId: widget?.practiceId,
      theme: widget?.theme,
      services: widget?.settings?.allowedServices?.join(','),
      autoResize: widget?.settings?.autoResize,
      showHeader: widget?.settings?.showHeader,
      showGDCInfo: widget?.settings?.showGDCInfo,
      analytics: widget?.settings?.enableAnalytics
    };

    const queryString = Object.entries(config)?.filter(([_, value]) => value !== undefined && value !== null)?.map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${key}=${encodeURIComponent(value)}`;
      })?.join('&');

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
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widget Overview</h2>
          <p className="text-gray-600">Manage your booking widgets across different sites</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowIntegrationGuide(true)}>
            <ExternalLink size={16} />
            Integration Guide
          </Button>
          <Button onClick={createNewWidget}>
            <Plus size={16} />
            Create Widget
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Widgets</p>
              <p className="text-2xl font-bold text-gray-900">{widgets?.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Deployments</p>
              <p className="text-2xl font-bold text-gray-900">
                {widgets?.filter(w => w?.status === 'active')?.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {widgets?.reduce((sum, w) => sum + (w?.analytics?.bookings || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {(widgets?.reduce((sum, w) => sum + (w?.analytics?.conversionRate || 0), 0) / widgets?.length || 0)?.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Widget Deployments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Widget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deployment URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {widgets?.map((widget) => (
                <tr key={widget?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{widget?.name}</div>
                      <div className="text-sm text-gray-500">ID: {widget?.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      widget?.status === 'active' ?'bg-green-100 text-green-800'
                        : widget?.status === 'testing' ?'bg-yellow-100 text-yellow-800' :'bg-gray-100 text-gray-800'
                    }`}>
                      {widget?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {widget?.deploymentUrl ? (
                      <a 
                        href={widget?.deploymentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {widget?.deploymentUrl}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      'Not deployed'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users size={12} />
                        <span>{widget?.analytics?.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={12} />
                        <span>{widget?.analytics?.bookings || 0} bookings</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWidget(widget);
                          setIsCreating(false);
                          setActiveTab('builder');
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => copyEmbedCode(widget)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Copy embed code"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => deleteWidget(widget?.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSelectedWidget = () => {
    if (!selectedWidget) return null;

    return (
      <div className="grid grid-cols-12 gap-6">
        {/* Main Configuration */}
        <div className="col-span-8">
          {activeTab === 'builder' && (
            <WidgetBuilder
              key={selectedWidget?.id} // Force re-render when widget changes
              widget={selectedWidget}
              onSave={saveWidget}
              onCancel={() => {
                setSelectedWidget(null);
                setIsCreating(false);
                setActiveTab('overview');
              }}
            />
          )}
          
          {activeTab === 'theme' && (
            <ThemeCustomizer
              widget={selectedWidget}
              onUpdate={(updatedWidget) => setSelectedWidget(updatedWidget)}
            />
          )}
          
          {activeTab === 'analytics' && (
            <DeploymentAnalytics widget={selectedWidget} />
          )}
        </div>

        {/* Preview Panel */}
        <div className="col-span-4">
          <div className="sticky top-6">
            <WidgetPreview
              widget={selectedWidget}
              device={previewDevice}
              onDeviceChange={setPreviewDevice}
            />
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    ...(selectedWidget ? [
      { id: 'builder', label: 'Builder', icon: Settings },
      { id: 'theme', label: 'Theme', icon: Edit3 },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab?.id
                    ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab?.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? renderOverview() : renderSelectedWidget()}

        {/* Integration Guide Modal */}
        {showIntegrationGuide && (
          <IntegrationGuide 
            onClose={() => setShowIntegrationGuide(false)}
            widgets={widgets}
          />
        )}
      </div>
    </div>
  );
};

export default WidgetConfigurationDashboard;