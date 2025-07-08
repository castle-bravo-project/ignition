/**
 * Installation Manager - Multi-Tenant Architecture
 * 
 * Manages GitHub App installations, tenant isolation, and organization-wide deployment.
 * Provides the foundation for enterprise-grade multi-tenant SaaS architecture.
 */

import GitHubAppAuth, { Installation, Repository, WebhookEvent } from './githubAppAuth';
import { ProjectData } from '../types';

export interface TenantSettings {
  complianceStandards: string[];
  auditLevel: 'basic' | 'enhanced' | 'enterprise';
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };
  securityPolicies: {
    branchProtection: boolean;
    requireReviews: boolean;
    dismissStaleReviews: boolean;
    requireCodeOwnerReviews: boolean;
    restrictPushes: boolean;
  };
  features: {
    relationshipGraph: boolean;
    aiAssistant: boolean;
    complianceModule: boolean;
    securityDashboard: boolean;
    organizationalIntelligence: boolean;
    processAssetFramework: boolean;
  };
  customFields: Record<string, any>;
}

export interface TenantData {
  installationId: number;
  organizationLogin: string;
  organizationType: 'Organization' | 'User';
  settings: TenantSettings;
  repositories: Repository[];
  projectData: Record<string, ProjectData>; // keyed by repository full_name
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    features: string[];
    limits: {
      repositories: number;
      users: number;
      storage: number; // in MB
    };
  };
  usage: {
    repositories: number;
    users: number;
    storage: number;
    apiCalls: number;
    lastActivity: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InstallationEvent {
  type: 'installation' | 'installation_repositories';
  action: 'created' | 'deleted' | 'suspend' | 'unsuspend' | 'added' | 'removed';
  installation: Installation;
  repositories?: Repository[];
}

class InstallationManager {
  private githubAuth: GitHubAppAuth;
  private tenants: Map<number, TenantData> = new Map();
  private repositoryIndex: Map<string, number> = new Map(); // repo full_name -> installation_id

  constructor(githubAuth: GitHubAppAuth) {
    this.githubAuth = githubAuth;
  }

  /**
   * Handle new installation
   */
  async handleInstallation(event: InstallationEvent): Promise<TenantData> {
    const { installation } = event;

    switch (event.action) {
      case 'created':
        return this.createTenant(installation);
      case 'deleted':
        return this.deleteTenant(installation.id);
      case 'suspend':
        return this.suspendTenant(installation.id);
      case 'unsuspend':
        return this.unsuspendTenant(installation.id);
      default:
        throw new Error(`Unknown installation action: ${event.action}`);
    }
  }

  /**
   * Handle repository changes
   */
  async handleRepositoryChanges(event: InstallationEvent): Promise<TenantData> {
    const { installation, repositories = [] } = event;

    switch (event.action) {
      case 'added':
        return this.addRepositories(installation.id, repositories);
      case 'removed':
        return this.removeRepositories(installation.id, repositories);
      default:
        throw new Error(`Unknown repository action: ${event.action}`);
    }
  }

  /**
   * Create new tenant for installation
   */
  private async createTenant(installation: Installation): Promise<TenantData> {
    // Get repositories for this installation
    const repositories = await this.githubAuth.getInstallationRepositories(installation.id);

    // Determine subscription plan based on organization type and size
    const plan = this.determineSubscriptionPlan(installation, repositories);

    const tenantData: TenantData = {
      installationId: installation.id,
      organizationLogin: installation.account.login,
      organizationType: installation.account.type,
      settings: this.getDefaultSettings(),
      repositories,
      projectData: {},
      subscription: {
        plan,
        status: 'active',
        features: this.getPlanFeatures(plan),
        limits: this.getPlanLimits(plan)
      },
      usage: {
        repositories: repositories.length,
        users: 1, // Will be updated based on actual usage
        storage: 0,
        apiCalls: 0,
        lastActivity: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store tenant data
    this.tenants.set(installation.id, tenantData);

    // Update repository index
    repositories.forEach(repo => {
      this.repositoryIndex.set(repo.full_name, installation.id);
    });

    // Initialize project data for each repository
    await this.initializeRepositoryProjects(tenantData);

    console.log(`✅ Created tenant for ${installation.account.login} (${installation.account.type})`);
    return tenantData;
  }

  /**
   * Delete tenant and cleanup data
   */
  private async deleteTenant(installationId: number): Promise<TenantData> {
    const tenant = this.tenants.get(installationId);
    if (!tenant) {
      throw new Error(`Tenant not found for installation ${installationId}`);
    }

    // Remove from repository index
    tenant.repositories.forEach(repo => {
      this.repositoryIndex.delete(repo.full_name);
    });

    // Archive tenant data (in production, move to archive storage)
    const archivedTenant = { ...tenant, deletedAt: new Date() };

    // Remove from active tenants
    this.tenants.delete(installationId);

    console.log(`🗑️ Deleted tenant for ${tenant.organizationLogin}`);
    return archivedTenant;
  }

  /**
   * Suspend tenant
   */
  private async suspendTenant(installationId: number): Promise<TenantData> {
    const tenant = this.getTenant(installationId);
    tenant.subscription.status = 'suspended';
    tenant.updatedAt = new Date();

    console.log(`⏸️ Suspended tenant for ${tenant.organizationLogin}`);
    return tenant;
  }

  /**
   * Unsuspend tenant
   */
  private async unsuspendTenant(installationId: number): Promise<TenantData> {
    const tenant = this.getTenant(installationId);
    tenant.subscription.status = 'active';
    tenant.updatedAt = new Date();

    console.log(`▶️ Unsuspended tenant for ${tenant.organizationLogin}`);
    return tenant;
  }

  /**
   * Add repositories to tenant
   */
  private async addRepositories(installationId: number, repositories: Repository[]): Promise<TenantData> {
    const tenant = this.getTenant(installationId);

    // Add new repositories
    repositories.forEach(repo => {
      if (!tenant.repositories.find(r => r.id === repo.id)) {
        tenant.repositories.push(repo);
        this.repositoryIndex.set(repo.full_name, installationId);
      }
    });

    // Update usage
    tenant.usage.repositories = tenant.repositories.length;
    tenant.updatedAt = new Date();

    // Initialize project data for new repositories
    await this.initializeRepositoryProjects(tenant, repositories);

    console.log(`➕ Added ${repositories.length} repositories to ${tenant.organizationLogin}`);
    return tenant;
  }

  /**
   * Remove repositories from tenant
   */
  private async removeRepositories(installationId: number, repositories: Repository[]): Promise<TenantData> {
    const tenant = this.getTenant(installationId);

    // Remove repositories
    repositories.forEach(repo => {
      tenant.repositories = tenant.repositories.filter(r => r.id !== repo.id);
      this.repositoryIndex.delete(repo.full_name);
      delete tenant.projectData[repo.full_name];
    });

    // Update usage
    tenant.usage.repositories = tenant.repositories.length;
    tenant.updatedAt = new Date();

    console.log(`➖ Removed ${repositories.length} repositories from ${tenant.organizationLogin}`);
    return tenant;
  }

  /**
   * Get tenant by installation ID
   */
  getTenant(installationId: number): TenantData {
    const tenant = this.tenants.get(installationId);
    if (!tenant) {
      throw new Error(`Tenant not found for installation ${installationId}`);
    }
    return tenant;
  }

  /**
   * Get tenant by repository
   */
  getTenantByRepository(repositoryFullName: string): TenantData | null {
    const installationId = this.repositoryIndex.get(repositoryFullName);
    return installationId ? this.tenants.get(installationId) || null : null;
  }

  /**
   * Get all tenants
   */
  getAllTenants(): TenantData[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Update tenant settings
   */
  updateTenantSettings(installationId: number, settings: Partial<TenantSettings>): TenantData {
    const tenant = this.getTenant(installationId);
    tenant.settings = { ...tenant.settings, ...settings };
    tenant.updatedAt = new Date();
    return tenant;
  }

  /**
   * Check feature access for tenant
   */
  hasFeatureAccess(installationId: number, feature: string): boolean {
    const tenant = this.getTenant(installationId);
    return tenant.subscription.features.includes(feature) && 
           tenant.settings.features[feature as keyof typeof tenant.settings.features];
  }

  /**
   * Update usage metrics
   */
  updateUsage(installationId: number, usage: Partial<TenantData['usage']>): void {
    const tenant = this.getTenant(installationId);
    tenant.usage = { ...tenant.usage, ...usage, lastActivity: new Date() };
    tenant.updatedAt = new Date();
  }

  /**
   * Get default tenant settings
   */
  private getDefaultSettings(): TenantSettings {
    return {
      complianceStandards: ['ISO27001', 'SOC2'],
      auditLevel: 'basic',
      notifications: {
        email: true,
        slack: false,
        webhook: false
      },
      securityPolicies: {
        branchProtection: true,
        requireReviews: true,
        dismissStaleReviews: false,
        requireCodeOwnerReviews: false,
        restrictPushes: false
      },
      features: {
        relationshipGraph: true,
        aiAssistant: true,
        complianceModule: true,
        securityDashboard: true,
        organizationalIntelligence: false,
        processAssetFramework: true
      },
      customFields: {}
    };
  }

  /**
   * Determine subscription plan based on organization
   */
  private determineSubscriptionPlan(installation: Installation, repositories: Repository[]): 'free' | 'pro' | 'enterprise' {
    if (installation.account.type === 'Organization' && repositories.length > 10) {
      return 'enterprise';
    } else if (repositories.length > 5) {
      return 'pro';
    }
    return 'free';
  }

  /**
   * Get features for subscription plan
   */
  private getPlanFeatures(plan: string): string[] {
    switch (plan) {
      case 'enterprise':
        return ['all_features', 'custom_compliance', 'sso', 'priority_support', 'advanced_analytics'];
      case 'pro':
        return ['advanced_features', 'compliance_standards', 'priority_support'];
      case 'free':
      default:
        return ['basic_features'];
    }
  }

  /**
   * Get limits for subscription plan
   */
  private getPlanLimits(plan: string): TenantData['subscription']['limits'] {
    switch (plan) {
      case 'enterprise':
        return { repositories: -1, users: -1, storage: 10000 }; // Unlimited
      case 'pro':
        return { repositories: 50, users: 100, storage: 5000 };
      case 'free':
      default:
        return { repositories: 5, users: 10, storage: 1000 };
    }
  }

  /**
   * Initialize project data for repositories
   */
  private async initializeRepositoryProjects(tenant: TenantData, repositories?: Repository[]): Promise<void> {
    const reposToInit = repositories || tenant.repositories;
    
    for (const repo of reposToInit) {
      if (!tenant.projectData[repo.full_name]) {
        // Initialize with basic project structure
        tenant.projectData[repo.full_name] = {
          projectName: repo.name,
          documents: {},
          requirements: [],
          testCases: [],
          risks: [],
          configurationItems: [],
          links: {},
          auditLog: [],
          processAssets: [],
          organizationalData: {
            projects: [],
            assets: [],
            metrics: {
              totalProjects: 1,
              totalAssets: 0,
              avgAssetReuse: 0,
              organizationalMaturityLevel: 1
            }
          }
        };
      }
    }
  }
}

export default InstallationManager;
