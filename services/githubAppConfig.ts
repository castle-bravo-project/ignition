/**
 * GitHub App Configuration & Initialization
 * 
 * Configuration management and service initialization for GitHub App deployment.
 * Handles environment variables, feature flags, and service orchestration.
 */

import GitHubAppService, { GitHubAppServiceConfig } from './githubAppService';

export interface AppEnvironment {
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  
  // GitHub App Configuration
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_WEBHOOK_SECRET: string;
  GITHUB_APP_CLIENT_ID?: string;
  GITHUB_APP_CLIENT_SECRET?: string;
  
  // Feature Flags
  ENABLE_WEBHOOKS: boolean;
  ENABLE_REAL_TIME_SYNC: boolean;
  ENABLE_COMPLIANCE_CHECKS: boolean;
  ENABLE_AI_FEATURES: boolean;
  
  // API Configuration
  API_BASE_URL: string;
  WEBHOOK_ENDPOINT: string;
  
  // Database Configuration (for future use)
  DATABASE_URL?: string;
  REDIS_URL?: string;
  
  // Monitoring & Analytics
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // Security
  ENCRYPTION_KEY: string;
  SESSION_SECRET: string;
  CORS_ORIGINS: string[];
}

class GitHubAppConfig {
  private static instance: GitHubAppConfig;
  private environment: AppEnvironment;
  private githubAppService: GitHubAppService | null = null;

  private constructor() {
    this.environment = this.loadEnvironment();
    this.validateConfiguration();
  }

  static getInstance(): GitHubAppConfig {
    if (!GitHubAppConfig.instance) {
      GitHubAppConfig.instance = new GitHubAppConfig();
    }
    return GitHubAppConfig.instance;
  }

  /**
   * Load environment configuration
   */
  private loadEnvironment(): AppEnvironment {
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      PORT: parseInt(process.env.PORT || '3000'),
      
      // GitHub App Configuration
      GITHUB_APP_ID: process.env.VITE_GITHUB_APP_ID || process.env.GITHUB_APP_ID || '',
      GITHUB_APP_PRIVATE_KEY: this.loadPrivateKey(),
      GITHUB_APP_WEBHOOK_SECRET: process.env.VITE_GITHUB_APP_WEBHOOK_SECRET || process.env.GITHUB_APP_WEBHOOK_SECRET || '',
      GITHUB_APP_CLIENT_ID: process.env.VITE_GITHUB_APP_CLIENT_ID || process.env.GITHUB_APP_CLIENT_ID,
      GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET,
      
      // Feature Flags
      ENABLE_WEBHOOKS: this.parseBoolean(process.env.VITE_ENABLE_WEBHOOKS || process.env.ENABLE_WEBHOOKS, true),
      ENABLE_REAL_TIME_SYNC: this.parseBoolean(process.env.VITE_ENABLE_REAL_TIME_SYNC || process.env.ENABLE_REAL_TIME_SYNC, true),
      ENABLE_COMPLIANCE_CHECKS: this.parseBoolean(process.env.VITE_ENABLE_COMPLIANCE_CHECKS || process.env.ENABLE_COMPLIANCE_CHECKS, true),
      ENABLE_AI_FEATURES: this.parseBoolean(process.env.VITE_ENABLE_AI_FEATURES || process.env.ENABLE_AI_FEATURES, true),
      
      // API Configuration
      API_BASE_URL: process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000',
      WEBHOOK_ENDPOINT: process.env.VITE_WEBHOOK_ENDPOINT || process.env.WEBHOOK_ENDPOINT || '/api/webhooks/github',
      
      // Database Configuration
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      
      // Monitoring & Analytics
      ENABLE_ANALYTICS: this.parseBoolean(process.env.VITE_ENABLE_ANALYTICS || process.env.ENABLE_ANALYTICS, false),
      ENABLE_ERROR_REPORTING: this.parseBoolean(process.env.VITE_ENABLE_ERROR_REPORTING || process.env.ENABLE_ERROR_REPORTING, false),
      LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
      
      // Security
      ENCRYPTION_KEY: process.env.VITE_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || this.generateRandomKey(),
      SESSION_SECRET: process.env.SESSION_SECRET || this.generateRandomKey(),
      CORS_ORIGINS: this.parseCorsOrigins(process.env.CORS_ORIGINS || process.env.VITE_CORS_ORIGINS)
    };
  }

  /**
   * Load GitHub App private key from environment
   */
  private loadPrivateKey(): string {
    const privateKey = process.env.VITE_GITHUB_APP_PRIVATE_KEY || 
                      process.env.GITHUB_APP_PRIVATE_KEY || 
                      process.env.GITHUB_PRIVATE_KEY;

    if (!privateKey) {
      return '';
    }

    // Handle base64 encoded private key
    if (privateKey.includes('-----BEGIN')) {
      return privateKey;
    } else {
      try {
        return Buffer.from(privateKey, 'base64').toString('utf8');
      } catch {
        return privateKey;
      }
    }
  }

  /**
   * Parse boolean environment variable
   */
  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Parse CORS origins
   */
  private parseCorsOrigins(value: string | undefined): string[] {
    if (!value) return ['http://localhost:3000', 'http://localhost:5173'];
    return value.split(',').map(origin => origin.trim());
  }

  /**
   * Generate random key for development
   */
  private generateRandomKey(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    const errors: string[] = [];

    // Required GitHub App configuration
    if (!this.environment.GITHUB_APP_ID) {
      errors.push('GITHUB_APP_ID is required');
    }

    if (!this.environment.GITHUB_APP_PRIVATE_KEY) {
      errors.push('GITHUB_APP_PRIVATE_KEY is required');
    }

    if (!this.environment.GITHUB_APP_WEBHOOK_SECRET) {
      errors.push('GITHUB_APP_WEBHOOK_SECRET is required');
    }

    // Production-specific validations
    if (this.environment.NODE_ENV === 'production') {
      if (!this.environment.DATABASE_URL) {
        console.warn('⚠️ DATABASE_URL not configured for production');
      }

      if (!this.environment.REDIS_URL) {
        console.warn('⚠️ REDIS_URL not configured for production');
      }

      if (this.environment.ENCRYPTION_KEY.length < 32) {
        errors.push('ENCRYPTION_KEY must be at least 32 characters in production');
      }
    }

    if (errors.length > 0) {
      console.error('❌ Configuration validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
      
      if (this.environment.NODE_ENV === 'production') {
        throw new Error('Invalid configuration for production environment');
      } else {
        console.warn('⚠️ Running with incomplete configuration (development mode)');
      }
    }
  }

  /**
   * Get environment configuration
   */
  getEnvironment(): AppEnvironment {
    return { ...this.environment };
  }

  /**
   * Get GitHub App service configuration
   */
  getGitHubAppServiceConfig(): GitHubAppServiceConfig {
    return {
      appId: this.environment.GITHUB_APP_ID,
      privateKey: this.environment.GITHUB_APP_PRIVATE_KEY,
      webhookSecret: this.environment.GITHUB_APP_WEBHOOK_SECRET,
      clientId: this.environment.GITHUB_APP_CLIENT_ID,
      clientSecret: this.environment.GITHUB_APP_CLIENT_SECRET,
      enableWebhooks: this.environment.ENABLE_WEBHOOKS,
      webhookEndpoint: this.environment.WEBHOOK_ENDPOINT,
      enableRealTimeSync: this.environment.ENABLE_REAL_TIME_SYNC,
      enableComplianceChecks: this.environment.ENABLE_COMPLIANCE_CHECKS
    };
  }

  /**
   * Initialize GitHub App service
   */
  async initializeGitHubAppService(): Promise<GitHubAppService> {
    if (this.githubAppService) {
      return this.githubAppService;
    }

    const config = this.getGitHubAppServiceConfig();
    this.githubAppService = new GitHubAppService(config);

    try {
      await this.githubAppService.initialize();
      console.log('✅ GitHub App Service initialized successfully');
      return this.githubAppService;
    } catch (error) {
      console.error('❌ Failed to initialize GitHub App Service:', error);
      throw error;
    }
  }

  /**
   * Get GitHub App service instance
   */
  getGitHubAppService(): GitHubAppService | null {
    return this.githubAppService;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof Pick<AppEnvironment, 'ENABLE_WEBHOOKS' | 'ENABLE_REAL_TIME_SYNC' | 'ENABLE_COMPLIANCE_CHECKS' | 'ENABLE_AI_FEATURES' | 'ENABLE_ANALYTICS' | 'ENABLE_ERROR_REPORTING'>): boolean {
    return this.environment[feature];
  }

  /**
   * Get configuration summary for logging
   */
  getConfigSummary(): Record<string, any> {
    return {
      nodeEnv: this.environment.NODE_ENV,
      port: this.environment.PORT,
      githubAppConfigured: !!(this.environment.GITHUB_APP_ID && this.environment.GITHUB_APP_PRIVATE_KEY),
      webhooksEnabled: this.environment.ENABLE_WEBHOOKS,
      realTimeSyncEnabled: this.environment.ENABLE_REAL_TIME_SYNC,
      complianceChecksEnabled: this.environment.ENABLE_COMPLIANCE_CHECKS,
      aiFeaturesEnabled: this.environment.ENABLE_AI_FEATURES,
      analyticsEnabled: this.environment.ENABLE_ANALYTICS,
      logLevel: this.environment.LOG_LEVEL
    };
  }

  /**
   * Update configuration at runtime (for development)
   */
  updateConfiguration(updates: Partial<AppEnvironment>): void {
    if (this.environment.NODE_ENV === 'production') {
      throw new Error('Configuration cannot be updated in production');
    }

    this.environment = { ...this.environment, ...updates };
    console.log('🔄 Configuration updated:', updates);
  }

  /**
   * Shutdown services
   */
  async shutdown(): Promise<void> {
    if (this.githubAppService) {
      await this.githubAppService.shutdown();
      this.githubAppService = null;
    }
    console.log('🛑 GitHub App configuration shutdown complete');
  }
}

// Export singleton instance
export const githubAppConfig = GitHubAppConfig.getInstance();

// Export types
export { GitHubAppConfig };
export default githubAppConfig;
