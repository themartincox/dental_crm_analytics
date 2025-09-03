import React, { useState } from 'react';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';
        import Select from '../../../components/ui/Select';
        import Icon from '../../../components/AppIcon';
        import { cn } from '../../../utils/cn';
        import { format } from 'date-fns';

        const LeadProfile = ({ lead, onClose }) => {
          const [activeTab, setActiveTab] = useState('details');
          const [isEditing, setIsEditing] = useState(false);

          const tabs = [
            { id: 'details', label: 'Lead Details', icon: 'User' },
            { id: 'qualification', label: 'Qualification', icon: 'CheckSquare' },
            { id: 'communication', label: 'Communication History', icon: 'MessageSquare' },
            { id: 'timeline', label: 'Activity Timeline', icon: 'Clock' },
            { id: 'notes', label: 'Notes & Follow-up', icon: 'FileText' }
          ];

          const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
              return format(new Date(dateString), 'MMMM dd, yyyy \'at\' HH:mm');
            } catch {
              return 'N/A';
            }
          };

          // Mock communication history
          const communicationHistory = [
            {
              id: 1,
              date: '2024-12-30',
              type: 'email',
              subject: 'Follow-up on Treatment Inquiry',
              content: 'Thank you for your interest in our orthodontic services. I wanted to follow up on your inquiry about Invisalign treatment.',
              status: 'sent',
              direction: 'outbound'
            },
            {
              id: 2,
              date: '2024-12-29',
              type: 'phone',
              subject: 'Initial Consultation Call',
              content: 'Spoke with lead about treatment options and availability. Very interested in proceeding.',
              status: 'completed',
              direction: 'outbound'
            },
            {
              id: 3,
              date: '2024-12-28',
              type: 'form',
              subject: 'Website Contact Form Submission',
              content: 'Lead submitted contact form expressing interest in orthodontic treatment.',
              status: 'received',
              direction: 'inbound'
            }
          ];

          // Mock activity timeline
          const activityTimeline = [
            {
              id: 1,
              date: '2024-12-30',
              action: 'Status Changed',
              description: 'Lead status updated from "Contacted" to "Qualified"',
              user: 'Dr. Smith'
            },
            {
              id: 2,
              date: '2024-12-29',
              action: 'Phone Call',
              description: 'Completed initial consultation call - 15 minutes',
              user: 'Dr. Smith'
            },
            {
              id: 3,
              date: '2024-12-28',
              action: 'Lead Created',
              description: 'New lead created from website contact form',
              user: 'System'
            }
          ];

          const qualificationCriteria = [
            { label: 'Budget Match', score: 90, description: 'Budget aligns with treatment cost' },
            { label: 'Timeline Fit', score: 85, description: 'Timeline matches availability' },
            { label: 'Treatment Need', score: 95, description: 'Clear treatment requirement identified' },
            { label: 'Decision Authority', score: 80, description: 'Has authority to make decisions' },
            { label: 'Engagement Level', score: 88, description: 'High engagement in conversations' }
          ];

          const getPriorityColor = (priority) => {
            switch (priority) {
              case 'high':
                return 'text-error bg-error/10';
              case 'medium':
                return 'text-warning bg-warning/10';
              case 'low':
                return 'text-success bg-success/10';
              default:
                return 'text-muted-foreground bg-muted/10';
            }
          };

          const renderTabContent = () => {
            switch (activeTab) {
              case 'details':
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Full Name
                        </label>
                        <Input 
                          value={lead?.name} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Email Address
                        </label>
                        <Input 
                          value={lead?.email} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Phone Number
                        </label>
                        <Input 
                          value={lead?.phone} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Lead Source
                        </label>
                        <Select
                          value={lead?.source}
                          disabled={!isEditing}
                          options={[
                            { value: 'website', label: 'Website' },
                            { value: 'referral', label: 'Referral' },
                            { value: 'social_media', label: 'Social Media' },
                            { value: 'google_ads', label: 'Google Ads' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Treatment Interest
                        </label>
                        <Select
                          value={lead?.treatmentInterest}
                          disabled={!isEditing}
                          options={[
                            { value: 'orthodontics', label: 'Orthodontics' },
                            { value: 'implants', label: 'Implants' },
                            { value: 'cosmetic', label: 'Cosmetic' },
                            { value: 'general', label: 'General' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Priority Level
                        </label>
                        <Select
                          value={lead?.priority}
                          disabled={!isEditing}
                          options={[
                            { value: 'high', label: 'High Priority' },
                            { value: 'medium', label: 'Medium Priority' },
                            { value: 'low', label: 'Low Priority' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Budget Range
                        </label>
                        <Input 
                          value={lead?.budget} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Timeline
                        </label>
                        <Input 
                          value={lead?.timeline} 
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>
                );

              case 'qualification':
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Qualification Score</h3>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">{lead?.qualificationScore}%</p>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {qualificationCriteria?.map((criteria, index) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{criteria?.label}</h4>
                            <span className="font-bold text-primary">{criteria?.score}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{criteria?.description}</p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                criteria?.score >= 80 ? 'bg-success' :
                                criteria?.score >= 60 ? 'bg-warning' : 'bg-error'
                              }`}
                              style={{ width: `${criteria?.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Qualification Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        This lead shows strong qualification indicators with high budget alignment and clear treatment needs. 
                        Recommend prioritizing for immediate consultation scheduling.
                      </p>
                    </div>
                  </div>
                );

              case 'communication':
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Communication History</h3>
                      <Button size="sm" iconName="Plus">
                        New Message
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {communicationHistory?.map((comm) => (
                        <div key={comm?.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Icon 
                                name={comm?.type === 'email' ? 'Mail' : comm?.type === 'phone' ? 'Phone' : 'FileText'} 
                                size={16} 
                                className="text-primary" 
                              />
                              <h4 className="font-medium text-foreground">{comm?.subject}</h4>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                comm?.direction === 'inbound' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                              )}>
                                {comm?.direction}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comm?.date)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comm?.content}</p>
                          <div className="mt-2">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              comm?.status === 'sent' || comm?.status === 'completed' || comm?.status === 'received'
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

              case 'timeline':
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
                    
                    <div className="space-y-4">
                      {activityTimeline?.map((activity, index) => (
                        <div key={activity?.id} className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-foreground">{activity?.action}</h4>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(activity?.date)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{activity?.description}</p>
                            <p className="text-xs text-muted-foreground">by {activity?.user}</p>
                          </div>
                          {index < activityTimeline?.length - 1 && (
                            <div className="absolute left-4 top-8 w-px h-8 bg-border ml-4"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'notes':
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Lead Notes
                      </label>
                      <textarea 
                        value={lead?.notes}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Next Action Required
                      </label>
                      <Input 
                        value={lead?.nextAction} 
                        disabled={!isEditing}
                        className="bg-background"
                      />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3">Follow-up Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Next Follow-up:</span>
                          <span className="text-sm font-medium text-foreground">Jan 5, 2024</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Reminder Set:</span>
                          <span className="text-sm font-medium text-foreground">Yes</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Auto-sequence:</span>
                          <span className="text-sm font-medium text-foreground">Active</span>
                        </div>
                      </div>
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
                      <h2 className="text-xl font-semibold text-foreground">{lead?.name}</h2>
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                          getPriorityColor(lead?.priority)
                        )}>
                          {lead?.priority} Priority
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Score: {lead?.qualificationScore}%
                        </span>
                      </div>
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

        export default LeadProfile;