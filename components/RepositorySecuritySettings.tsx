import React, { useState, useEffect } from 'react';
import { Shield, GitBranch, Lock, Eye, AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { GitHubSettings } from '../types';
import { getBranchProtection, updateBranchProtection, BranchProtection } from '../services/securityService';

interface RepositorySecuritySettingsProps {
  githubSettings: GitHubSettings;
}

interface SecurityPolicyTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

const RepositorySecuritySettings: React.FC<RepositorySecuritySettingsProps> = ({ githubSettings }) => {
  const [branchProtection, setBranchProtection] = useState<BranchProtection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [activeTab, setActiveTab] = useState<'protection' | 'policies' | 'scanning'>('protection');

  const [protectionSettings, setProtectionSettings] = useState({
    required_status_checks: {
      strict: true,
      contexts: ['ci/build', 'ci/test']
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 2,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      require_last_push_approval: false
    },
    restrictions: null,
    required_linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    required_conversation_resolution: true,
    lock_branch: false,
    allow_fork_syncing: true
  });

  const securityPolicyTemplates: SecurityPolicyTemplate[] = [
    {
      id: 'basic',
      name: 'Basic Security Policy',
      description: 'A simple security policy for open source projects',
      content: `# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to security@example.com.

We will respond within 48 hours and provide updates every 72 hours until resolved.`
    },
    {
      id: 'enterprise',
      name: 'Enterprise Security Policy',
      description: 'Comprehensive security policy for enterprise applications',
      content: `# Security Policy

## Security Standards

This project follows industry security standards including:
- OWASP Top 10
- NIST Cybersecurity Framework
- ISO 27001 guidelines

## Vulnerability Disclosure

### Scope
- Application security vulnerabilities
- Infrastructure security issues
- Third-party dependency vulnerabilities

### Process
1. Report via security@example.com
2. Initial response within 24 hours
3. Triage and assessment within 72 hours
4. Regular updates every 48 hours
5. Public disclosure after fix deployment

### Rewards
We offer recognition and potential rewards for valid security reports.`
    },
    {
      id: 'compliance',
      name: 'Compliance-Ready Policy',
      description: 'Security policy template for regulated industries',
      content: `# Security Policy

## Compliance Framework

This project maintains compliance with:
- SOC 2 Type II
- HIPAA (if applicable)
- PCI DSS (if applicable)
- GDPR data protection requirements

## Security Controls

### Access Control
- Multi-factor authentication required
- Role-based access control (RBAC)
- Regular access reviews

### Data Protection
- Encryption at rest and in transit
- Data classification and handling
- Secure data disposal

### Incident Response
- 24/7 security monitoring
- Incident response team
- Forensic capabilities

## Vulnerability Management

### Reporting
- Dedicated security team: security@example.com
- Encrypted communication preferred
- Response SLA: 4 hours for critical, 24 hours for others

### Assessment
- Automated vulnerability scanning
- Regular penetration testing
- Third-party security assessments`
    }
  ];

  useEffect(() => {
    loadBranchProtection();
  }, [selectedBranch, githubSettings]);

  const loadBranchProtection = async () => {
    if (!githubSettings.pat || !githubSettings.repoUrl) return;

    try {
      setLoading(true);
      setError(null);
      const protection = await getBranchProtection(githubSettings, selectedBranch);
      setBranchProtection(protection);
      
      if (protection) {
        setProtectionSettings({
          required_status_checks: protection.required_status_checks || {
            strict: true,
            contexts: []
          },
          enforce_admins: protection.enforce_admins?.enabled || false,
          required_pull_request_reviews: protection.required_pull_request_reviews || {
            required_approving_review_count: 1,
            dismiss_stale_reviews: false,
            require_code_owner_reviews: false,
            require_last_push_approval: false
          },
          restrictions: protection.restrictions,
          required_linear_history: protection.required_linear_history?.enabled || false,
          allow_force_pushes: protection.allow_force_pushes?.enabled || false,
          allow_deletions: protection.allow_deletions?.enabled || false,
          block_creations: protection.block_creations?.enabled || false,
          required_conversation_resolution: protection.required_conversation_resolution?.enabled || false,
          lock_branch: protection.lock_branch?.enabled || false,
          allow_fork_syncing: protection.allow_fork_syncing?.enabled || true
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProtection = async () => {
    if (!githubSettings.pat || !githubSettings.repoUrl) return;

    try {
      setLoading(true);
      setError(null);
      
      const protectionConfig = {
        required_status_checks: protectionSettings.required_status_checks.contexts.length > 0 
          ? protectionSettings.required_status_checks 
          : null,
        enforce_admins: protectionSettings.enforce_admins,
        required_pull_request_reviews: protectionSettings.required_pull_request_reviews,
        restrictions: protectionSettings.restrictions,
        required_linear_history: protectionSettings.required_linear_history,
        allow_force_pushes: protectionSettings.allow_force_pushes,
        allow_deletions: protectionSettings.allow_deletions,
        block_creations: protectionSettings.block_creations,
        required_conversation_resolution: protectionSettings.required_conversation_resolution,
        lock_branch: protectionSettings.lock_branch,
        allow_fork_syncing: protectionSettings.allow_fork_syncing
      };

      await updateBranchProtection(githubSettings, selectedBranch, protectionConfig);
      await loadBranchProtection(); // Refresh data
      alert('Branch protection rules updated successfully!');
    } catch (err: any) {
      setError(`Failed to update protection rules: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createSecurityPolicy = (template: SecurityPolicyTemplate) => {
    const blob = new Blob([template.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SECURITY.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!githubSettings.pat || !githubSettings.repoUrl) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">GitHub Configuration Required</h3>
          <p className="text-gray-400">
            Please configure your GitHub settings to manage repository security features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield size={20} />
            Repository Security Settings
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Configure branch protection, security policies, and scanning options
          </p>
        </div>
        <button
          onClick={loadBranchProtection}
          disabled={loading}
          className="bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={16} />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <nav className="flex space-x-6">
          {[
            { id: 'protection', label: 'Branch Protection', icon: GitBranch },
            { id: 'policies', label: 'Security Policies', icon: Lock },
            { id: 'scanning', label: 'Security Scanning', icon: Eye }
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
      {activeTab === 'protection' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-300">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
            >
              <option value="main">main</option>
              <option value="master">master</option>
              <option value="develop">develop</option>
            </select>
            {branchProtection && (
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-green-400 text-sm">Protection enabled</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Pull Request Reviews</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Approving Reviews
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={protectionSettings.required_pull_request_reviews.required_approving_review_count}
                  onChange={(e) => setProtectionSettings(prev => ({
                    ...prev,
                    required_pull_request_reviews: {
                      ...prev.required_pull_request_reviews,
                      required_approving_review_count: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={protectionSettings.required_pull_request_reviews.dismiss_stale_reviews}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      required_pull_request_reviews: {
                        ...prev.required_pull_request_reviews,
                        dismiss_stale_reviews: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Dismiss stale reviews</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={protectionSettings.required_pull_request_reviews.require_code_owner_reviews}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      required_pull_request_reviews: {
                        ...prev.required_pull_request_reviews,
                        require_code_owner_reviews: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Require code owner reviews</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={protectionSettings.required_pull_request_reviews.require_last_push_approval}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      required_pull_request_reviews: {
                        ...prev.required_pull_request_reviews,
                        require_last_push_approval: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Require approval of last push</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Branch Restrictions</h4>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={protectionSettings.enforce_admins}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      enforce_admins: e.target.checked
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Enforce for administrators</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={protectionSettings.required_linear_history}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      required_linear_history: e.target.checked
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Require linear history</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!protectionSettings.allow_force_pushes}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      allow_force_pushes: !e.target.checked
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Restrict force pushes</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!protectionSettings.allow_deletions}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      allow_deletions: !e.target.checked
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Restrict deletions</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={protectionSettings.required_conversation_resolution}
                    onChange={(e) => setProtectionSettings(prev => ({
                      ...prev,
                      required_conversation_resolution: e.target.checked
                    }))}
                    className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-gray-400">Require conversation resolution</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={updateProtection}
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Settings size={16} />
              {loading ? 'Updating...' : 'Update Protection Rules'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Security Policy Templates</h4>
            <p className="text-gray-400 text-sm mb-6">
              Choose a security policy template to download and customize for your repository.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {securityPolicyTemplates.map(template => (
              <div key={template.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{template.name}</h5>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                <button
                  onClick={() => createSecurityPolicy(template)}
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white px-3 py-2 rounded text-sm"
                >
                  Download Template
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-2">Custom Security Policy</h5>
            <p className="text-gray-400 text-sm mb-4">
              After downloading a template, customize it for your project and add it to your repository as SECURITY.md
            </p>
            <div className="text-sm text-gray-300">
              <p className="mb-2"><strong>Recommended locations:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Repository root: <code className="bg-gray-700 px-1 rounded">SECURITY.md</code></li>
                <li>GitHub folder: <code className="bg-gray-700 px-1 rounded">.github/SECURITY.md</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scanning' && (
        <div className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Security Scanning Features</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-white">Dependabot Alerts</h5>
                  <p className="text-gray-400 text-sm">Automatically detect vulnerable dependencies</p>
                </div>
                <span className="text-green-400 text-sm">Available in Security Dashboard</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-white">Code Scanning</h5>
                  <p className="text-gray-400 text-sm">Static analysis security testing (SAST)</p>
                </div>
                <span className="text-green-400 text-sm">Available in Security Dashboard</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-white">Secret Scanning</h5>
                  <p className="text-gray-400 text-sm">Detect secrets and credentials in code</p>
                </div>
                <span className="text-green-400 text-sm">Available in Security Dashboard</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="text-blue-400" size={16} />
              <h5 className="font-medium text-blue-400">Security Scanning Integration</h5>
            </div>
            <p className="text-gray-300 text-sm">
              Security scanning results are automatically integrated into the Security Dashboard. 
              Configure scanning features directly in your GitHub repository settings under the Security tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositorySecuritySettings;
