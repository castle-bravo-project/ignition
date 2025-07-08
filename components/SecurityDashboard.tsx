import React, { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle, Eye, Lock, GitBranch, FileText, RefreshCw, Filter, X, CheckCircle, XCircle } from 'lucide-react';
import { ProjectData, GitHubSettings } from '../types';
import { getSecurityOverview, SecurityOverview, dismissSecurityAlert } from '../services/securityService';

interface SecurityDashboardProps {
  projectData: ProjectData;
  githubSettings: GitHubSettings;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ projectData, githubSettings }) => {
  const [securityData, setSecurityData] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vulnerabilities' | 'secrets' | 'code' | 'settings'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');

  const loadSecurityData = async () => {
    if (!githubSettings.pat || !githubSettings.repoUrl) {
      setError('GitHub settings not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityOverview(githubSettings);
      setSecurityData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, [githubSettings]);

  const filteredVulnerabilities = useMemo(() => {
    if (!securityData) return [];
    
    return securityData.dependabotAlerts.filter(alert => {
      const severityMatch = filterSeverity === 'all' || alert.security_advisory.severity === filterSeverity;
      const stateMatch = filterState === 'all' || alert.state === filterState;
      return severityMatch && stateMatch;
    });
  }, [securityData, filterSeverity, filterState]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/50 border-red-700';
      case 'high': return 'text-orange-400 bg-orange-900/50 border-orange-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
      case 'low': return 'text-blue-400 bg-blue-900/50 border-blue-700';
      default: return 'text-gray-400 bg-gray-900/50 border-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleDismissAlert = async (alertNumber: number, reason: string, comment?: string) => {
    try {
      await dismissSecurityAlert(githubSettings, alertNumber, reason, comment);
      await loadSecurityData(); // Refresh data
    } catch (err: any) {
      setError(`Failed to dismiss alert: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-brand-primary" size={32} />
        <span className="ml-3 text-gray-400">Loading security data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-red-400">Security Data Error</h3>
        </div>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={loadSecurityData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!securityData) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto text-gray-500 mb-4" size={48} />
        <p className="text-gray-400">No security data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield />
            Security Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Repository security overview and vulnerability management
          </p>
        </div>
        <button
          onClick={loadSecurityData}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Security Score</h3>
            <Shield className="text-brand-primary" size={24} />
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(securityData.summary.securityScore)}`}>
            {securityData.summary.securityScore}%
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {securityData.summary.securityScore >= 90 ? 'Excellent' :
             securityData.summary.securityScore >= 70 ? 'Good' :
             securityData.summary.securityScore >= 50 ? 'Fair' : 'Poor'}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Vulnerabilities</h3>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            {securityData.summary.totalVulnerabilities}
          </div>
          <div className="flex gap-2 mt-2 text-sm">
            <span className="text-red-400">{securityData.summary.criticalVulnerabilities} Critical</span>
            <span className="text-orange-400">{securityData.summary.highVulnerabilities} High</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Secrets</h3>
            <Eye className="text-purple-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            {securityData.summary.openSecrets}
          </div>
          <p className="text-gray-400 text-sm mt-2">Open alerts</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Code Issues</h3>
            <FileText className="text-blue-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            {securityData.summary.codeIssues}
          </div>
          <p className="text-gray-400 text-sm mt-2">Code scanning alerts</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
            { id: 'secrets', label: 'Secrets', icon: Eye },
            { id: 'code', label: 'Code Scanning', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Lock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
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
      <div className="mt-8">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Branch Protection Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <GitBranch size={20} />
                  Branch Protection
                </h3>
                {securityData.branchProtection?.enabled ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <XCircle className="text-red-500" size={20} />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span className={securityData.branchProtection?.enabled ? 'text-green-400' : 'text-red-400'}>
                    {securityData.branchProtection?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {securityData.branchProtection?.required_pull_request_reviews && (
                  <div>
                    <span className="text-gray-400">Required Reviews: </span>
                    <span className="text-white">
                      {securityData.branchProtection.required_pull_request_reviews.required_approving_review_count}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Policy Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText size={20} />
                  Security Policy
                </h3>
                {securityData.securityPolicy.exists ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <XCircle className="text-red-500" size={20} />
                )}
              </div>
              <p className={securityData.securityPolicy.exists ? 'text-green-400' : 'text-red-400'}>
                {securityData.securityPolicy.exists ? 'Security policy exists' : 'No security policy found'}
              </p>
              {!securityData.securityPolicy.exists && (
                <p className="text-gray-400 text-sm mt-2">
                  Consider adding a SECURITY.md file to your repository
                </p>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'vulnerabilities' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
              >
                <option value="all">All States</option>
                <option value="open">Open</option>
                <option value="dismissed">Dismissed</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            {/* Vulnerability List */}
            {filteredVulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <p className="text-gray-400">No vulnerabilities found with current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVulnerabilities.map(alert => (
                  <div key={alert.number} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.security_advisory.severity)}`}>
                            {alert.security_advisory.severity}
                          </span>
                          <span className="text-white font-semibold">
                            {alert.dependency.package.name}
                          </span>
                          <span className="text-gray-400 text-sm">
                            #{alert.number}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {alert.security_advisory.summary}
                        </h4>
                        <p className="text-gray-400 mb-3">
                          {alert.security_advisory.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Package: </span>
                            <span className="text-gray-300">{alert.dependency.package.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Ecosystem: </span>
                            <span className="text-gray-300">{alert.dependency.package.ecosystem}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">CVSS Score: </span>
                            <span className="text-gray-300">{alert.security_advisory.cvss.score}</span>
                          </div>
                        </div>
                      </div>
                      {alert.state === 'open' && (
                        <button
                          onClick={() => handleDismissAlert(alert.number, 'no_bandwidth', 'Dismissed from dashboard')}
                          className="ml-4 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <X size={14} />
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'secrets' && (
          <div className="space-y-4">
            {securityData.secretScanningAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <p className="text-gray-400">No secret scanning alerts found</p>
              </div>
            ) : (
              securityData.secretScanningAlerts.map(alert => (
                <div key={alert.number} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Eye className="text-purple-500" size={16} />
                        <span className="text-white font-semibold">
                          {alert.secret_type_display_name}
                        </span>
                        <span className="text-gray-400 text-sm">
                          #{alert.number}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">State: </span>
                          <span className={alert.state === 'open' ? 'text-red-400' : 'text-green-400'}>
                            {alert.state}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Validity: </span>
                          <span className="text-gray-300">{alert.validity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'code' && (
          <div className="space-y-4">
            {securityData.codeScanningAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <p className="text-gray-400">No code scanning alerts found</p>
              </div>
            ) : (
              securityData.codeScanningAlerts.map(alert => (
                <div key={alert.number} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.rule.security_severity_level || alert.rule.severity)}`}>
                          {alert.rule.security_severity_level || alert.rule.severity}
                        </span>
                        <span className="text-white font-semibold">
                          {alert.rule.name}
                        </span>
                        <span className="text-gray-400 text-sm">
                          #{alert.number}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">
                        {alert.rule.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">File: </span>
                          <span className="text-gray-300">{alert.most_recent_instance.location.path}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Line: </span>
                          <span className="text-gray-300">{alert.most_recent_instance.location.start_line}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
            <p className="text-gray-400">
              Security settings and configurations will be available in a future update.
              This will include branch protection rule management, security policy templates, and alert configurations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;
