import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LeadScoreLeaderboard = ({ leads, onLeadClick }) => {
  const [sortBy, setSortBy] = useState('score');
  const [timeFilter, setTimeFilter] = useState('today');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const leadTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - leadTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success bg-success/10';
    if (score >= 60) return 'text-warning bg-warning/10';
    if (score >= 40) return 'text-clinical-blue bg-clinical-blue/10';
    return 'text-muted-foreground bg-muted';
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high':
        return { name: 'AlertTriangle', color: 'text-error' };
      case 'medium':
        return { name: 'Clock', color: 'text-warning' };
      case 'low':
        return { name: 'CheckCircle', color: 'text-success' };
      default:
        return { name: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'google ads':
        return 'Search';
      case 'facebook':
        return 'Facebook';
      case 'organic':
        return 'Globe';
      case 'referral':
        return 'Users';
      case 'email':
        return 'Mail';
      default:
        return 'ExternalLink';
    }
  };

  const sortedLeads = [.leads]?.sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b?.score - a?.score;
      case 'value':
        return b?.estimatedValue - a?.estimatedValue;
      case 'time':
        return new Date(b.timestamp) - new Date(a.timestamp);
      default:
        return 0;
    }
  });

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">High-Value Lead Scoring</h3>
          <p className="text-sm text-muted-foreground">Real-time lead prioritization and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="score">Sort by Score</option>
            <option value="value">Sort by Value</option>
            <option value="time">Sort by Time</option>
          </select>
          <Button
            variant="ghost"
            size="icon"
            iconName="RefreshCw"
          />
        </div>
      </div>
      {/* Time Filter */}
      <div className="flex items-center space-x-2 mb-6">
        {['today', 'week', 'month']?.map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-150 ${
              timeFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {filter?.charAt(0)?.toUpperCase() + filter?.slice(1)}
          </button>
        ))}
      </div>
      {/* Lead List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedLeads?.map((lead, index) => (
          <div
            key={lead?.id}
            className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md"
            onClick={() => onLeadClick?.(lead)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium text-foreground">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{lead?.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Icon name={getSourceIcon(lead?.source)} size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{lead?.source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatTime(lead?.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead?.score)}`}>
                  {lead?.score}
                </div>
                <Icon 
                  name={getUrgencyIcon(lead?.urgency)?.name} 
                  size={16} 
                  className={getUrgencyIcon(lead?.urgency)?.color} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-muted-foreground">Treatment Interest</span>
                <p className="text-sm font-medium text-foreground">{lead?.treatmentInterest}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Estimated Value</span>
                <p className="text-sm font-medium text-foreground">{formatCurrency(lead?.estimatedValue)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-muted-foreground">Budget Range</span>
                <p className="text-sm font-medium text-foreground">{lead?.budgetRange}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Timeframe</span>
                <p className="text-sm font-medium text-foreground">{lead?.timeframe}</p>
              </div>
            </div>

            {/* Lead Score Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Score Breakdown</span>
                <span className="text-xs text-muted-foreground">{lead?.score}/100</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {lead?.scoreBreakdown?.map((factor, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{factor?.name}</div>
                    <div className={`text-xs font-medium px-1 py-0.5 rounded ${getScoreColor(factor?.score)}`}>
                      {factor?.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Indicators */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center space-x-2">
                {lead?.hasFollowUp && (
                  <div className="flex items-center space-x-1 text-xs text-warning">
                    <Icon name="Clock" size={12} />
                    <span>Follow-up due</span>
                  </div>
                )}
                {lead?.isNewLead && (
                  <div className="flex items-center space-x-1 text-xs text-success">
                    <Icon name="Sparkles" size={12} />
                    <span>New</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Phone"
                  iconPosition="left"
                >
                  Call
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Mail"
                  iconPosition="left"
                >
                  Email
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-foreground">{leads?.filter(l => l?.score >= 80)?.length}</p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(leads?.reduce((sum, lead) => sum + lead?.estimatedValue, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {Math.round(leads?.reduce((sum, lead) => sum + lead?.score, 0) / leads?.length)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadScoreLeaderboard;