# Ignition GitHub App - Technical Specification

## Overview

This document provides detailed technical specifications for the Ignition GitHub App, including API endpoints, permission scopes, webhook events, data models, and integration patterns required for enterprise deployment.

## GitHub App Configuration

### App Manifest
```yaml
name: "Ignition AI Project Dashboard"
url: "https://ignition.ai"
hook_attributes:
  url: "https://api.ignition.ai/webhooks/github"
  active: true
redirect_url: "https://app.ignition.ai/auth/github/callback"
description: "Enterprise-grade meta-compliance project management and organizational intelligence platform"
public: true
default_events:
  - push
  - pull_request
  - pull_request_review
  - issues
  - issue_comment
  - repository
  - release
  - security_advisory
  - dependabot_alert
  - code_scanning_alert
  - secret_scanning_alert
  - installation
  - installation_repositories
  - organization
  - member
default_permissions:
  # Repository permissions
  contents: read
  issues: write
  pull_requests: write
  security_events: read
  metadata: read
  actions: read
  checks: read
  # Organization permissions
  members: read
  administration: read
  organization_plan: read
```

### Permission Scopes

#### Repository Permissions
| Permission | Level | Purpose |
|------------|-------|---------|
| `contents` | read | Access repository files and project data |
| `issues` | write | Create, update, and manage issues |
| `pull_requests` | write | Review and manage pull requests |
| `security_events` | read | Monitor security vulnerabilities |
| `metadata` | read | Access repository metadata |
| `actions` | read | Monitor CI/CD pipeline status |
| `checks` | read | Access check run results |

#### Organization Permissions
| Permission | Level | Purpose |
|------------|-------|---------|
| `members` | read | Access organization member information |
| `administration` | read | Organization-level insights |
| `organization_plan` | read | Billing and usage analytics |

## API Endpoints

### Authentication Endpoints
```typescript
// GitHub App authentication
POST /auth/github/app
{
  "installation_id": number,
  "code": string
}
Response: {
  "access_token": string,
  "expires_at": string,
  "installation": Installation
}

// Refresh installation token
POST /auth/github/refresh
{
  "installation_id": number
}
Response: {
  "access_token": string,
  "expires_at": string
}
```

### Installation Management
```typescript
// Get installation details
GET /api/installations/{installation_id}
Response: {
  "id": number,
  "account": {
    "login": string,
    "type": "Organization" | "User",
    "avatar_url": string
  },
  "repositories": Repository[],
  "settings": InstallationSettings,
  "subscription": SubscriptionInfo
}

// Update installation settings
PUT /api/installations/{installation_id}/settings
{
  "compliance_standards": string[],
  "audit_level": "basic" | "enhanced" | "enterprise",
  "notifications": NotificationSettings
}

// Get installation repositories
GET /api/installations/{installation_id}/repositories
Response: {
  "repositories": Repository[],
  "total_count": number
}
```

### Repository Management
```typescript
// Get repository overview
GET /api/repositories/{owner}/{repo}
Response: {
  "repository": Repository,
  "project_data": ProjectData,
  "security_overview": SecurityOverview,
  "compliance_status": ComplianceStatus
}

// Sync repository data
POST /api/repositories/{owner}/{repo}/sync
{
  "force": boolean
}
Response: {
  "status": "success" | "error",
  "last_sync": string,
  "changes": SyncChanges
}

// Get repository analytics
GET /api/repositories/{owner}/{repo}/analytics
Query: {
  "period": "7d" | "30d" | "90d" | "1y",
  "metrics": string[]
}
Response: {
  "metrics": AnalyticsData,
  "trends": TrendData
}
```

### Organization Dashboard
```typescript
// Get organization overview
GET /api/organizations/{org}/dashboard
Response: {
  "organization": Organization,
  "repositories": Repository[],
  "compliance_scorecard": ComplianceScorecard,
  "security_posture": SecurityPosture,
  "analytics": OrganizationAnalytics
}

// Get organization compliance report
GET /api/organizations/{org}/compliance
Query: {
  "standards": string[],
  "format": "json" | "pdf" | "csv"
}
Response: ComplianceReport
```

## Data Models

### Installation
```typescript
interface Installation {
  id: number;
  account: {
    login: string;
    type: 'Organization' | 'User';
    avatar_url: string;
    html_url: string;
  };
  app_id: number;
  target_id: number;
  target_type: 'Organization' | 'User';
  permissions: Permissions;
  events: string[];
  created_at: string;
  updated_at: string;
  single_file_name?: string;
  repository_selection: 'all' | 'selected';
  access_tokens_url: string;
  repositories_url: string;
  html_url: string;
  suspended_by?: User;
  suspended_at?: string;
}

interface InstallationSettings {
  compliance_standards: string[];
  audit_level: 'basic' | 'enhanced' | 'enterprise';
  notifications: NotificationSettings;
  security_policies: SecurityPolicy[];
  custom_fields: Record<string, any>;
}
```

### Repository
```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: 'Organization' | 'User';
  };
  private: boolean;
  html_url: string;
  description?: string;
  language?: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  visibility: 'public' | 'private' | 'internal';
  archived: boolean;
  disabled: boolean;
}

interface ProjectData {
  project_info: {
    name: string;
    version: string;
    description?: string;
    created: string;
    updated: string;
  };
  documents: Document[];
  requirements: Requirement[];
  risks: Risk[];
  test_cases: TestCase[];
  configuration_items: ConfigurationItem[];
  audit_log: AuditLogEntry[];
  compliance_status: ComplianceStatus;
}
```

### Security Models
```typescript
interface SecurityOverview {
  vulnerability_alerts: VulnerabilityAlert[];
  code_scanning_alerts: CodeScanningAlert[];
  secret_scanning_alerts: SecretScanningAlert[];
  dependabot_alerts: DependabotAlert[];
  security_policies: SecurityPolicy[];
  branch_protection: BranchProtection;
  security_score: number; // 0-100
  last_assessment: string;
}

interface VulnerabilityAlert {
  id: number;
  state: 'open' | 'dismissed' | 'fixed';
  dependency: {
    package: {
      name: string;
      ecosystem: string;
    };
    manifest_path: string;
    scope: 'runtime' | 'development';
  };
  security_advisory: {
    ghsa_id: string;
    cve_id?: string;
    summary: string;
    description: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    cvss: {
      score: number;
      vector_string: string;
    };
  };
  security_vulnerability: {
    package: {
      name: string;
      ecosystem: string;
    };
    severity: 'low' | 'moderate' | 'high' | 'critical';
    vulnerable_version_range: string;
    first_patched_version?: {
      identifier: string;
    };
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  dismissed_at?: string;
  dismissed_by?: User;
  dismissed_reason?: string;
  dismissed_comment?: string;
  fixed_at?: string;
}
```

## Webhook Events

### Event Processing
```typescript
interface WebhookEvent {
  action: string;
  installation?: Installation;
  organization?: Organization;
  repository?: Repository;
  sender: User;
  [key: string]: any;
}

class WebhookProcessor {
  async processEvent(event: WebhookEvent, eventType: string): Promise<void> {
    const processor = this.getProcessor(eventType);
    await processor.handle(event);
    await this.auditLog.record(eventType, event);
  }

  private getProcessor(eventType: string): EventProcessor {
    switch (eventType) {
      case 'push': return new PushEventProcessor();
      case 'pull_request': return new PullRequestEventProcessor();
      case 'issues': return new IssueEventProcessor();
      case 'security_advisory': return new SecurityEventProcessor();
      case 'installation': return new InstallationEventProcessor();
      default: return new DefaultEventProcessor();
    }
  }
}
```

### Event Types

#### Repository Events
- **push**: Code changes and commits
- **pull_request**: Pull request lifecycle
- **pull_request_review**: Code review activities
- **issues**: Issue management
- **issue_comment**: Issue discussions
- **release**: Software releases
- **repository**: Repository configuration changes

#### Security Events
- **security_advisory**: Security advisories
- **dependabot_alert**: Dependency vulnerabilities
- **code_scanning_alert**: Static analysis results
- **secret_scanning_alert**: Exposed secrets

#### Installation Events
- **installation**: App installation/uninstallation
- **installation_repositories**: Repository access changes

#### Organization Events
- **organization**: Organization changes
- **member**: Membership changes

## Integration Patterns

### Real-time Synchronization
```typescript
class RealtimeSync {
  async syncRepository(installation: Installation, repository: Repository): Promise<void> {
    const projectData = await this.fetchProjectData(repository);
    const securityData = await this.fetchSecurityData(repository);
    const complianceStatus = await this.assessCompliance(projectData);
    
    await this.updateDashboard({
      repository,
      projectData,
      securityData,
      complianceStatus
    });
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    switch (event.action) {
      case 'synchronize':
        await this.syncRepository(event.installation, event.repository);
        break;
      case 'opened':
        await this.analyzeNewContent(event);
        break;
      case 'closed':
        await this.updateMetrics(event);
        break;
    }
  }
}
```

### Batch Processing
```typescript
class BatchProcessor {
  async processOrganization(installation: Installation): Promise<void> {
    const repositories = await this.getRepositories(installation);
    const batches = this.createBatches(repositories, 10);
    
    for (const batch of batches) {
      await Promise.all(
        batch.map(repo => this.processRepository(installation, repo))
      );
      await this.delay(1000); // Rate limiting
    }
  }

  async generateComplianceReport(installation: Installation): Promise<ComplianceReport> {
    const repositories = await this.getRepositories(installation);
    const assessments = await Promise.all(
      repositories.map(repo => this.assessCompliance(repo))
    );
    
    return this.aggregateAssessments(assessments);
  }
}
```

## Error Handling

### Rate Limiting
```typescript
class RateLimitHandler {
  async makeRequest(url: string, options: RequestOptions): Promise<Response> {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const resetTime = response.headers.get('x-ratelimit-reset');
      const waitTime = (parseInt(resetTime) * 1000) - Date.now();
      
      await this.delay(waitTime);
      return this.makeRequest(url, options);
    }
    
    return response;
  }
}
```

### Error Recovery
```typescript
class ErrorRecovery {
  async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await this.delay(delay);
      }
    }
  }
}
```

---

*This technical specification provides the detailed implementation requirements for the Ignition GitHub App enterprise deployment.*
