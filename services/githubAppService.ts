/**
 * GitHub App Service - Enterprise Integration Layer
 * 
 * Main service that orchestrates GitHub App authentication, installation management,
 * and webhook processing for enterprise deployment.
 */

import GitHubAppAuth, { GitHubAppConfig, Installation, Repository } from './githubAppAuth';
import InstallationManager, { TenantData, TenantSettings } from './installationManager';
import WebhookProcessor, { ProcessedEvent } from './webhookProcessor';
import { ProjectData } from '../types';

export interface GitHubAppServiceConfig extends GitHubAppConfig {
  enableWebhooks: boolean;
  webhookEndpoint?: string;
  enableRealTimeSync: boolean;
  enableComplianceChecks: boolean;
}

export interface OrganizationOverview {
  installation: Installation;
  tenant: TenantData;
  repositories: Repository[];
  projectSummary: {
    totalProjects: number;
    activeProjects: number;
    complianceScore: number;
    securityScore: number;
    lastActivity: Date;
  };
  usage: {
    apiCallsToday: number;
    storageUsed: number;
    featuresUsed: string[];
  };
}

export interface AppMetrics {
  totalInstallations: number;
  activeInstallations: number;
  totalRepositories: number;
  totalUsers: number;
  apiCallsToday: number;
  webhookEventsToday: number;
  averageResponseTime: number;
  errorRate: number;
}

class GitHubAppService {
  private config: GitHubAppServiceConfig;
  private githubAuth: GitHubAppAuth;
  private installationManager: InstallationManager;
  private webhookProcessor: WebhookProcessor;
  private isInitialized = false;

  constructor(config: GitHubAppServiceConfig) {
    this.config = config;
    this.githubAuth = new GitHubAppAuth(config);
    this.installationManager = new InstallationManager(this.githubAuth);
    this.webhookProcessor = new WebhookProcessor(this.githubAuth, this.installationManager);
  }

