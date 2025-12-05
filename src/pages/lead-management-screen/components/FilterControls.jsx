import React from 'react';
        import Select from '../../../components/ui/Select';
        import Button from '../../../components/ui/Button';

        const FilterControls = ({ filters, onFiltersChange }) => {
          const handleFilterChange = (key, value) => {
            onFiltersChange?.({
              .filters,
              [key]: value
            });
          };

          const clearAllFilters = () => {
            onFiltersChange?.({
              source: 'all',
              status: 'all',
              assignee: 'all',
              priority: 'all'
            });
          };

          const hasActiveFilters = filters?.source !== 'all' || 
            filters?.status !== 'all' || 
            filters?.assignee !== 'all' || 
            filters?.priority !== 'all';

          const sourceOptions = [
            { value: 'all', label: 'All Sources' },
            { value: 'website', label: 'Website' },
            { value: 'referral', label: 'Referral' },
            { value: 'social_media', label: 'Social Media' },
            { value: 'google_ads', label: 'Google Ads' }
          ];

          const statusOptions = [
            { value: 'all', label: 'All Status' },
            { value: 'inquiry', label: 'New Inquiry' },
            { value: 'contacted', label: 'Contacted' },
            { value: 'qualified', label: 'Qualified' },
            { value: 'consultation', label: 'Consultation Scheduled' },
            { value: 'converted', label: 'Converted' }
          ];

          const assigneeOptions = [
            { value: 'all', label: 'All Team Members' },
            { value: 'Dr. Smith', label: 'Dr. Smith' },
            { value: 'Dr. Johnson', label: 'Dr. Johnson' },
            { value: 'Unassigned', label: 'Unassigned' }
          ];

          const priorityOptions = [
            { value: 'all', label: 'All Priorities' },
            { value: 'high', label: 'High Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'low', label: 'Low Priority' }
          ];

          return (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Filter Leads</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    iconName="X"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  placeholder="Lead Source"
                  value={filters?.source}
                  onChange={(value) => handleFilterChange('source', value)}
                  options={sourceOptions}
                  clearable
                />
                <Select
                  placeholder="Pipeline Stage"
                  value={filters?.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={statusOptions}
                  clearable
                />
                <Select
                  placeholder="Assigned To"
                  value={filters?.assignee}
                  onChange={(value) => handleFilterChange('assignee', value)}
                  options={assigneeOptions}
                  clearable
                />
                <Select
                  placeholder="Priority Level"
                  value={filters?.priority}
                  onChange={(value) => handleFilterChange('priority', value)}
                  options={priorityOptions}
                  clearable
                />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="Plus">
                    Create Segment
                  </Button>
                  <Button variant="outline" size="sm" iconName="Save">
                    Save Filter
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="FileDown">
                    Export Leads
                  </Button>
                  <Button variant="outline" size="sm" iconName="Mail">
                    Bulk Email
                  </Button>
                </div>
              </div>
            </div>
          );
        };

        export default FilterControls;