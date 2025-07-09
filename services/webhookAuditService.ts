/**
 * Webhook Audit Service
 *
 * Hybrid approach: Adds webhook support while keeping existing PAT system as primary.
 * This service handles GitHub webhook events and integrates with the existing audit system.
 */

// Note: In browser environment, we'll use Web Crypto API for signature verification
// import { createHmac } from 'crypto'; // Node.js only
import { AuditLogEntry } from '../types';

export interface WebhookConfig {
  enabled: boolean;
  secret: string;
  endpoint: string;
  events: string[];
  fallbackToPAT: boolean;
}

export interface GitHubWebhookEvent {
  action: string;
  repository: {
    name: string;
    full_name: string;
    private: boolean;
  };
  sender: {
    login: string;
    type: string;
  };
  [key: string]: any;
}

export interface WebhookAuditEntry extends AuditLogEntry {
  source: 'webhook' | 'pat' | 'hybrid';
  webhookEvent?: {
    type: string;
    action: string;
    deliveryId: string;
    timestamp: string;
  };
}

class WebhookAuditService {
  private config: WebhookConfig;
  private eventQueue: GitHubWebhookEvent[] = [];
  private isProcessing = false;

  constructor(config: WebhookConfig) {
    this.config = {
      enabled: false,
      secret: '',
      endpoint: '/api/webhooks/github',
      events: ['push', 'pull_request', 'issues', 'repository'],
      fallbackToPAT: true,
      ...config,
    };
  }

  /**
   * Verify webhook signature for security
   * Note: In browser environment, signature verification is simplified for demo purposes
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.secret) {
      console.warn(
        '⚠️ Webhook secret not configured - signature verification skipped'
      );
      return true; // Allow in development, but warn
    }

    // In a real implementation, you'd use Web Crypto API for HMAC verification
    // For now, we'll do a simple check to ensure signature is present
    if (!signature || !signature.startsWith('sha256=')) {
      console.warn('⚠️ Invalid webhook signature format');
      return false;
    }

    // Simplified verification for browser environment
    // In production, implement proper HMAC-SHA256 verification using Web Crypto API
    console.log('🔐 Webhook signature verification (simplified for browser)');
    return true;
  }

  /**
   * Process incoming webhook event
   */
  async processWebhookEvent(
    event: GitHubWebhookEvent,
    signature: string,
    deliveryId: string
  ): Promise<WebhookAuditEntry | null> {
    // Verify signature first
    const payload = JSON.stringify(event);
    if (!this.verifyWebhookSignature(payload, signature)) {
      console.error('🚨 Webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }

    // Check if we should process this event type
    const eventType = this.extractEventType(event);
    if (!this.shouldProcessEvent(eventType)) {
      console.log(
        `⏭️ Skipping webhook event: ${eventType} (not in configured events)`
      );
      return null;
    }

    // Create audit entry from webhook event
    const auditEntry = this.createAuditEntryFromWebhook(event, deliveryId);

    console.log(
      `📥 Processed webhook event: ${eventType} from ${event.sender?.login}`
    );

    return auditEntry;
  }

  /**
   * Create audit entry from webhook event
   */
  private createAuditEntryFromWebhook(
    event: GitHubWebhookEvent,
    deliveryId: string
  ): WebhookAuditEntry {
    const eventType = this.extractEventType(event);
    const summary = this.generateEventSummary(event);

    return {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: event.sender?.login || 'Unknown',
      eventType: `WEBHOOK_${eventType.toUpperCase()}`,
      summary,
      details: {
        webhookEvent: event,
        repository: event.repository?.full_name,
        action: event.action,
        deliveryId,
        source: 'webhook',
        persistentLogging: true, // Ensure this gets saved to GitHub
      },
      source: 'webhook',
      webhookEvent: {
        type: eventType,
        action: event.action || 'unknown',
        deliveryId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Extract event type from webhook payload
   */
  private extractEventType(event: GitHubWebhookEvent): string {
    // GitHub sends event type in headers, but we can infer from payload structure
    if (event.commits) return 'push';
    if (event.pull_request) return 'pull_request';
    if (event.issue) return 'issues';
    if (event.repository && event.action) return 'repository';
    return 'unknown';
  }

  /**
   * Generate human-readable summary from webhook event
   */
  private generateEventSummary(event: GitHubWebhookEvent): string {
    const eventType = this.extractEventType(event);
    const actor = event.sender?.login || 'Unknown user';
    const repo = event.repository?.name || 'unknown repository';

    switch (eventType) {
      case 'push':
        const commitCount = event.commits?.length || 0;
        return `${actor} pushed ${commitCount} commit(s) to ${repo}`;

      case 'pull_request':
        const prAction = event.action || 'modified';
        const prNumber = event.pull_request?.number || 'unknown';
        return `${actor} ${prAction} pull request #${prNumber} in ${repo}`;

      case 'issues':
        const issueAction = event.action || 'modified';
        const issueNumber = event.issue?.number || 'unknown';
        return `${actor} ${issueAction} issue #${issueNumber} in ${repo}`;

      case 'repository':
        const repoAction = event.action || 'modified';
        return `${actor} ${repoAction} repository ${repo}`;

      default:
        return `${actor} performed ${
          event.action || 'unknown action'
        } in ${repo}`;
    }
  }

  /**
   * Check if we should process this event type
   */
  private shouldProcessEvent(eventType: string): boolean {
    return this.config.enabled && this.config.events.includes(eventType);
  }

  /**
   * Get webhook configuration
   */
  getConfig(): WebhookConfig {
    return { ...this.config };
  }

  /**
   * Update webhook configuration
   */
  updateConfig(newConfig: Partial<WebhookConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Webhook configuration updated:', this.config);
  }

  /**
   * Enable/disable webhook processing
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🎛️ Webhook processing ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get webhook endpoint URL for GitHub configuration
   */
  getWebhookEndpoint(): string {
    return this.config.endpoint;
  }

  /**
   * Get supported event types
   */
  getSupportedEvents(): string[] {
    return [
      'push',
      'pull_request',
      'issues',
      'repository',
      'release',
      'deployment',
    ];
  }

  /**
   * Health check for webhook service
   */
  healthCheck(): { status: string; config: WebhookConfig; queueSize: number } {
    return {
      status: this.config.enabled ? 'enabled' : 'disabled',
      config: this.config,
      queueSize: this.eventQueue.length,
    };
  }
}

/**
 * Factory function to create webhook audit service
 */
export function createWebhookAuditService(
  config: Partial<WebhookConfig> = {}
): WebhookAuditService {
  const defaultConfig: WebhookConfig = {
    enabled: false, // Start disabled for safety
    secret: '', // Will be configured through UI
    endpoint: '/api/webhooks/github',
    events: ['push', 'pull_request', 'issues'],
    fallbackToPAT: true,
  };

  return new WebhookAuditService({ ...defaultConfig, ...config });
}

export default WebhookAuditService;