  /**
   * Initialize the GitHub App service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test GitHub App authentication
      await this.githubAuth.generateJWT();
      console.log('✅ GitHub App authentication verified');

      // Load existing installations
      await this.loadExistingInstallations();
      console.log('✅ Existing installations loaded');

      this.isInitialized = true;
      console.log('🚀 GitHub App Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize GitHub App Service:', error);
      throw error;
    }
  }

  /**
   * Load existing installations from GitHub
   */
  private async loadExistingInstallations(): Promise<void> {
    try {
      const installations = await this.githubAuth.getInstallations();
      console.log(`📥 Found ${installations.length} existing installations`);

      for (const installation of installations) {
        try {
          // Create tenant for existing installation
          await this.installationManager.handleInstallation({
            type: 'installation',
            action: 'created',
            installation
          });
        } catch (error) {
          console.error(`Failed to load installation ${installation.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load existing installations:', error);
      throw error;
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(
    eventType: string,
    payload: string,
    signature: string
  ): Promise<ProcessedEvent> {
    if (!this.isInitialized) {
      throw new Error('GitHub App Service not initialized');
    }

    if (!this.config.enableWebhooks) {
      throw new Error('Webhooks are disabled');
    }

    return this.webhookProcessor.processWebhook(eventType, payload, signature);
  }

  /**
   * Get organization overview
   */
  async getOrganizationOverview(installationId: number): Promise<OrganizationOverview> {
    const installation = await this.githubAuth.getInstallation(installationId);
    const tenant = this.installationManager.getTenant(installationId);
    const repositories = await this.githubAuth.getInstallationRepositories(installationId);

    // Calculate project summary
    const projectSummary = this.calculateProjectSummary(tenant);

    // Calculate usage metrics
    const usage = this.calculateUsageMetrics(tenant);

    return {
      installation,
      tenant,
      repositories,
      projectSummary,
      usage
    };
  }

  /**
   * Get all installations overview
   */
  async getAllInstallationsOverview(): Promise<OrganizationOverview[]> {
    const tenants = this.installationManager.getAllTenants();
    const overviews: OrganizationOverview[] = [];

    for (const tenant of tenants) {
      try {
        const overview = await this.getOrganizationOverview(tenant.installationId);
        overviews.push(overview);
      } catch (error) {
        console.error(`Failed to get overview for installation ${tenant.installationId}:`, error);
      }
    }

    return overviews;
  }

  /**
   * Update tenant settings
   */
  updateTenantSettings(installationId: number, settings: Partial<TenantSettings>): TenantData {
    return this.installationManager.updateTenantSettings(installationId, settings);
  }

  /**
   * Check feature access
   */
  hasFeatureAccess(installationId: number, feature: string): boolean {
    return this.installationManager.hasFeatureAccess(installationId, feature);
  }

  /**
   * Get project data for repository
   */
  getProjectData(repositoryFullName: string): ProjectData | null {
    const tenant = this.installationManager.getTenantByRepository(repositoryFullName);
    return tenant?.projectData[repositoryFullName] || null;
  }

  /**
   * Update project data for repository
   */
  updateProjectData(repositoryFullName: string, projectData: ProjectData): void {
    const tenant = this.installationManager.getTenantByRepository(repositoryFullName);
    if (!tenant) {
      throw new Error(`No tenant found for repository ${repositoryFullName}`);
    }

    tenant.projectData[repositoryFullName] = projectData;
    this.installationManager.updateUsage(tenant.installationId, {
      storage: this.calculateStorageUsage(tenant)
    });
  }

  /**
   * Make authenticated API request for installation
   */
  async makeInstallationRequest(
    installationId: number,
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    return this.githubAuth.makeInstallationRequest(installationId, url, options);
  }

  /**
   * Get app-wide metrics
   */
  getAppMetrics(): AppMetrics {
    const tenants = this.installationManager.getAllTenants();
    const webhookStats = this.webhookProcessor.getProcessingStats();

    const totalInstallations = tenants.length;
    const activeInstallations = tenants.filter(t => t.subscription.status === 'active').length;
    const totalRepositories = tenants.reduce((sum, t) => sum + t.repositories.length, 0);
    const totalUsers = tenants.reduce((sum, t) => sum + t.usage.users, 0);
    const apiCallsToday = tenants.reduce((sum, t) => sum + t.usage.apiCalls, 0);

    return {
      totalInstallations,
      activeInstallations,
      totalRepositories,
      totalUsers,
      apiCallsToday,
      webhookEventsToday: webhookStats.totalEvents,
      averageResponseTime: 150, // TODO: Calculate from actual metrics
      errorRate: 100 - webhookStats.successRate
    };
  }

  /**
   * Get webhook processing history
   */
  getWebhookHistory(installationId?: number, limit = 100): ProcessedEvent[] {
    return this.webhookProcessor.getEventHistory(installationId, limit);
  }

  /**
   * Get webhook processing statistics
   */
  getWebhookStats() {
    return this.webhookProcessor.getProcessingStats();
  }

  /**
   * Sync repository data
   */
  async syncRepository(repositoryFullName: string): Promise<void> {
    const tenant = this.installationManager.getTenantByRepository(repositoryFullName);
    if (!tenant) {
      throw new Error(`No tenant found for repository ${repositoryFullName}`);
    }

    // TODO: Implement repository data synchronization
    console.log(`🔄 Syncing repository data for ${repositoryFullName}`);
    
    // Update last activity
    this.installationManager.updateUsage(tenant.installationId, {
      lastActivity: new Date()
    });
  }

  /**
   * Calculate project summary for tenant
   */
  private calculateProjectSummary(tenant: TenantData) {
    const projects = Object.values(tenant.projectData);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      p.requirements.length > 0 || p.testCases.length > 0
    ).length;

    // Calculate compliance score (simplified)
    const complianceScore = projects.reduce((sum, project) => {
      const reqsWithTests = project.requirements.filter(req => 
        project.links[req.id]?.tests?.length > 0
      ).length;
      const coverage = project.requirements.length > 0 ? 
        (reqsWithTests / project.requirements.length) * 100 : 0;
      return sum + coverage;
    }, 0) / Math.max(totalProjects, 1);

    // Calculate security score (simplified)
    const securityScore = 85; // TODO: Calculate from actual security data

    const lastActivity = tenant.usage.lastActivity;

    return {
      totalProjects,
      activeProjects,
      complianceScore: Math.round(complianceScore),
      securityScore,
      lastActivity
    };
  }

  /**
   * Calculate usage metrics for tenant
   */
  private calculateUsageMetrics(tenant: TenantData) {
    const featuresUsed = Object.entries(tenant.settings.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature);

    return {
      apiCallsToday: tenant.usage.apiCalls,
      storageUsed: tenant.usage.storage,
      featuresUsed
    };
  }

  /**
   * Calculate storage usage for tenant
   */
  private calculateStorageUsage(tenant: TenantData): number {
    // Simplified storage calculation
    const projectDataSize = JSON.stringify(tenant.projectData).length;
    return Math.round(projectDataSize / 1024); // Convert to KB
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down GitHub App Service...');
    
    // Clear token cache
    this.githubAuth.clearTokenCache();
    
    this.isInitialized = false;
    console.log('✅ GitHub App Service shutdown complete');
  }
}

export default GitHubAppService;
