import React, { useState } from 'react';
import { Clock, TrendingUp, Star, Search } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ServiceSelection = ({ services = [], selectedService, onServiceSelect, compact = false }) => {
  const [hoveredService, setHoveredService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins} mins`;
  };

  // Service category icons mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      preventive: '🦷',
      cosmetic: '✨',
      restorative: '🔧',
      orthodontic: '📏',
      surgical: '🔬',
      pediatric: '👶',
      emergency: '🚨'
    };
    return iconMap?.[category] || '💙';
  };

  // Service image placeholder based on category
  const getServiceImage = (service) => {
    const gradientMap = {
      preventive: 'from-green-100 to-green-200',
      cosmetic: 'from-purple-100 to-purple-200',
      restorative: 'from-blue-100 to-blue-200',
      orthodontic: 'from-orange-100 to-orange-200',
      surgical: 'from-red-100 to-red-200',
      pediatric: 'from-pink-100 to-pink-200',
      emergency: 'from-yellow-100 to-yellow-200'
    };
    return gradientMap?.[service?.category] || 'from-gray-100 to-gray-200';
  };

  const categories = [
    { id: 'all', name: 'All Services', color: 'bg-gray-100 text-gray-800' },
    { id: 'preventive', name: 'Preventive Care', color: 'bg-green-100 text-green-800' },
    { id: 'cosmetic', name: 'Cosmetic', color: 'bg-purple-100 text-purple-800' },
    { id: 'restorative', name: 'Restorative', color: 'bg-blue-100 text-blue-800' },
    { id: 'orthodontic', name: 'Orthodontic', color: 'bg-orange-100 text-orange-800' },
    { id: 'surgical', name: 'Surgical', color: 'bg-red-100 text-red-800' },
    { id: 'pediatric', name: 'Pediatric', color: 'bg-pink-100 text-pink-800' },
    { id: 'emergency', name: 'Emergency', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const filteredServices = services?.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service?.category === selectedCategory;
    const matchesSearch = service?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         service?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularServices = services?.filter(s => s?.popular);

  if (compact) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Select Your Treatment
          </h2>
          <p className="text-gray-600">
            Choose the dental service you need from our comprehensive treatment options
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search treatments."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories?.slice(0, 5)?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`px-4 py-2 text-sm rounded-full transition-all ${
                selectedCategory === category?.id
                  ? category?.color + ' font-medium shadow-sm' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category?.name}
            </button>
          ))}
        </div>

        {/* Popular Services First (if no search/filter) */}
        {selectedCategory === 'all' && !searchTerm && popularServices?.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Most Popular Treatments</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularServices?.slice(0, 4)?.map((service) => (
                <div
                  key={service?.id}
                  className={`relative bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    selectedService?.id === service?.id
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md' :'border-gray-200 hover:border-primary/50 hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                  onClick={() => onServiceSelect?.(service)}
                >
                  <div className="flex items-start gap-4">
                    {/* Service Image */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${getServiceImage(service)} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                      {getCategoryIcon(service?.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-base leading-tight">
                          {service?.name}
                        </h4>
                        <TrendingUp size={16} className="text-yellow-500 ml-2 flex-shrink-0" />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service?.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{formatDuration(service?.duration)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            from £{service?.priceFrom}
                          </div>
                          <div className="text-xs text-gray-500">per session</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Popular badge */}
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Popular
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredServices?.map((service) => (
            <div
              key={service?.id}
              className={`relative bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                selectedService?.id === service?.id
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md' :'border-gray-200 hover:border-primary/50 hover:shadow-lg transform hover:-translate-y-1'
              }`}
              onClick={() => onServiceSelect?.(service)}
            >
              <div className="flex items-start gap-4">
                {/* Service Image */}
                <div className={`w-16 h-16 bg-gradient-to-br ${getServiceImage(service)} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
                  {getCategoryIcon(service?.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 leading-tight">
                      {service?.name}
                    </h4>
                    {service?.popular && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {service?.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={12} />
                      <span>{formatDuration(service?.duration)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        £{service?.priceFrom}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedService?.id === service?.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-xl"></div>
              )}
            </div>
          ))}
        </div>

        {filteredServices?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg mb-2">No treatments found</p>
            <p className="text-sm">Try adjusting your search or category filter</p>
          </div>
        )}

        {/* Quick Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Need Help Choosing?</h4>
              <p className="text-sm text-blue-800 mb-3">
                Our dental experts can help you select the right treatment during your consultation.
              </p>
              <button className="text-sm text-blue-700 underline hover:text-blue-800">
                Call us: +44 20 7123 4567
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Treatment
        </h2>
        <p className="text-gray-600">
          Choose the dental service you need. All treatments include consultation and aftercare advice.
        </p>
      </div>
      {/* Search and Category Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search treatments."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`px-4 py-2 text-sm rounded-full transition-all ${
                selectedCategory === category?.id
                  ? category?.color + 'font-medium' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category?.name} ({services?.filter(s => category?.id === 'all' || s?.category === category?.id)?.length})
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices?.map((service) => (
          <div
            key={service?.id}
            className={`relative bg-white border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedService?.id === service?.id
                ? 'border-primary ring-2 ring-primary/20'
                : hoveredService === service?.id
                ? 'border-primary/50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onServiceSelect?.(service)}
            onMouseEnter={() => setHoveredService(service?.id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {/* Popular Badge */}
            {service?.popular && (
              <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} />
                Popular
              </div>
            )}

            {/* Service Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-primary/60 text-4xl">
                {service?.name?.charAt(0)}
              </div>
            </div>

            {/* Service Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {service?.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service?.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{formatDuration(service?.duration)}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    from £{service?.priceFrom}
                  </div>
                  <div className="text-xs text-gray-500">per session</div>
                </div>
              </div>

              {/* Selection indicator */}
              <div className={`transition-all duration-200 ${
                selectedService?.id === service?.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="w-full h-1 bg-primary rounded-full mt-3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredServices?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No treatments found matching your criteria.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
      {/* Service Categories Overview */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Treatment Categories Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories?.slice(1)?.map((category) => (
            <div
              key={category?.name}
              className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSelectedCategory(category?.id)}
            >
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${category?.color} mb-2`}>
                {services?.filter(s => s?.category === category?.id)?.length} Services
              </div>
              <div className="text-sm font-medium text-gray-700">
                {category?.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Call to action for questions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-3">
          Not sure which treatment you need? Our team can help you choose during your consultation.
        </p>
        <Button variant="outline" size="sm">
          Call us: +44 20 7123 4567
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelection;