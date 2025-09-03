import React from 'react';
import Icon from '../../../components/AppIcon';

const ComplianceHealthScore = () => {
  const healthScore = 94;
  const gdprStatus = 'Compliant';
  const lastUpdate = '2025-09-02 08:05:00';

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 70) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Compliance Health</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Live Status</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score */}
        <div className={`p-4 rounded-lg ${getScoreBgColor(healthScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
            <Icon name="TrendingUp" size={16} className={getScoreColor(healthScore)} />
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
            {healthScore}%
          </div>
          <div className="w-full bg-border rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${healthScore >= 90 ? 'bg-success' : healthScore >= 70 ? 'bg-warning' : 'bg-error'}`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* GDPR Status */}
        <div className="p-4 rounded-lg bg-success/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">GDPR Status</span>
            <div className="w-3 h-3 bg-success rounded-full animate-pulse-subtle" />
          </div>
          <div className="text-xl font-bold text-success mb-1">
            {gdprStatus}
          </div>
          <div className="text-xs text-muted-foreground">
            All requirements met
          </div>
        </div>

        {/* Last Update */}
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
            <Icon name="Clock" size={16} className="text-muted-foreground" />
          </div>
          <div className="text-sm font-medium text-foreground">
            {new Date(lastUpdate)?.toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-xs text-success mt-1">
            Real-time monitoring active
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceHealthScore;