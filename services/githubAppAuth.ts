/**
 * GitHub App Authentication Service
 * 
 * Handles JWT generation, installation token management, and GitHub App authentication
 * following GitHub App best practices for enterprise deployment.
 */

import { createHash, createHmac } from 'crypto';

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  webhookSecret: string;
  clientId?: string;
  clientSecret?: string;
}

export interface InstallationToken {
  token: string;
  expiresAt: Date;
  permissions: Record<string, string>;
  repositorySelection: 'all' | 'selected';
  repositories?: Repository[];
}

export interface Installation {
  id: number;
  account: {
    login: string;
    type: 'Organization' | 'User';
    id: number;
    avatar_url: string;
  };
  app_id: number;
  target_id: number;
  target_type: 'Organization' | 'User';
  permissions: Record<string, string>;
  events: string[];
  created_at: string;
  updated_at: string;
  repository_selection: 'all' | 'selected';
  suspended_at?: string;
  suspended_by?: any;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

export interface WebhookEvent {
  action: string;
  installation?: Installation;
  repositories?: Repository[];
  repository?: Repository;
  sender: {
    login: string;
    id: number;
    type: string;
  };
  [key: string]: any;
}

class GitHubAppAuth {
  private config: GitHubAppConfig;
  private tokenCache: Map<number, InstallationToken> = new Map();

  constructor(config: GitHubAppConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.appId) {
      throw new Error('GitHub App ID is required');
    }
    if (!this.config.privateKey) {
      throw new Error('GitHub App private key is required');
    }
    if (!this.config.webhookSecret) {
      throw new Error('GitHub App webhook secret is required');
    }
  }

  /**
   * Generate JWT token for GitHub App authentication
   */
  async generateJWT(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now - 60, // Issued 60 seconds in the past to allow for clock drift
      exp: now + (10 * 60), // Expires in 10 minutes (max allowed)
      iss: this.config.appId
    };

    return this.signJWT(payload);
  }

  /**
   * Sign JWT payload with private key
   */
  private signJWT(payload: any): string {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // Note: In production, use a proper crypto library like 'jsonwebtoken'
    // This is a simplified implementation for demonstration
    const signature = this.signWithPrivateKey(signingInput);
    const encodedSignature = this.base64UrlEncode(signature);

    return `${signingInput}.${encodedSignature}`;
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private signWithPrivateKey(data: string): string {
    // Simplified signing - in production use proper RSA signing
    return createHash('sha256').update(data + this.config.privateKey).digest('hex');
  }

  /**
   * Get installation access token
   */
  async getInstallationToken(installationId: number, forceRefresh = false): Promise<string> {
    // Check cache first
    if (!forceRefresh && this.tokenCache.has(installationId)) {
      const cached = this.tokenCache.get(installationId)!;
      if (cached.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) { // 5 min buffer
        return cached.token;
      }
    }

    // Generate new token
    const jwt = await this.generateJWT();
    const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Ignition-AI-Dashboard/2.0.0'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to get installation token: ${error.message}`);
    }

    const tokenData = await response.json();
    const installationToken: InstallationToken = {
      token: tokenData.token,
      expiresAt: new Date(tokenData.expires_at),
      permissions: tokenData.permissions,
      repositorySelection: tokenData.repository_selection,
      repositories: tokenData.repositories
    };

    // Cache the token
    this.tokenCache.set(installationId, installationToken);

    return tokenData.token;
  }

  /**
   * Get all installations for the app
   */
  async getInstallations(): Promise<Installation[]> {
    const jwt = await this.generateJWT();
    const url = 'https://api.github.com/app/installations';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Ignition-AI-Dashboard/2.0.0'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to get installations: ${error.message}`);
    }

    return response.json();
  }

  /**
   * Get installation by ID
   */
  async getInstallation(installationId: number): Promise<Installation> {
    const jwt = await this.generateJWT();
    const url = `https://api.github.com/app/installations/${installationId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Ignition-AI-Dashboard/2.0.0'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to get installation: ${error.message}`);
    }

    return response.json();
  }

  /**
   * Get repositories accessible to an installation
   */
  async getInstallationRepositories(installationId: number): Promise<Repository[]> {
    const token = await this.getInstallationToken(installationId);
    const url = `https://api.github.com/installation/repositories`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Ignition-AI-Dashboard/2.0.0'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to get installation repositories: ${error.message}`);
    }

    const data = await response.json();
    return data.repositories;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature.startsWith('sha256=')) {
      return false;
    }

    const expectedSignature = signature.slice(7); // Remove 'sha256=' prefix
    const computedSignature = createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(expectedSignature, computedSignature);
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Make authenticated API request using installation token
   */
  async makeInstallationRequest(
    installationId: number,
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = await this.getInstallationToken(installationId);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Ignition-AI-Dashboard/2.0.0'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`GitHub API Error (${response.status}): ${error.message}`);
    }

    return response.status === 204 ? null : response.json();
  }

  /**
   * Clear cached tokens (useful for testing or forced refresh)
   */
  clearTokenCache(): void {
    this.tokenCache.clear();
  }

  /**
   * Get cached token info (for debugging)
   */
  getCachedTokenInfo(installationId: number): InstallationToken | undefined {
    return this.tokenCache.get(installationId);
  }
}

export default GitHubAppAuth;
