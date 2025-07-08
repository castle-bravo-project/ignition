import React, { useState } from 'react';
import { Shield, Download, Settings, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AuditSettings, DEFAULT_AUDIT_SETTINGS, AuditService, AuditExportOptions } from '../services/auditService';
import { ProjectData } from '../types';

interface AuditSettingsPanelProps {
  auditSettings: AuditSettings;
  onUpdateAuditSettings: (settings: AuditSettings) => void;
  projectData: ProjectData;
}

const AuditSettingsPanel: React.FC<AuditSettingsPanelProps> = ({
  auditSettings,
  onUpdateAuditSettings,
  projectData
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'export' | 'reports'>('general');
  const [exportOptions, setExportOptions] = useState<AuditExportOptions>({
    format: 'json',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeDetails: true,
    includeContext: false,
    maskSensitiveData: true
  });

  const auditService = new AuditService(auditSettings);

  const handleSettingChange = (key: keyof AuditSettings, value: any) => {
    const newSettings = { ...auditSettings, [key]: value };
    onUpdateAuditSettings(newSettings);
  };

  const handleCategoryChange = (category: keyof AuditSettings['categories'], enabled: boolean) => {
    const newCategories = { ...auditSettings.categories, [category]: enabled };
    handleSettingChange('categories', newCategories);
  };

  const handleExportAuditLog = () => {
    try {
      const auditLog = projectData.auditLog || [];
      const exportData = auditService.exportAuditLog(auditLog as any, exportOptions);
      
      const blob = new Blob([exportData], { 
        type: exportOptions.format === 'json' ? 'application/json' : 
              exportOptions.format === 'csv' ? 'text/csv' : 'application/xml'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const generateReport = () => {
    try {
      const auditLog = projectData.auditLog || [];
      const report = auditService.generateReport(auditLog as any, exportOptions);
      
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Report generation failed: ${error.message}`);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset audit settings to defaults? This will overwrite your current configuration.')) {
      onUpdateAuditSettings(DEFAULT_AUDIT_SETTINGS);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield size={20} />
            Audit Logging Configuration
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Configure audit logging behavior, retention, and export options
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${
        auditSettings.enabled 
          ? 'bg-green-900/20 border border-green-700' 
          : 'bg-red-900/20 border border-red-700'
      }`}>
        {auditSettings.enabled ? (
          <CheckCircle className="text-green-500" size={16} />
        ) : (
          <AlertTriangle className="text-red-500" size={16} />
        )}
        <span className={auditSettings.enabled ? 'text-green-400' : 'text-red-400'}>
          Audit logging is {auditSettings.enabled ? 'enabled' : 'disabled'}
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <nav className="flex space-x-6">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'categories', label: 'Categories', icon: Shield },
            { id: 'export', label: 'Export', icon: Download },
            { id: 'reports', label: 'Reports', icon: Info }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enable Audit Logging
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={auditSettings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                />
                <span className="ml-2 text-gray-400">Enable comprehensive audit logging</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logging Level
              </label>
              <select
                value={auditSettings.level}
                onChange={(e) => handleSettingChange('level', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="basic">Basic - Essential events only</option>
                <option value="detailed">Detailed - Standard logging</option>
                <option value="verbose">Verbose - All events and context</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retention Period (days)
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={auditSettings.retention}
                onChange={(e) => handleSettingChange('retention', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Export Format
              </label>
              <select
                value={auditSettings.exportFormat}
                onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={auditSettings.enableOnProjectInit}
                  onChange={(e) => handleSettingChange('enableOnProjectInit', e.target.checked)}
                  className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                />
                <span className="ml-2 text-gray-400">Enable logging on project initialization</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={auditSettings.sensitiveDataMasking}
                  onChange={(e) => handleSettingChange('sensitiveDataMasking', e.target.checked)}
                  className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                />
                <span className="ml-2 text-gray-400">Mask sensitive data in logs</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={auditSettings.realTimeNotifications}
                  onChange={(e) => handleSettingChange('realTimeNotifications', e.target.checked)}
                  className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                />
                <span className="ml-2 text-gray-400">Real-time notifications for critical events</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Export Batch Size
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                value={auditSettings.batchSize}
                onChange={(e) => handleSettingChange('batchSize', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm mb-4">
            Select which categories of events should be logged. Disabling categories can improve performance but reduces audit coverage.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(auditSettings.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <span className="text-white font-medium">
                    {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <p className="text-gray-400 text-xs mt-1">
                    {getCategoryDescription(category)}
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleCategoryChange(category as keyof AuditSettings['categories'], e.target.checked)}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Export Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
                <input
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeDetails}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
              />
              <span className="ml-2 text-gray-400">Include event details</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeContext}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeContext: e.target.checked }))}
                className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
              />
              <span className="ml-2 text-gray-400">Include context data</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.maskSensitiveData}
                onChange={(e) => setExportOptions(prev => ({ ...prev, maskSensitiveData: e.target.checked }))}
                className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
              />
              <span className="ml-2 text-gray-400">Mask sensitive data</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleExportAuditLog}
              className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download size={16} />
              Export Audit Log
            </button>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2">Audit Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Events:</span>
                <span className="text-white ml-2">{projectData.auditLog?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-400">Last 24h:</span>
                <span className="text-white ml-2">
                  {projectData.auditLog?.filter(log => 
                    new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-400">User Actions:</span>
                <span className="text-white ml-2">
                  {projectData.auditLog?.filter(log => log.actor === 'User').length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-400">AI Actions:</span>
                <span className="text-white ml-2">
                  {projectData.auditLog?.filter(log => log.actor === 'AI').length || 0}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={generateReport}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Info size={16} />
            Generate Detailed Report
          </button>
        </div>
      )}
    </div>
  );
};

const getCategoryDescription = (category: string): string => {
  const descriptions: { [key: string]: string } = {
    userActions: 'Manual actions performed by users',
    aiActions: 'AI-generated content and analysis',
    systemActions: 'System-level operations and maintenance',
    automationActions: 'Automated processes and workflows',
    securityEvents: 'Security-related events and alerts',
    dataChanges: 'Data modifications and updates',
    integrationEvents: 'External system integrations and API calls',
  };
  return descriptions[category] || 'Event category';
};

export default AuditSettingsPanel;
