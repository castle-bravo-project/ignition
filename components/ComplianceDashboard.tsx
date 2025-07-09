import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, FileText, Lock, GitCommit, Clock, Users, Database } from 'lucide-react';

interface ComplianceDashboardProps {
  auditLog: any[];
  githubSettings: any;
  onGenerateIntegrityReport: () => Promise<void>;
  onExportCompliancePackage: () => Promise<void>;
}

interface ComplianceMetrics {
  totalAuditEntries: number;
  integrityScore: number;
  complianceFrameworks: string[];
  lastAuditEntry: string;
  dataClassification: {
    PUBLIC: number;
    INTERNAL: number;
    CONFIDENTIAL: number;
    RESTRICTED: number;
  };
  sourceBreakdown: {
    IGNITION: number;
    GITHUB_WEBHOOK: number;
    MANUAL: number;
    THIRD_PARTY: number;
  };
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  auditLog,
  githubSettings,
  onGenerateIntegrityReport,
  onExportCompliancePackage
}) => {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalAuditEntries: 0,
    integrityScore: 100,
    complianceFrameworks: ['SOC2', 'ISO27001', 'HIPAA', 'FRE901', 'FRE902'],
    lastAuditEntry: 'Never',
    dataClassification: { PUBLIC: 0, INTERNAL: 0, CONFIDENTIAL: 0, RESTRICTED: 0 },
    sourceBreakdown: { IGNITION: 0, GITHUB_WEBHOOK: 0, MANUAL: 0, THIRD_PARTY: 0 }
  });

  const [complianceStatus, setComplianceStatus] = useState<'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'>('COMPLIANT');

  useEffect(() => {
    calculateMetrics();
  }, [auditLog]);

  const calculateMetrics = () => {
    const newMetrics: ComplianceMetrics = {
      totalAuditEntries: auditLog.length,
      integrityScore: 100, // Would be calculated by integrity service
      complianceFrameworks: ['SOC2', 'ISO27001', 'HIPAA', 'FRE901', 'FRE902'],
      lastAuditEntry: auditLog.length > 0 ? auditLog[auditLog.length - 1]?.timestamp || 'Never' : 'Never',
      dataClassification: { PUBLIC: 0, INTERNAL: 0, CONFIDENTIAL: 0, RESTRICTED: 0 },
      sourceBreakdown: { IGNITION: 0, GITHUB_WEBHOOK: 0, MANUAL: 0, THIRD_PARTY: 0 }
    };

    // Calculate data classification breakdown
    auditLog.forEach(entry => {
      const classification = entry.dataClassification || 'INTERNAL';
      if (classification in newMetrics.dataClassification) {
        newMetrics.dataClassification[classification as keyof typeof newMetrics.dataClassification]++;
      }

      const source = entry.sourceSystem || 'IGNITION';
      if (source in newMetrics.sourceBreakdown) {
        newMetrics.sourceBreakdown[source as keyof typeof newMetrics.sourceBreakdown]++;
      }
    });

    setMetrics(newMetrics);

    // Determine compliance status
    if (newMetrics.totalAuditEntries === 0) {
      setComplianceStatus('WARNING');
    } else if (newMetrics.integrityScore < 95) {
      setComplianceStatus('NON_COMPLIANT');
    } else if (newMetrics.integrityScore < 100) {
      setComplianceStatus('WARNING');
    } else {
      setComplianceStatus('COMPLIANT');
    }
  };

  const getStatusIcon = () => {
    switch (complianceStatus) {
      case 'COMPLIANT':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'WARNING':
        return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'NON_COMPLIANT':
        return <XCircle className="text-red-500" size={24} />;
    }
  };

  const getStatusColor = () => {
    switch (complianceStatus) {
      case 'COMPLIANT':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'WARNING':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'NON_COMPLIANT':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-brand-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Compliance Dashboard</h1>
            <p className="text-gray-400">Meta-Compliance Monitoring & Audit Management</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-semibold">{complianceStatus}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Audit Entries</p>
              <p className="text-2xl font-bold text-white">{metrics.totalAuditEntries}</p>
            </div>
            <Database className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Integrity Score</p>
              <p className="text-2xl font-bold text-white">{metrics.integrityScore}%</p>
            </div>
            <Lock className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Compliance Frameworks</p>
              <p className="text-2xl font-bold text-white">{metrics.complianceFrameworks.length}</p>
            </div>
            <FileText className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Last Audit Entry</p>
              <p className="text-sm font-medium text-white">
                {metrics.lastAuditEntry !== 'Never' 
                  ? new Date(metrics.lastAuditEntry).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="text-brand-primary" size={20} />
          Compliance Frameworks
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metrics.complianceFrameworks.map(framework => (
            <div key={framework} className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-green-500 mb-1">
                <CheckCircle size={20} className="mx-auto" />
              </div>
              <p className="text-sm font-medium text-white">{framework}</p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Classification Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="text-brand-primary" size={20} />
            Data Classification
          </h2>
          <div className="space-y-3">
            {Object.entries(metrics.dataClassification).map(([classification, count]) => (
              <div key={classification} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    classification === 'RESTRICTED' ? 'bg-red-500' :
                    classification === 'CONFIDENTIAL' ? 'bg-orange-500' :
                    classification === 'INTERNAL' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-gray-300">{classification}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <GitCommit className="text-brand-primary" size={20} />
            Audit Sources
          </h2>
          <div className="space-y-3">
            {Object.entries(metrics.sourceBreakdown).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    source === 'IGNITION' ? 'bg-brand-primary' :
                    source === 'GITHUB_WEBHOOK' ? 'bg-blue-500' :
                    source === 'MANUAL' ? 'bg-purple-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-gray-300">{source.replace('_', ' ')}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="text-brand-primary" size={20} />
          Compliance Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onGenerateIntegrityReport}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <FileText size={20} />
            Generate Integrity Report
          </button>
          <button
            onClick={onExportCompliancePackage}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Shield size={20} />
            Export Compliance Package
          </button>
        </div>
      </div>

      {/* GitHub Integration Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <GitCommit className="text-brand-primary" size={20} />
          GitHub Integration Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${githubSettings.repoUrl ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-300">Repository Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-300">Persistent Audit Logging</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-300">Webhook Integration (Pending)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
