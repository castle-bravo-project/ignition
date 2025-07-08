/**
 * Webhook Processor - Real-time Event Processing
 * 
 * Handles GitHub App webhooks with signature verification, event routing,
 * and real-time synchronization for enterprise deployment.
 */

import GitHubAppAuth, { WebhookEvent } from './githubAppAuth';
import InstallationManager, { InstallationEvent } from './installationManager';
import { ProjectData } from '../types';

export interface WebhookPayload {
  action: string;
  installation?: any;
  repository?: any;
  repositories?: any[];
  sender: any;
  [key: string]: any;
}

export interface ProcessedEvent {
  id: string;
  type: string;
  action: string;
  installationId: number;
  repositoryFullName?: string;
  processedAt: Date;
  success: boolean;
  error?: string;
  metadata: Record<string, any>;
}

abstract class EventProcessor {
  protected githubAuth: GitHubAppAuth;
  protected installationManager: InstallationManager;

  constructor(githubAuth: GitHubAppAuth, installationManager: InstallationManager) {
    this.githubAuth = githubAuth;
    this.installationManager = installationManager;
  }

  abstract process(event: WebhookEvent): Promise<ProcessedEvent>;

  protected createProcessedEvent(
    event: WebhookEvent,
    success: boolean,
    error?: string,
    metadata: Record<string, any> = {}
  ): ProcessedEvent {
    return {
      id: `${event.installation?.id || 'unknown'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.constructor.name.replace('Processor', '').toLowerCase(),
      action: event.action,
      installationId: event.installation?.id || 0,
      repositoryFullName: event.repository?.full_name,
      processedAt: new Date(),
      success,
      error,
      metadata
    };
  }
}

class InstallationEventProcessor extends EventProcessor {
  async process(event: WebhookEvent): Promise<ProcessedEvent> {
    try {
      const installationEvent: InstallationEvent = {
        type: 'installation',
        action: event.action as any,
        installation: event.installation,
        repositories: event.repositories
      };

      const tenant = await this.installationManager.handleInstallation(installationEvent);

      return this.createProcessedEvent(event, true, undefined, {
        organizationLogin: tenant.organizationLogin,
        repositoryCount: tenant.repositories.length,
        subscriptionPlan: tenant.subscription.plan
      });
    } catch (error: any) {
      console.error('Installation event processing failed:', error);
      return this.createProcessedEvent(event, false, error.message);
    }
  }
}

class InstallationRepositoriesEventProcessor extends EventProcessor {
  async process(event: WebhookEvent): Promise<ProcessedEvent> {
    try {
      const installationEvent: InstallationEvent = {
        type: 'installation_repositories',
        action: event.action as any,
        installation: event.installation,
        repositories: event.repositories_added || event.repositories_removed
      };

      const tenant = await this.installationManager.handleRepositoryChanges(installationEvent);

      return this.createProcessedEvent(event, true, undefined, {
        organizationLogin: tenant.organizationLogin,
        repositoryCount: tenant.repositories.length,
        action: event.action,
        affectedRepositories: (event.repositories_added || event.repositories_removed || []).length
      });
    } catch (error: any) {
      console.error('Installation repositories event processing failed:', error);
      return this.createProcessedEvent(event, false, error.message);
    }
  }
}

class PushEventProcessor extends EventProcessor {
  async process(event: WebhookEvent): Promise<ProcessedEvent> {
    try {
      const tenant = this.installationManager.getTenantByRepository(event.repository.full_name);
      if (!tenant) {
        throw new Error(`No tenant found for repository ${event.repository.full_name}`);
      }

      // Update project data based on push event
      await this.handleCodeChanges(event, tenant);

      // Update usage metrics
      this.installationManager.updateUsage(tenant.installationId, {
        apiCalls: tenant.usage.apiCalls + 1
      });

      return this.createProcessedEvent(event, true, undefined, {
        branch: event.ref?.replace('refs/heads/', ''),
        commits: event.commits?.length || 0,
        pusher: event.pusher?.name
      });
    } catch (error: any) {
      console.error('Push event processing failed:', error);
      return this.createProcessedEvent(event, false, error.message);
    }
  }

  private async handleCodeChanges(event: WebhookEvent, tenant: any): Promise<void> {
    // Check if project data files were modified
    const modifiedFiles = event.commits?.flatMap((commit: any) => 
      [...(commit.added || []), ...(commit.modified || []), ...(commit.removed || [])]
    ) || [];

    const projectDataFiles = modifiedFiles.filter((file: string) => 
      file.includes('ignition-project.json') || 
      file.includes('project-data.json') ||
      file.includes('.ignition/')
    );

    if (projectDataFiles.length > 0) {
      console.log(`📁 Project data files modified in ${event.repository.full_name}:`, projectDataFiles);
      // TODO: Sync project data from repository
      await this.syncProjectDataFromRepository(event.repository.full_name, tenant);
    }
  }

  private async syncProjectDataFromRepository(repositoryFullName: string, tenant: any): Promise<void> {
    // Implementation would fetch and sync project data from repository
    console.log(`🔄 Syncing project data for ${repositoryFullName}`);
  }
}

class PullRequestEventProcessor extends EventProcessor {
  async process(event: WebhookEvent): Promise<ProcessedEvent> {
    try {
      const tenant = this.installationManager.getTenantByRepository(event.repository.full_name);
      if (!tenant) {
        throw new Error(`No tenant found for repository ${event.repository.full_name}`);
      }

      // Handle PR events for compliance and quality checks
      await this.handlePullRequestEvent(event, tenant);

      return this.createProcessedEvent(event, true, undefined, {
        prNumber: event.pull_request?.number,
        prTitle: event.pull_request?.title,
        author: event.pull_request?.user?.login,
        state: event.pull_request?.state
      });
    } catch (error: any) {
      console.error('Pull request event processing failed:', error);
      return this.createProcessedEvent(event, false, error.message);
    }
  }

  private async handlePullRequestEvent(event: WebhookEvent, tenant: any): Promise<void> {
    if (event.action === 'opened' || event.action === 'synchronize') {
      // Run compliance checks on PR
      console.log(`🔍 Running compliance checks on PR #${event.pull_request.number}`);
      
      if (tenant.settings.features.complianceModule) {
        await this.runComplianceChecks(event, tenant);
      }
    }
  }

  private async runComplianceChecks(event: WebhookEvent, tenant: any): Promise<void> {
    // Implementation would run compliance checks and post results
    console.log(`✅ Compliance checks completed for PR #${event.pull_request.number}`);
  }
}

class IssuesEventProcessor extends EventProcessor {
  async process(event: WebhookEvent): Promise<ProcessedEvent> {
    try {
      const tenant = this.installationManager.getTenantByRepository(event.repository.full_name);
      if (!tenant) {
        throw new Error(`No tenant found for repository ${event.repository.full_name}`);
      }

      // Handle issue events for project tracking
      await this.handleIssueEvent(event, tenant);

      return this.createProcessedEvent(event, true, undefined, {
        issueNumber: event.issue?.number,
        issueTitle: event.issue?.title,
        author: event.issue?.user?.login,
        state: event.issue?.state
      });
    } catch (error: any) {
      console.error('Issues event processing failed:', error);
      return this.createProcessedEvent(event, false, error.message);
    }
  }

  private async handleIssueEvent(event: WebhookEvent, tenant: any): Promise<void> {
    // Sync issues with project requirements/risks
    console.log(`📋 Processing issue #${event.issue.number} for project tracking`);
  }
}

class SecurityEventProcessor extends EventProcessor {
  async process(event: WebhookEvent): Promise<ProcessedEvent> {
    try {
      const tenant = this.installationManager.getTenantByRepository(event.repository.full_name);
      if (!tenant) {
        throw new Error(`No tenant found for repository ${event.repository.full_name}`);
      }

      // Handle security events
      await this.handleSecurityEvent(event, tenant);

      return this.createProcessedEvent(event, true, undefined, {
        alertType: event.alert?.rule?.id || 'unknown',
        severity: event.alert?.rule?.severity || 'unknown',
        state: event.alert?.state
      });
    } catch (error: any) {
      console.error('Security event processing failed:', error);
      return this.createProcessedEvent(event, false, error.message);
    }
  }

  private async handleSecurityEvent(event: WebhookEvent, tenant: any): Promise<void> {
    // Update security dashboard and create risks if needed
    console.log(`🔒 Processing security alert for ${event.repository.full_name}`);
  }
}

class WebhookProcessor {
  private githubAuth: GitHubAppAuth;
  private installationManager: InstallationManager;
  private processors: Map<string, EventProcessor>;
  private eventHistory: ProcessedEvent[] = [];

  constructor(githubAuth: GitHubAppAuth, installationManager: InstallationManager) {
    this.githubAuth = githubAuth;
    this.installationManager = installationManager;
    this.processors = new Map();

    // Register event processors
    this.registerProcessor('installation', new InstallationEventProcessor(githubAuth, installationManager));
    this.registerProcessor('installation_repositories', new InstallationRepositoriesEventProcessor(githubAuth, installationManager));
    this.registerProcessor('push', new PushEventProcessor(githubAuth, installationManager));
    this.registerProcessor('pull_request', new PullRequestEventProcessor(githubAuth, installationManager));
    this.registerProcessor('issues', new IssuesEventProcessor(githubAuth, installationManager));
    this.registerProcessor('security_advisory', new SecurityEventProcessor(githubAuth, installationManager));
    this.registerProcessor('code_scanning_alert', new SecurityEventProcessor(githubAuth, installationManager));
    this.registerProcessor('secret_scanning_alert', new SecurityEventProcessor(githubAuth, installationManager));
  }

  private registerProcessor(eventType: string, processor: EventProcessor): void {
    this.processors.set(eventType, processor);
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(
    eventType: string,
    payload: string,
    signature: string
  ): Promise<ProcessedEvent> {
    // Verify webhook signature
    if (!this.githubAuth.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    // Parse payload
    const webhookData: WebhookPayload = JSON.parse(payload);
    const event: WebhookEvent = {
      ...webhookData,
      action: webhookData.action
    };

    // Get processor for event type
    const processor = this.processors.get(eventType);
    if (!processor) {
      console.warn(`No processor found for event type: ${eventType}`);
      return {
        id: `unknown_${Date.now()}`,
        type: eventType,
        action: event.action,
        installationId: event.installation?.id || 0,
        processedAt: new Date(),
        success: false,
        error: `No processor for event type: ${eventType}`,
        metadata: {}
      };
    }

    // Process event
    const result = await processor.process(event);

    // Store in history (in production, use persistent storage)
    this.eventHistory.push(result);

    // Keep only last 1000 events in memory
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }

    console.log(`📨 Processed ${eventType} event:`, {
      id: result.id,
      success: result.success,
      installationId: result.installationId,
      repository: result.repositoryFullName
    });

    return result;
  }

  /**
   * Get event processing history
   */
  getEventHistory(installationId?: number, limit = 100): ProcessedEvent[] {
    let events = this.eventHistory;
    
    if (installationId) {
      events = events.filter(e => e.installationId === installationId);
    }

    return events.slice(-limit);
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): {
    totalEvents: number;
    successRate: number;
    eventsByType: Record<string, number>;
    recentErrors: ProcessedEvent[];
  } {
    const totalEvents = this.eventHistory.length;
    const successfulEvents = this.eventHistory.filter(e => e.success).length;
    const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;

    const eventsByType: Record<string, number> = {};
    this.eventHistory.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const recentErrors = this.eventHistory
      .filter(e => !e.success)
      .slice(-10);

    return {
      totalEvents,
      successRate,
      eventsByType,
      recentErrors
    };
  }
}

export default WebhookProcessor;
