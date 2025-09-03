import React, { useState } from 'react';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';
        import Select from '../../../components/ui/Select';
        import Icon from '../../../components/AppIcon';
        import { cn } from '../../../utils/cn';
        import { format } from 'date-fns';

        const PatientProfile = ({ patient, onClose }) => {
          const [activeTab, setActiveTab] = useState('demographics');
          const [isEditing, setIsEditing] = useState(false);

          const tabs = [
            { id: 'demographics', label: 'Demographics', icon: 'User' },
            { id: 'treatment', label: 'Treatment History', icon: 'FileText' },
            { id: 'communication', label: 'Communication', icon: 'MessageSquare' },
            { id: 'insurance', label: 'Insurance', icon: 'Shield' },
            { id: 'payments', label: 'Payment History', icon: 'CreditCard' }
          ];

          const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
              return format(new Date(dateString), 'MMMM dd, yyyy');
            } catch {
              return 'N/A';
            }
          };

          // Mock treatment history
          const treatmentHistory = [
            {
              id: 1,
              date: '2024-12-28',
              treatment: 'Routine Cleaning',
              practitioner: 'Dr. Smith',
              notes: 'Good oral hygiene, no issues found',
              status: 'completed'
            },
            {
              id: 2,
              date: '2024-11-15',
              treatment: 'X-Ray Examination',
              practitioner: 'Dr. Johnson',
              notes: 'Slight buildup on molars, recommend follow-up cleaning',
              status: 'completed'
            },
            {
              id: 3,
              date: '2024-10-05',
              treatment: 'Consultation',
              practitioner: 'Dr. Smith',
              notes: 'Initial consultation for orthodontic treatment',
              status: 'completed'
            }
          ];

          // Mock communication log
          const communicationLog = [
            {
              id: 1,
              date: '2024-12-30',
              type: 'email',
              subject: 'Appointment Reminder',
              content: 'Reminder for upcoming appointment on Jan 15th',
              status: 'sent'
            },
            {
              id: 2,
              date: '2024-12-20',
              type: 'phone',
              subject: 'Follow-up Call',
              content: 'Discussed post-treatment care instructions',
              status: 'completed'
            },
            {
              id: 3,
              date: '2024-11-16',
              type: 'sms',
              subject: 'Treatment Confirmation',
              content: 'Confirmed next appointment scheduling',
              status: 'sent'
            }
          ];

          // Mock payment history
          const paymentHistory = [
            {
              id: 1,
              date: '2024-12-28',
              amount: 150.00,
              method: 'Credit Card',
              description: 'Routine cleaning and examination',
              status: 'paid'
            },
            {
              id: 2,
              date: '2024-11-15',
              amount: 80.00,
              method: 'Insurance',
              description: 'X-Ray examination (partial coverage)',
              status: 'paid'
            },
            {
              id: 3,
              date: '2024-10-05',
              amount: 240.50,
              method: 'Pending',
              description: 'Consultation and treatment plan',
              status: 'pending'
            }
          ];

          const renderTabContent = () => {
            switch (activeTab) {
              case 'demographics':
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Full Name
                        </label>
                        <Input 
                          value={patient?.name} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Date of Birth
                        </label>
                        <Input 
                          value={formatDate(patient?.dateOfBirth)} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Email Address
                        </label>
                        <Input 
                          value={patient?.email} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Phone Number
                        </label>
                        <Input 
                          value={patient?.phone} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Patient Status
                        </label>
                        <Select
                          value={patient?.status}
                          disabled={!isEditing}
                          options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'prospective', label: 'Prospective' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Communication Preference
                        </label>
                        <Select
                          value={patient?.communicationPreference}
                          disabled={!isEditing}
                          options={[
                            { value: 'email', label: 'Email' },
                            { value: 'phone', label: 'Phone' },
                            { value: 'sms', label: 'SMS' }
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Notes
                      </label>
                      <textarea 
                        value={patient?.notes}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                );

              case 'treatment':
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Treatment History</h3>
                      <Button size="sm" iconName="Plus">
                        Add Treatment
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {treatmentHistory?.map((treatment) => (
                        <div key={treatment?.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{treatment?.treatment}</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(treatment?.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Practitioner:</strong> {treatment?.practitioner}
                          </p>
                          <p className="text-sm text-foreground">{treatment?.notes}</p>
                          <div className="mt-2">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              treatment?.status === 'completed' 
                                ? "bg-success/10 text-success" :"bg-warning/10 text-warning"
                            )}>
                              {treatment?.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'communication':
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Communication Log</h3>
                      <Button size="sm" iconName="Plus">
                        New Message
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {communicationLog?.map((comm) => (
                        <div key={comm?.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <Icon 
                              name={comm?.type === 'email' ? 'Mail' : comm?.type === 'phone' ? 'Phone' : 'MessageSquare'} 
                              size={16} 
                              className="text-primary" 
                            />
                            <h4 className="font-medium text-foreground">{comm?.subject}</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comm?.date)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comm?.content}</p>
                          <div className="mt-2">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              comm?.status === 'sent' || comm?.status === 'completed'
                                ? "bg-success/10 text-success" :"bg-warning/10 text-warning"
                            )}>
                              {comm?.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'insurance':
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Insurance Provider
                        </label>
                        <Input 
                          value={patient?.insuranceProvider} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Policy Number
                        </label>
                        <Input 
                          value="POL-789456123" 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Coverage Level
                        </label>
                        <Input 
                          value="Standard" 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Expiry Date
                        </label>
                        <Input 
                          value="December 31, 2024" 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Coverage Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Annual Limit:</span>
                          <span className="ml-2 font-medium text-foreground">£2,500</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Used:</span>
                          <span className="ml-2 font-medium text-foreground">£680</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Remaining:</span>
                          <span className="ml-2 font-medium text-success">£1,820</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Co-pay:</span>
                          <span className="ml-2 font-medium text-foreground">20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              case 'payments':
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-error">
                          Outstanding: £{patient?.outstandingBalance?.toFixed(2)}
                        </span>
                        <Button size="sm" iconName="Plus">
                          Add Payment
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {paymentHistory?.map((payment) => (
                        <div key={payment?.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">
                              £{payment?.amount?.toFixed(2)}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(payment?.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Method:</strong> {payment?.method}
                          </p>
                          <p className="text-sm text-foreground mb-2">{payment?.description}</p>
                          <div>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              payment?.status === 'paid' 
                                ? "bg-success/10 text-success" :"bg-warning/10 text-warning"
                            )}>
                              {payment?.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          };

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{patient?.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Patient ID: {patient?.id?.toString()?.padStart(4, '0')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      iconName={isEditing ? "Save" : "Edit"}
                    >
                      {isEditing ? "Save" : "Edit"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <Icon name="X" size={18} />
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                  <nav className="flex space-x-8 px-6">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={cn(
                          "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                          activeTab === tab?.id
                            ? "border-primary text-primary" :"border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        <Icon name={tab?.icon} size={16} />
                        <span>{tab?.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          );
        };

        export default PatientProfile;