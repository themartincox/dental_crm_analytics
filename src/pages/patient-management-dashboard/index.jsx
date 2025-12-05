import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import PatientCard from './components/PatientCard';
import PatientProfile from './components/PatientProfile';
import SearchAndFilters from './components/SearchAndFilters';
import PatientStats from './components/PatientStats';
import BulkActions from './components/BulkActions';
import { usePatients, usePatientStats } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';

const PatientManagementDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    treatmentType: 'all',
    insuranceProvider: 'all',
    lastVisit: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch patients with filters
  const patientFilters = {
    ...filters,
    search: searchQuery,
    sortBy: sortConfig?.key,
    sortDirection: sortConfig?.direction
  };

  const { data: patients, loading: patientsLoading, mutate: refetchPatients, error } = useApi({
    endpoint: `/patients`,
    method: 'GET',
    params: { ...patientFilters }
  });
  const { data: patientStats, loading: statsLoading } = usePatientStats();

  const isLoading = authLoading || patientsLoading || statsLoading;

  // Filter and search patients (additional client-side filtering if needed)
  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = searchQuery ? (
      patient?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      patient?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      patient?.phone?.includes(searchQuery)
    ) : true;

    return matchesSearch;
  }) || [];

  // Sort patients (if additional sorting is needed)
  const sortedPatients = [...filteredPatients]?.sort((a, b) => {
    const aVal = a?.[sortConfig?.key];
    const bVal = b?.[sortConfig?.key];

    if (sortConfig?.direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Paginate patients
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = sortedPatients?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((sortedPatients?.length || 0) / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev =>
      prev?.includes(patientId)
        ? prev?.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients?.length === currentPatients?.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(currentPatients?.map(p => p?.id));
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseProfile = () => {
    setSelectedPatient(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'prospective', label: 'Prospective' }
  ];

  const treatmentOptions = [
    { value: 'all', label: 'All Treatments' },
    { value: 'general', label: 'General' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'implants', label: 'Implants' },
    { value: 'cosmetic', label: 'Cosmetic' }
  ];

  const insuranceOptions = [
    { value: 'all', label: 'All Insurance' },
    { value: 'NHS', label: 'NHS' },
    { value: 'Bupa', label: 'Bupa' },
    { value: 'Denplan', label: 'Denplan' },
    { value: 'Private', label: 'Private' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading patient data.</span>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required message for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access patient management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Data</h2>
              <p className="text-muted-foreground mb-6">
                {error?.message || 'Unable to load patient data. Please try again.'}
              </p>
              <Button onClick={() => refetchPatients()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Patient Management Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive patient data administration and treatment tracking
            </p>
          </div>
          <Button iconName="UserPlus" className="bg-primary hover:bg-primary/90">
            Add New Patient
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content Area - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            {/* Search and Filters */}
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              statusOptions={statusOptions}
              treatmentOptions={treatmentOptions}
              insuranceOptions={insuranceOptions}
            />

            {/* Bulk Actions */}
            {selectedPatients?.length > 0 && (
              <BulkActions
                selectedCount={selectedPatients?.length}
                onClearSelection={() => setSelectedPatients([])}
              />
            )}

            {/* Patient List Header */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients?.length === currentPatients?.length && currentPatients?.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {filteredPatients?.length} patients
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" iconName="Download">
                      Export
                    </Button>
                    <Button variant="outline" size="sm" iconName="Filter">
                      Advanced Filters
                    </Button>
                    <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => refetchPatients()}>
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
                <div className="col-span-1"></div>
                <div
                  className="col-span-3 cursor-pointer flex items-center space-x-1"
                  onClick={() => handleSort('name')}
                >
                  <span>Name</span>
                  <Icon name="ArrowUpDown" size={12} />
                </div>
                <div className="col-span-2">Contact Info</div>
                <div
                  className="col-span-2 cursor-pointer flex items-center space-x-1"
                  onClick={() => handleSort('lastVisit')}
                >
                  <span>Last Visit</span>
                  <Icon name="ArrowUpDown" size={12} />
                </div>
                <div className="col-span-2">Treatment Status</div>
                <div
                  className="col-span-1 cursor-pointer flex items-center space-x-1"
                  onClick={() => handleSort('outstandingBalance')}
                >
                  <span>Balance</span>
                  <Icon name="ArrowUpDown" size={12} />
                </div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Patient List */}
              <div className="divide-y divide-border">
                {currentPatients?.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No patients found matching your criteria.</p>
                  </div>
                ) : (
                  currentPatients?.map((patient) => (
                    <PatientCard
                      key={patient?.id}
                      patient={patient}
                      isSelected={selectedPatients?.includes(patient?.id)}
                      onSelect={() => handleSelectPatient(patient?.id)}
                      onClick={() => handlePatientClick(patient)}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedPatients?.length)} of {sortedPatients?.length}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="xl:col-span-1 space-y-6">
            <PatientStats patients={filteredPatients} stats={patientStats} />

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">New patient registered</p>
                    <p className="text-xs text-muted-foreground">Sarah Johnson - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Payment overdue</p>
                    <p className="text-xs text-muted-foreground">James Thompson - 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Treatment completed</p>
                    <p className="text-xs text-muted-foreground">Emma Wilson - 2 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Birthday Reminders */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Birthdays</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon name="Gift" size={16} className="text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Lisa Davis</p>
                    <p className="text-xs text-muted-foreground">Dec 12, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Gift" size={16} className="text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Michael Brown</p>
                    <p className="text-xs text-muted-foreground">Jan 8, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Profile Modal */}
        {selectedPatient && (
          <PatientProfile
            patient={selectedPatient}
            onClose={handleCloseProfile}
          />
        )}
      </main>
    </div>
  );
};

export default PatientManagementDashboard;