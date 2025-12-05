import React, { useState, useEffect } from 'react';
        import Header from '../../components/ui/Header';
        import Button from '../../components/ui/Button';
        import Icon from '../../components/AppIcon';
        import LeadCard from './components/LeadCard';
        import LeadProfile from './components/LeadProfile';
        import FilterControls from './components/FilterControls';
        import LeadMetrics from './components/LeadMetrics';
        import TeamPerformance from './components/TeamPerformance';
        import { cn } from '../../utils/cn';

        const LeadManagementScreen = () => {
          const [leads, setLeads] = useState([]);
          const [selectedLead, setSelectedLead] = useState(null);
          const [isLoading, setIsLoading] = useState(true);
          const [filters, setFilters] = useState({
            source: 'all',
            status: 'all',
            assignee: 'all',
            priority: 'all'
          });
          const [draggedLead, setDraggedLead] = useState(null);

          // Lead stages for Kanban
          const leadStages = [
            { id: 'inquiry', label: 'New Inquiry', color: 'bg-blue-100 border-blue-200' },
            { id: 'contacted', label: 'Contacted', color: 'bg-yellow-100 border-yellow-200' },
            { id: 'qualified', label: 'Qualified', color: 'bg-orange-100 border-orange-200' },
            { id: 'consultation', label: 'Consultation Scheduled', color: 'bg-purple-100 border-purple-200' },
            { id: 'converted', label: 'Converted', color: 'bg-green-100 border-green-200' }
          ];

          // Mock lead data
          const mockLeads = [
            {
              id: 1,
              name: 'Jennifer Adams',
              email: 'jennifer.adams@email.com',
              phone: '+44 7700 900111',
              source: 'website',
              status: 'inquiry',
              priority: 'high',
              qualificationScore: 85,
              treatmentInterest: 'orthodontics',
              assignedTo: 'Dr. Smith',
              createdAt: '2024-12-30',
              lastContact: null,
              nextAction: 'Initial call',
              notes: 'Interested in Invisalign treatment, requested consultation',
              budget: '£3000-5000',
              timeline: '3-6 months'
            },
            {
              id: 2,
              name: 'Robert Johnson',
              email: 'robert.johnson@email.com',
              phone: '+44 7700 900222',
              source: 'referral',
              status: 'contacted',
              priority: 'medium',
              qualificationScore: 70,
              treatmentInterest: 'implants',
              assignedTo: 'Dr. Johnson',
              createdAt: '2024-12-28',
              lastContact: '2024-12-30',
              nextAction: 'Send treatment info',
              notes: 'Referred by existing patient, needs single implant',
              budget: '£2000-3000',
              timeline: '1-3 months'
            },
            {
              id: 3,
              name: 'Maria Garcia',
              email: 'maria.garcia@email.com',
              phone: '+44 7700 900333',
              source: 'social_media',
              status: 'qualified',
              priority: 'high',
              qualificationScore: 92,
              treatmentInterest: 'cosmetic',
              assignedTo: 'Dr. Smith',
              createdAt: '2024-12-25',
              lastContact: '2024-12-29',
              nextAction: 'Schedule consultation',
              notes: 'Very motivated, looking for smile makeover',
              budget: '£5000+',
              timeline: 'ASAP'
            },
            {
              id: 4,
              name: 'David Wilson',
              email: 'david.wilson@email.com',
              phone: '+44 7700 900444',
              source: 'google_ads',
              status: 'consultation',
              priority: 'medium',
              qualificationScore: 78,
              treatmentInterest: 'general',
              assignedTo: 'Dr. Johnson',
              createdAt: '2024-12-20',
              lastContact: '2024-12-30',
              nextAction: 'Consultation on Jan 5th',
              notes: 'Scheduled for initial consultation, payment plan discussed',
              budget: '£1000-2000',
              timeline: '6 months'
            },
            {
              id: 5,
              name: 'Sarah Mitchell',
              email: 'sarah.mitchell@email.com',
              phone: '+44 7700 900555',
              source: 'website',
              status: 'converted',
              priority: 'low',
              qualificationScore: 88,
              treatmentInterest: 'orthodontics',
              assignedTo: 'Dr. Smith',
              createdAt: '2024-12-15',
              lastContact: '2024-12-31',
              nextAction: 'Treatment started',
              notes: 'Successfully converted, treatment plan accepted and started',
              budget: '£4000',
              timeline: 'Started'
            }
          ];

          useEffect(() => {
            // Simulate API call
            setTimeout(() => {
              setLeads(mockLeads);
              setIsLoading(false);
            }, 1000);
          }, []);

          // Filter leads
          const filteredLeads = leads?.filter(lead => {
            const matchesSource = filters?.source === 'all' || lead?.source === filters?.source;
            const matchesStatus = filters?.status === 'all' || lead?.status === filters?.status;
            const matchesAssignee = filters?.assignee === 'all' || lead?.assignedTo === filters?.assignee;
            const matchesPriority = filters?.priority === 'all' || lead?.priority === filters?.priority;
            
            return matchesSource && matchesStatus && matchesAssignee && matchesPriority;
          });

          // Group leads by stage
          const leadsByStage = leadStages?.reduce((acc, stage) => {
            acc[stage?.id] = filteredLeads?.filter(lead => lead?.status === stage?.id);
            return acc;
          }, {});

          const handleDragStart = (e, lead) => {
            setDraggedLead(lead);
            if (e && e?.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
            }
          };

          const handleDragOver = (e) => {
            e?.preventDefault();
            if (e && e?.dataTransfer) {
              e.dataTransfer.dropEffect = 'move';
            }
          };

          const handleDrop = (e, newStatus) => {
            e?.preventDefault();
            if (draggedLead) {
              // Update lead status
              setLeads(prev => prev?.map(lead => 
                lead?.id === draggedLead?.id 
                  ? { .lead, status: newStatus }
                  : lead
              ));
              setDraggedLead(null);
            }
          };

          const handleLeadClick = (lead) => {
            setSelectedLead(lead);
          };

          const handleCloseProfile = () => {
            setSelectedLead(null);
          };

          // Calculate conversion metrics
          const conversionMetrics = {
            totalLeads: filteredLeads?.length || 0,
            newInquiries: leadsByStage?.inquiry?.length || 0,
            inProgress: (leadsByStage?.contacted?.length || 0) + (leadsByStage?.qualified?.length || 0) + (leadsByStage?.consultation?.length || 0),
            converted: leadsByStage?.converted?.length || 0,
            conversionRate: filteredLeads?.length > 0 ? ((leadsByStage?.converted?.length || 0) / filteredLeads?.length * 100)?.toFixed(1) : 0
          };

          if (isLoading) {
            return (
              <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center h-96">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Loading lead data.</span>
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
                      Lead Management
                    </h1>
                    <p className="text-muted-foreground">
                      Optimize conversion process from inquiry to consultation
                    </p>
                  </div>
                  <Button iconName="Plus" className="bg-primary hover:bg-primary/90">
                    Add New Lead
                  </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  {/* Main Kanban Board - 3 columns */}
                  <div className="xl:col-span-3 space-y-6">
                    {/* Filter Controls */}
                    <FilterControls 
                      filters={filters}
                      onFiltersChange={setFilters}
                    />

                    {/* Lead Metrics */}
                    <LeadMetrics metrics={conversionMetrics} />

                    {/* Kanban Board */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-foreground">Lead Pipeline</h2>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" iconName="Filter">
                            View Options
                          </Button>
                          <Button variant="outline" size="sm" iconName="Download">
                            Export
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px]">
                        {leadStages?.map((stage) => (
                          <div
                            key={stage?.id}
                            className={cn("rounded-lg border-2 border-dashed p-4", stage?.color)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage?.id)}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-foreground text-sm">{stage?.label}</h3>
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                {leadsByStage?.[stage?.id]?.length || 0}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {leadsByStage?.[stage?.id]?.map((lead) => (
                                <LeadCard
                                  key={lead?.id}
                                  lead={lead}
                                  onDragStart={handleDragStart}
                                  onClick={handleLeadClick}
                                />
                              ))}
                            </div>

                            {leadsByStage?.[stage?.id]?.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No leads in this stage</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar - 1 column */}
                  <div className="xl:col-span-1 space-y-6">
                    <TeamPerformance />
                    
                    {/* Lead Sources */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-foreground mb-4">Lead Sources</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Website</span>
                          <span className="text-sm font-medium text-foreground">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Google Ads</span>
                          <span className="text-sm font-medium text-foreground">30%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Referrals</span>
                          <span className="text-sm font-medium text-foreground">15%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Social Media</span>
                          <span className="text-sm font-medium text-foreground">10%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" fullWidth iconName="Phone">
                          Call Next Lead
                        </Button>
                        <Button variant="outline" size="sm" fullWidth iconName="Mail">
                          Send Follow-up Email
                        </Button>
                        <Button variant="outline" size="sm" fullWidth iconName="Calendar">
                          Schedule Consultation
                        </Button>
                        <Button variant="outline" size="sm" fullWidth iconName="FileText">
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Profile Modal */}
                {selectedLead && (
                  <LeadProfile
                    lead={selectedLead}
                    onClose={handleCloseProfile}
                  />
                )}
              </main>
            </div>
          );
        };

        export default LeadManagementScreen;