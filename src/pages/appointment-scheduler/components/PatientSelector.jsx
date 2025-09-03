import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const PatientSelector = ({ onSelect, onClose, selectedPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock patient data
  const mockPatients = [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+44 7700 900123',
      lastVisit: '2024-12-28',
      status: 'active'
    },
    {
      id: 'P002',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+44 7700 900456',
      lastVisit: '2024-12-20',
      status: 'active'
    },
    {
      id: 'P003',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '+44 7700 900789',
      lastVisit: '2024-11-15',
      status: 'inactive'
    },
    {
      id: 'P004',
      name: 'James Thompson',
      email: 'james.thompson@email.com',
      phone: '+44 7700 900012',
      lastVisit: '2024-12-30',
      status: 'active'
    },
    {
      id: 'P005',
      name: 'Lisa Davis',
      email: 'lisa.davis@email.com',
      phone: '+44 7700 900345',
      lastVisit: '2024-12-22',
      status: 'prospective'
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (searchQuery?.trim()) {
      const filtered = patients?.filter(patient =>
        patient?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        patient?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        patient?.phone?.includes(searchQuery) ||
        patient?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const handlePatientSelect = (patient) => {
    onSelect?.(patient);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-muted-foreground';
      case 'prospective': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'inactive': return 'bg-muted/30';
      case 'prospective': return 'bg-primary/10';
      default: return 'bg-muted/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Select Patient</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              placeholder="Search by name, email, phone, or ID..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading patients...</span>
              </div>
            </div>
          ) : filteredPatients?.length > 0 ? (
            <div className="space-y-3">
              {filteredPatients?.map((patient) => (
                <div
                  key={patient?.id}
                  className={`p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedPatient?.id === patient?.id ? 'bg-primary/10 border-primary/20' : ''
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="User" size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{patient?.name}</h3>
                          <p className="text-sm text-muted-foreground">ID: {patient?.id}</p>
                        </div>
                      </div>

                      <div className="ml-13 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Icon name="Mail" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">{patient?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="Phone" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">{patient?.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="Calendar" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">Last visit: {patient?.lastVisit}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(patient?.status)} ${getStatusColor(patient?.status)}`}>
                      {patient?.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="UserX" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No patients found matching your search' : 'No patients available'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-3"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button iconName="UserPlus">
              Add New Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSelector;