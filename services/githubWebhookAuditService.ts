import { AuditLogEntry, GitHubSettings } from '../types';
import { createPersistentAuditEntry, PersistentAuditService } from './persistentAuditService';

export interface GitHubWebhookEvent {
  eventType: 'push' | 'pull_request' | 'issues' | 'repository' | 'release' | 'workflow_run';
  action?: string;
  repository: {
    name: string;
    full_name: string;
    private: boolean;
  };
  sender: {
    login: string;
    type: 'User' | 'Bot';
  };
  timestamp: string;
}

export interface GitHubCommitAudit extends GitHubWebhookEvent {
  eventType: 'push';
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
    timestamp: string;
  }>;
  ref: string;
  before: string;
  after: string;
  ignitionGenerated: boolean;
}

export interface GitHubPullRequestAudit extends GitHubWebhookEvent {
  eventType: 'pull_request';
  action: 'opened' | 'closed' | 'merged' | 'edited' | 'review_requested';
  pull_request: {
    number: number;
    title: string;
    state: 'open' | 'closed';
    merged: boolean;
    base: { ref: string };
    head: { ref: string };
    user: { login: string };
  };
}

export interface ComplianceAuditEntry extends AuditLogEntry {
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  complianceFrameworks: Array<'SOC2' | 'ISO27001' | 'HIPAA' | 'FRE901' | 'FRE902'>;
  retentionPeriod: string; // ISO 8601 duration
  accessLevel: 'READ' | 'WRITE' | 'ADMIN' | 'SYSTEM';
  integrityHash?: string;
  previousEntryHash?: string;
  sourceSystem: 'IGNITION' | 'GITHUB_WEBHOOK' | 'MANUAL' | 'THIRD_PARTY';
}

export class GitHubWebhookAuditService {
  private persistentAuditService: PersistentAuditService;
  private githubSettings: GitHubSettings;
  private lastProcessedCommit: string | null = null;

  constructor(persistentAuditService: PersistentAuditService, githubSettings: GitHubSettings) {
    this.persistentAuditService = persistentAuditService;
    this.githubSettings = githubSettings;
  }

  /**
   * Process GitHub webhook payload and create audit entries
   */
  async processWebhookEvent(webhookPayload: any): Promise<ComplianceAuditEntry[]> {
    const auditEntries: ComplianceAuditEntry[] = [];

    try {
      switch (webhookPayload.eventType || this.detectEventType(webhookPayload)) {
        case 'push':
          auditEntries.push(...await this.processPushEvent(webhookPayload));
          break;
        case 'pull_request':
          auditEntries.push(await this.processPullRequestEvent(webhookPayload));
          break;
        case 'issues':
          auditEntries.push(await this.processIssueEvent(webhookPayload));
          break;
        case 'repository':
          auditEntries.push(await this.processRepositoryEvent(webhookPayload));
          break;
        case 'workflow_run':
          auditEntries.push(await this.processWorkflowEvent(webhookPayload));
          break;
        default:
          console.warn(`Unhandled webhook event type: ${webhookPayload.eventType}`);
      }

      // Save all audit entries to persistent storage
      if (auditEntries.length > 0) {
        await this.persistentAuditService.addAuditEntries(auditEntries);
        console.log(`📋 Processed ${auditEntries.length} webhook audit entries`);
      }

      return auditEntries;
    } catch (error: any) {
      console.error('Failed to process webhook event:', error);
      
      // Create error audit entry
      const errorEntry = this.createComplianceAuditEntry(
        'WEBHOOK_ERROR',
        `Failed to process GitHub webhook: ${error.message}`,
        { error: error.message, payload: webhookPayload },
        'SYSTEM',
        'INTERNAL',
        ['SOC2'],
        'SYSTEM'
      );
      
      await this.persistentAuditService.addAuditEntry(errorEntry);
      throw error;
    }
  }

  /**
   * Process push events (commits)
   */
  private async processPushEvent(payload: any): Promise<ComplianceAuditEntry[]> {
    const auditEntries: ComplianceAuditEntry[] = [];
    const commits = payload.commits || [];

    for (const commit of commits) {
      const isIgnitionGenerated = this.isIgnitionGeneratedCommit(commit.message);
      const filesChanged = [...(commit.added || []), ...(commit.modified || []), ...(commit.removed || [])];
      
      // Determine data classification based on files changed
      const dataClassification = this.classifyDataSensitivity(filesChanged);
      
      const auditEntry = this.createComplianceAuditEntry(
        'REPOSITORY_COMMIT',
        `Commit ${commit.id.substring(0, 7)}: ${commit.message}`,
        {
          commitId: commit.id,
          author: commit.author,
          filesChanged,
          ignitionGenerated: isIgnitionGenerated,
          ref: payload.ref,
          repository: payload.repository?.full_name
        },
        isIgnitionGenerated ? 'SYSTEM' : 'User',
        dataClassification,
        ['SOC2', 'ISO27001'],
        'WRITE',
        isIgnitionGenerated ? 'IGNITION' : 'GITHUB_WEBHOOK'
      );

      auditEntries.push(auditEntry);
    }

    this.lastProcessedCommit = payload.after;
    return auditEntries;
  }

  /**
   * Process pull request events
   */
  private async processPullRequestEvent(payload: any): Promise<ComplianceAuditEntry> {
    const pr = payload.pull_request;
    const action = payload.action;

    return this.createComplianceAuditEntry(
      'PULL_REQUEST_' + action.toUpperCase(),
      `Pull request #${pr.number} ${action}: ${pr.title}`,
      {
        prNumber: pr.number,
        action,
        state: pr.state,
        merged: pr.merged,
        author: pr.user?.login,
        baseBranch: pr.base?.ref,
        headBranch: pr.head?.ref
      },
      'User',
      'INTERNAL',
      ['SOC2', 'ISO27001'],
      'WRITE',
      'GITHUB_WEBHOOK'
    );
  }

  /**
   * Process issue events
   */
  private async processIssueEvent(payload: any): Promise<ComplianceAuditEntry> {
    const issue = payload.issue;
    const action = payload.action;

    return this.createComplianceAuditEntry(
      'ISSUE_' + action.toUpperCase(),
      `Issue #${issue.number} ${action}: ${issue.title}`,
      {
        issueNumber: issue.number,
        action,
        state: issue.state,
        author: issue.user?.login,
        labels: issue.labels?.map((l: any) => l.name) || []
      },
      'User',
      'INTERNAL',
      ['SOC2'],
      'WRITE',
      'GITHUB_WEBHOOK'
    );
  }

  /**
   * Process repository events (settings changes, etc.)
   */
  private async processRepositoryEvent(payload: any): Promise<ComplianceAuditEntry> {
    const action = payload.action;
    const repository = payload.repository;

    return this.createComplianceAuditEntry(
      'REPOSITORY_' + action.toUpperCase(),
      `Repository ${action}: ${repository.full_name}`,
      {
        action,
        repository: repository.full_name,
        private: repository.private,
        changes: payload.changes || {}
      },
      'User',
      'CONFIDENTIAL',
      ['SOC2', 'ISO27001'],
      'ADMIN',
      'GITHUB_WEBHOOK'
    );
  }

  /**
   * Process workflow run events
   */
  private async processWorkflowEvent(payload: any): Promise<ComplianceAuditEntry> {
    const workflow = payload.workflow_run;
    const action = payload.action;

    return this.createComplianceAuditEntry(
      'WORKFLOW_' + action.toUpperCase(),
      `Workflow ${workflow.name} ${action}: ${workflow.conclusion || workflow.status}`,
      {
        workflowId: workflow.id,
        workflowName: workflow.name,
        action,
        status: workflow.status,
        conclusion: workflow.conclusion,
        headBranch: workflow.head_branch,
        actor: workflow.actor?.login
      },
      'Automation',
      'INTERNAL',
      ['SOC2'],
      'SYSTEM',
      'GITHUB_WEBHOOK'
    );
  }

  /**
   * Create compliance-enhanced audit entry
   */
  private createComplianceAuditEntry(
    eventType: string,
    summary: string,
    details: Record<string, any>,
    actor: 'User' | 'AI' | 'System' | 'Automation',
    dataClassification: ComplianceAuditEntry['dataClassification'],
    complianceFrameworks: ComplianceAuditEntry['complianceFrameworks'],
    accessLevel: ComplianceAuditEntry['accessLevel'],
    sourceSystem: ComplianceAuditEntry['sourceSystem'] = 'GITHUB_WEBHOOK'
  ): ComplianceAuditEntry {
    const baseEntry = createPersistentAuditEntry(eventType, summary, details, actor);
    
    return {
      ...baseEntry,
      dataClassification,
      complianceFrameworks,
      retentionPeriod: this.getRetentionPeriod(complianceFrameworks),
      accessLevel,
      sourceSystem,
      details: {
        ...details,
        webhookProcessed: true,
        complianceEnhanced: true
      }
    };
  }

  /**
   * Detect event type from webhook payload
   */
  private detectEventType(payload: any): string {
    if (payload.commits) return 'push';
    if (payload.pull_request) return 'pull_request';
    if (payload.issue) return 'issues';
    if (payload.repository && payload.action) return 'repository';
    if (payload.workflow_run) return 'workflow_run';
    return 'unknown';
  }

  /**
   * Check if commit was generated by Ignition
   */
  private isIgnitionGeneratedCommit(commitMessage: string): boolean {
    const ignitionPatterns = [
      /^feat: add .* \(Ignition AI\)/,
      /^audit: /,
      /^docs: /,
      /^ci: add Ignition testing workflow/,
      /Ignition AI Dashboard/,
      /meta-compliance/i
    ];
    
    return ignitionPatterns.some(pattern => pattern.test(commitMessage));
  }

  /**
   * Classify data sensitivity based on files changed
   */
  private classifyDataSensitivity(files: string[]): ComplianceAuditEntry['dataClassification'] {
    const confidentialPatterns = ['.env', 'secrets', 'private-key', 'certificate'];
    const restrictedPatterns = ['audit-log.json', 'compliance-report'];
    
    if (files.some(f => restrictedPatterns.some(p => f.includes(p)))) return 'RESTRICTED';
    if (files.some(f => confidentialPatterns.some(p => f.includes(p)))) return 'CONFIDENTIAL';
    if (files.some(f => f.includes('ignition-project.json'))) return 'INTERNAL';
    return 'PUBLIC';
  }

  /**
   * Get retention period based on compliance frameworks
   */
  private getRetentionPeriod(frameworks: ComplianceAuditEntry['complianceFrameworks']): string {
    if (frameworks.includes('HIPAA')) return 'P6Y'; // 6 years
    if (frameworks.includes('SOC2')) return 'P3Y'; // 3 years
    if (frameworks.includes('ISO27001')) return 'P3Y'; // 3 years
    return 'P1Y'; // 1 year default
  }
}

/**
 * Create GitHub webhook audit service
 */
export function createGitHubWebhookAuditService(
  persistentAuditService: PersistentAuditService,
  githubSettings: GitHubSettings
): GitHubWebhookAuditService {
  return new GitHubWebhookAuditService(persistentAuditService, githubSettings);
}
