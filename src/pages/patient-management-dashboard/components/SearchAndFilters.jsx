import React from 'react';
        import Input from '../../../components/ui/Input';
        import Select from '../../../components/ui/Select';
        import Button from '../../../components/ui/Button';
        import Icon from '../../../components/AppIcon';

        const SearchAndFilters = ({
          searchQuery,
          onSearchChange,
          filters,
          onFiltersChange,
          statusOptions,
          treatmentOptions,
          insuranceOptions
        }) => {
          const handleFilterChange = (key, value) => {
            onFiltersChange?.({
              ...filters,
              [key]: value
            });
          };

          const clearAllFilters = () => {
            onSearchChange?.('');
            onFiltersChange?.({
              status: 'all',
              treatmentType: 'all',
              insuranceProvider: 'all',
              lastVisit: 'all'
            });
          };

          const hasActiveFilters = searchQuery || 
            filters?.status !== 'all' || 
            filters?.treatmentType !== 'all' || 
            filters?.insuranceProvider !== 'all';

          return (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Search & Filter</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    iconName="X"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e?.target?.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => onSearchChange?.('')}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  )}
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    placeholder="Patient Status"
                    value={filters?.status}
                    onChange={(value) => handleFilterChange('status', value)}
                    options={statusOptions}
                    clearable
                  />
                  <Select
                    placeholder="Treatment Type"
                    value={filters?.treatmentType}
                    onChange={(value) => handleFilterChange('treatmentType', value)}
                    options={treatmentOptions}
                    clearable
                  />
                  <Select
                    placeholder="Insurance Provider"
                    value={filters?.insuranceProvider}
                    onChange={(value) => handleFilterChange('insuranceProvider', value)}
                    options={insuranceOptions}
                    clearable
                  />
                  <Select
                    placeholder="Last Visit"
                    value={filters?.lastVisit}
                    onChange={(value) => handleFilterChange('lastVisit', value)}
                    options={[
                      { value: 'all', label: 'Any time' },
                      { value: '7d', label: 'Last 7 days' },
                      { value: '30d', label: 'Last 30 days' },
                      { value: '90d', label: 'Last 90 days' },
                      { value: '1y', label: 'Last year' }
                    ]}
                    clearable
                  />
                </div>

                {/* Advanced Search Options */}
                <div className="flex items-center space-x-4 pt-2">
                  <Button variant="outline" size="sm" iconName="Filter">
                    Advanced Filters
                  </Button>
                  <Button variant="outline" size="sm" iconName="Download">
                    Save Filter
                  </Button>
                  <div className="flex-1"></div>
                  <div className="text-sm text-muted-foreground">
                    <Icon name="Info" size={14} className="inline mr-1" />
                    Use autocomplete for faster search
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default SearchAndFilters;