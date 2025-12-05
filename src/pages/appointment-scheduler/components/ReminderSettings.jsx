import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ReminderSettings = ({ onSave, onClose }) => {
  const [settings, setSettings] = useState({
    smsEnabled: true,
    emailEnabled: true,
    smsTemplate: 'Hi {patientName}, this is a reminder for your {appointmentType} appointment on {date} at {time} with {provider}. Please reply CONFIRM if you can attend.',
    emailTemplate: 'Dear {patientName},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: {date}\nTime: {time}\nProvider: {provider}\nTreatment: {appointmentType}\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nYour Dental Practice',
    reminderTiming: [
      { id: 1, enabled: true, type: 'email', hours: 24, active: true },
      { id: 2, enabled: true, type: 'sms', hours: 2, active: true },
      { id: 3, enabled: false, type: 'call', hours: 1, active: false }
    ],
    autoConfirmation: true,
    followUpEnabled: true,
    followUpHours: 24
  });

  const [activeTab, setActiveTab] = useState('timing');

  const timingOptions = [
    { value: 1, label: '1 hour before' },
    { value: 2, label: '2 hours before' },
    { value: 4, label: '4 hours before' },
    { value: 12, label: '12 hours before' },
    { value: 24, label: '24 hours before' },
    { value: 48, label: '48 hours before' },
    { value: 168, label: '1 week before' }
  ];

  const reminderTypes = [
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'sms', label: 'SMS', icon: 'MessageSquare' },
    { value: 'call', label: 'Phone Call', icon: 'Phone' }
  ];

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ .....prev, [field]: value }));
  };

  const handleTimingChange = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      reminderTiming: prev?.reminderTiming?.map(reminder =>
        reminder?.id === id ? { .reminder, [field]: value } : reminder
      )
    }));
  };

  const addReminderTiming = () => {
    const newReminder = {
      id: Date.now(),
      enabled: true,
      type: 'email',
      hours: 24,
      active: true
    };
    setSettings(prev => ({
      ...prev,
      reminderTiming: [.prev?.reminderTiming, newReminder]
    }));
  };

  const removeReminderTiming = (id) => {
    setSettings(prev => ({
      ...prev,
      reminderTiming: prev?.reminderTiming?.filter(reminder => reminder?.id !== id)
    }));
  };

  const handleSave = () => {
    onSave?.(settings);
  };

  const previewTemplate = (template, type) => {
    const mockData = {
      patientName: 'John Smith',
      appointmentType: 'Dental Cleaning',
      date: 'Monday, January 15, 2025',
      time: '2:00 PM',
      provider: 'Dr. Sarah Johnson'
    };

    let preview = template;
    Object.entries(mockData)?.forEach(([key, value]) => {
      preview = preview?.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    return preview;
  };

  const renderTimingSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Reminder Schedule</h3>
        <Button size="sm" onClick={addReminderTiming} iconName="Plus">
          Add Reminder
        </Button>
      </div>

      <div className="space-y-3">
        {settings?.reminderTiming?.map((reminder) => (
          <div key={reminder?.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
            <input
              type="checkbox"
              checked={reminder?.enabled}
              onChange={(e) => handleTimingChange(reminder?.id, 'enabled', e?.target?.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />

            <Select
              value={reminder?.type}
              onValueChange={(value) => handleTimingChange(reminder?.id, 'type', value)}
              options={reminderTypes}
              className="w-32"
            />

            <Select
              value={reminder?.hours}
              onValueChange={(value) => handleTimingChange(reminder?.id, 'hours', parseInt(value))}
              options={timingOptions}
              className="w-40"
            />

            <div className={`px-2 py-1 rounded text-xs font-medium ${
              reminder?.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {reminder?.active ? 'Active' : 'Inactive'}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeReminderTiming(reminder?.id)}
              className="text-error hover:text-error"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplateSettings = () => (
    <div className="space-y-6">
      {/* SMS Template */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            id="smsEnabled"
            checked={settings?.smsEnabled}
            onChange={(e) => handleSettingChange('smsEnabled', e?.target?.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="smsEnabled" className="font-medium text-foreground">SMS Reminders</label>
        </div>

        {settings?.smsEnabled && (
          <div className="space-y-3">
            <textarea
              value={settings?.smsTemplate}
              onChange={(e) => handleSettingChange('smsTemplate', e?.target?.value)}
              placeholder="SMS reminder template."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Preview:</p>
              <p className="text-sm text-muted-foreground">{previewTemplate(settings?.smsTemplate, 'sms')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Email Template */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            id="emailEnabled"
            checked={settings?.emailEnabled}
            onChange={(e) => handleSettingChange('emailEnabled', e?.target?.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="emailEnabled" className="font-medium text-foreground">Email Reminders</label>
        </div>

        {settings?.emailEnabled && (
          <div className="space-y-3">
            <textarea
              value={settings?.emailTemplate}
              onChange={(e) => handleSettingChange('emailTemplate', e?.target?.value)}
              placeholder="Email reminder template."
              rows={8}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <div className="bg-muted/50 p-3 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm font-medium text-foreground mb-2">Preview:</p>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewTemplate(settings?.emailTemplate, 'email')}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Template Variables */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Available Variables</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <code className="bg-background px-2 py-1 rounded">{'{patientName}'}</code>
          <code className="bg-background px-2 py-1 rounded">{'{appointmentType}'}</code>
          <code className="bg-background px-2 py-1 rounded">{'{date}'}</code>
          <code className="bg-background px-2 py-1 rounded">{'{time}'}</code>
          <code className="bg-background px-2 py-1 rounded">{'{provider}'}</code>
          <code className="bg-background px-2 py-1 rounded">{'{duration}'}</code>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">Auto-Confirmation</h4>
          <p className="text-sm text-muted-foreground">Automatically mark appointments as confirmed when patients reply</p>
        </div>
        <input
          type="checkbox"
          checked={settings?.autoConfirmation}
          onChange={(e) => handleSettingChange('autoConfirmation', e?.target?.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">Follow-up Reminders</h4>
          <p className="text-sm text-muted-foreground">Send follow-up if no response received</p>
        </div>
        <input
          type="checkbox"
          checked={settings?.followUpEnabled}
          onChange={(e) => handleSettingChange('followUpEnabled', e?.target?.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />
      </div>

      {settings?.followUpEnabled && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Follow-up after (hours)
          </label>
          <Input
            type="number"
            value={settings?.followUpHours}
            onChange={(e) => handleSettingChange('followUpHours', parseInt(e?.target?.value) || 24)}
            min="1"
            max="168"
            className="w-32"
          />
        </div>
      )}

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-warning mb-1">Important Notes</h4>
            <ul className="text-sm text-warning space-y-1">
              <li>• SMS reminders may incur additional charges</li>
              <li>• Test templates before enabling automatic sending</li>
              <li>• Ensure compliance with local privacy regulations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Reminder Settings</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('timing')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'timing' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Timing
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'templates' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'advanced' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'timing' && renderTimingSettings()}
          {activeTab === 'templates' && renderTemplateSettings()}
          {activeTab === 'advanced' && renderAdvancedSettings()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderSettings;