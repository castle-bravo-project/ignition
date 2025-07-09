/**
 * Webhook Configuration Modal
 * 
 * Allows users to configure GitHub webhook integration while keeping PAT system as primary.
 * Hybrid approach for enhanced audit logging capabilities.
 */

import { AlertTriangle, Check, Copy, Globe, Key, Settings, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import { WebhookConfig } from '../services/webhookAuditService';

interface WebhookConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: WebhookConfig;
  onSave: (config: WebhookConfig) => void;
  githubRepoUrl: string;
}

const WebhookConfigurationModal: React.FC<WebhookConfigurationModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
  githubRepoUrl
}) => {
  const [config, setConfig] = useState<WebhookConfig>(currentConfig);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setConfig({ ...config, secret });
  };

  const webhookUrl = `${window.location.origin}${config.endpoint}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-brand-primary" size={24} />
            Webhook Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Hybrid Approach Notice */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="text-blue-300 font-semibold mb-1">Hybrid Approach</h3>
                <p className="text-blue-200 text-sm">
                  Webhooks enhance your existing PAT-based audit logging with real-time events. 
                  Your current system remains the primary method with webhooks as supplementary.
                </p>
              </div>
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary"
              />
              <span className="text-white font-medium">Enable Webhook Integration</span>
            </label>
            <p className="text-gray-400 text-sm ml-7">
              Receive real-time GitHub events while keeping PAT system as primary audit method
            </p>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              <Globe className="inline mr-2" size={16} />
              Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-gray-400 text-xs">
              Use this URL when configuring webhooks in your GitHub repository settings
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              <Key className="inline mr-2" size={16} />
              Webhook Secret
            </label>
            <div className="flex gap-2">
              <input
                type={showSecret ? "text" : "password"}
                value={config.secret}
                onChange={(e) => setConfig({ ...config, secret: e.target.value })}
                placeholder="Enter webhook secret for signature verification"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-colors"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
              <button
                onClick={generateSecret}
                className="px-3 py-2 bg-brand-primary hover:bg-brand-secondary text-gray-900 rounded-lg transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-gray-400 text-xs">
              Secret used to verify webhook authenticity. Keep this secure and use the same value in GitHub.
            </p>
          </div>

          {/* Event Types */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Event Types to Monitor
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['push', 'pull_request', 'issues', 'repository', 'release', 'deployment'].map(event => (
                <label key={event} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({ ...config, events: [...config.events, event] });
                      } else {
                        setConfig({ ...config, events: config.events.filter(e => e !== event) });
                      }
                    }}
                    className="w-4 h-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary"
                  />
                  <span className="text-gray-300 text-sm capitalize">{event.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fallback Option */}
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.fallbackToPAT}
                onChange={(e) => setConfig({ ...config, fallbackToPAT: e.target.checked })}
                className="w-4 h-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary"
              />
              <span className="text-white font-medium">Fallback to PAT System</span>
            </label>
            <p className="text-gray-400 text-sm ml-7">
              Continue using PAT-based audit logging if webhook delivery fails (recommended)
            </p>
          </div>

          {/* GitHub Setup Instructions */}
          {config.enabled && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-400 mt-1" size={20} />
                <div>
                  <h3 className="text-yellow-300 font-semibold mb-2">GitHub Setup Required</h3>
                  <div className="text-yellow-200 text-sm space-y-1">
                    <p>1. Go to your repository: <code className="bg-gray-800 px-1 rounded">{githubRepoUrl}</code></p>
                    <p>2. Navigate to Settings → Webhooks → Add webhook</p>
                    <p>3. Set Payload URL to: <code className="bg-gray-800 px-1 rounded">{webhookUrl}</code></p>
                    <p>4. Set Content type to: <code className="bg-gray-800 px-1 rounded">application/json</code></p>
                    <p>5. Enter the secret you configured above</p>
                    <p>6. Select the events you want to monitor</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebhookConfigurationModal;
