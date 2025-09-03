import React, { useState } from 'react';
        import Button from '../../../components/ui/Button';
        import Select from '../../../components/ui/Select';
        import Icon from '../../../components/AppIcon';

        const BulkActions = ({ selectedCount, onClearSelection }) => {
          const [selectedAction, setSelectedAction] = useState('');

          const actionOptions = [
            { value: '', label: 'Choose action...' },
            { value: 'send_email', label: 'Send Email' },
            { value: 'send_sms', label: 'Send SMS' },
            { value: 'schedule_appointment', label: 'Schedule Appointment' },
            { value: 'update_status', label: 'Update Status' },
            { value: 'export_data', label: 'Export Data' },
            { value: 'delete', label: 'Delete Patients' }
          ];

          const handleExecuteAction = () => {
            if (!selectedAction) return;
            
            console.log(`Executing ${selectedAction} for ${selectedCount} patients`);
            
            // Here you would implement the actual bulk action logic
            switch (selectedAction) {
              case 'send_email': console.log('Opening email composer...');
                break;
              case 'send_sms': console.log('Opening SMS composer...');
                break;
              case 'schedule_appointment': console.log('Opening appointment scheduler...');
                break;
              case 'update_status': console.log('Opening status update modal...');
                break;
              case 'export_data':
                console.log('Exporting selected patient data...');
                break;
              case 'delete':
                console.log('Confirming deletion...');
                break;
              default:
                break;
            }
            
            // Reset selection after action
            setSelectedAction('');
          };

          return (
            <div className="bg-primary/5 border-l-4 border-l-primary rounded-r-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Icon name="CheckCircle" size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedCount} patient{selectedCount > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Choose an action to apply to selected patients
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Select
                    placeholder="Select action"
                    value={selectedAction}
                    onChange={setSelectedAction}
                    options={actionOptions}
                    className="w-48"
                  />
                  
                  <Button
                    onClick={handleExecuteAction}
                    disabled={!selectedAction}
                    size="sm"
                  >
                    Execute
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                    iconName="X"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          );
        };

        export default BulkActions;