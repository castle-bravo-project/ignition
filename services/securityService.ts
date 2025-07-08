import { GitHubSettings } from '../types';

export interface SecurityAlert {
  id: number;
  number: number;
  state: 'open' | 'dismissed' | 'fixed';
  dependency: {
    package: {
      name: string;
      ecosystem: string;
    };
    manifest_path: string;
    scope: string;
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string;
    summary: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cvss: {
      score: number;
      vector_string: string;
    };
    published_at: string;
    updated_at: string;
    withdrawn_at: string | null;
    vulnerabilities: Array<{
      package: {
        name: string;
        ecosystem: string;
      };
      severity: string;
      vulnerable_version_range: string;
      first_patched_version: {
        identifier: string;
      } | null;
    }>;
  };
  security_vulnerability: {
    package: {
      name: string;
      ecosystem: string;
    };
    severity: string;
    vulnerable_version_range: string;
    first_patched_version: {
      identifier: string;
    } | null;
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  dismissed_at: string | null;
  dismissed_by: any;
  dismissed_reason: string | null;
  dismissed_comment: string | null;
  fixed_at: string | null;
}

export interface CodeScanningAlert {
  number: number;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  state: 'open' | 'dismissed' | 'fixed';
  fixed_at: string | null;
  dismissed_by: any;
  dismissed_at: string | null;
  dismissed_reason: string | null;
  dismissed_comment: string | null;
  rule: {
    id: string;
    name: string;
    severity: 'note' | 'warning' | 'error';
    security_severity_level: 'low' | 'medium' | 'high' | 'critical' | null;
    description: string;
    full_description: string;
    tags: string[];
    help: string;
    help_uri: string;
  };
  tool: {
    name: string;
    guid: string | null;
    version: string;
  };
  most_recent_instance: {
    ref: string;
    analysis_key: string;
    environment: string;
    category: string;
    state: string;
    commit_sha: string;
    message: {
      text: string;
    };
    location: {
      path: string;
      start_line: number;
      end_line: number;
      start_column: number;
      end_column: number;
    };
    classifications: string[];
  };
}

export interface SecretScanningAlert {
  number: number;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  locations_url: string;
  state: 'open' | 'resolved';
  resolution:
    | 'false_positive'
    | 'wont_fix'
    | 'revoked'
    | 'used_in_tests'
    | null;
  resolved_at: string | null;
  resolved_by: any;
  resolution_comment: string | null;
  secret_type: string;
  secret_type_display_name: string;
  secret: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  };
  push_protection_bypassed: boolean;
  push_protection_bypassed_by: any;
  push_protection_bypassed_at: string | null;
  validity: 'active' | 'inactive' | 'unknown';
}

export interface DependabotAlert {
  number: number;
  state: 'auto_dismissed' | 'dismissed' | 'fixed' | 'open';
  dependency: {
    package: {
      ecosystem: string;
      name: string;
    };
    manifest_path: string;
    scope: 'development' | 'runtime' | null;
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string;
    summary: string;
    description: string;
    vulnerabilities: Array<{
      package: {
        ecosystem: string;
        name: string;
      };
      severity: 'low' | 'medium' | 'high' | 'critical';
      vulnerable_version_range: string;
      first_patched_version: {
        identifier: string;
      } | null;
    }>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cvss: {
      vector_string: string;
      score: number;
    };
    cwes: Array<{
      cwe_id: string;
      name: string;
    }>;
    identifiers: Array<{
      value: string;
      type: string;
    }>;
    references: Array<{
      url: string;
    }>;
    published_at: string;
    updated_at: string;
    withdrawn_at: string | null;
  };
  security_vulnerability: {
    package: {
      ecosystem: string;
      name: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    vulnerable_version_range: string;
    first_patched_version: {
      identifier: string;
    } | null;
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  dismissed_at: string | null;
  dismissed_by: any;
  dismissed_reason:
    | 'fix_started'
    | 'inaccurate'
    | 'no_bandwidth'
    | 'not_used'
    | 'tolerable_risk'
    | null;
  dismissed_comment: string | null;
  fixed_at: string | null;
  auto_dismissed_at: string | null;
}

export interface BranchProtection {
  url: string;
  enabled: boolean;
  required_status_checks: {
    enforcement_level: string;
    contexts: string[];
    checks: Array<{
      context: string;
      app_id: number | null;
    }>;
  } | null;
  enforce_admins: {
    url: string;
    enabled: boolean;
  };
  required_pull_request_reviews: {
    url: string;
    dismiss_stale_reviews: boolean;
    require_code_owner_reviews: boolean;
    required_approving_review_count: number;
    require_last_push_approval: boolean;
    dismissal_restrictions: {
      users: any[];
      teams: any[];
      apps: any[];
    };
    bypass_pull_request_allowances: {
      users: any[];
      teams: any[];
      apps: any[];
    };
  } | null;
  restrictions: {
    url: string;
    users_url: string;
    teams_url: string;
    apps_url: string;
    users: any[];
    teams: any[];
    apps: any[];
  } | null;
  required_linear_history: {
    enabled: boolean;
  };
  allow_force_pushes: {
    enabled: boolean;
  };
  allow_deletions: {
    enabled: boolean;
  };
  block_creations: {
    enabled: boolean;
  };
  required_conversation_resolution: {
    enabled: boolean;
  };
  lock_branch: {
    enabled: boolean;
  };
  allow_fork_syncing: {
    enabled: boolean;
  };
}

export interface SecurityOverview {
  vulnerabilityAlerts: SecurityAlert[];
  codeScanningAlerts: CodeScanningAlert[];
  secretScanningAlerts: SecretScanningAlert[];
  dependabotAlerts: DependabotAlert[];
  branchProtection: BranchProtection | null;
  securityPolicy: {
    exists: boolean;
    content?: string;
  };
  summary: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    openSecrets: number;
    codeIssues: number;
    securityScore: number; // 0-100
  };
}

// Helper function to parse repository URL
const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
};

// Enhanced GitHub API request with proper error handling
const githubSecurityApiRequest = async (
  url: string,
  pat: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Ignition-AI-Dashboard/1.0.0',
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Feature not available or no data
    }
    if (response.status === 403) {
      throw new Error(
        'Insufficient permissions. Ensure your PAT has security read permissions.'
      );
    }
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      `GitHub Security API Error (${response.status}): ${errorData.message}`
    );
  }

  if (response.status === 204) return null;
  return response.json();
};

// Get Dependabot alerts
export const getDependabotAlerts = async (
  settings: GitHubSettings
): Promise<DependabotAlert[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/dependabot/alerts`;
  const data = await githubSecurityApiRequest(url, settings.pat);

  return data || [];
};

// Get vulnerability alerts (Dependabot security alerts)
export const getVulnerabilityAlerts = async (
  settings: GitHubSettings
): Promise<SecurityAlert[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/security-advisories`;
  const data = await githubSecurityApiRequest(url, settings.pat);

  return data || [];
};

// Get code scanning alerts
export const getCodeScanningAlerts = async (
  settings: GitHubSettings
): Promise<CodeScanningAlert[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/code-scanning/alerts`;
  const data = await githubSecurityApiRequest(url, settings.pat);

  return data || [];
};

// Get secret scanning alerts
export const getSecretScanningAlerts = async (
  settings: GitHubSettings
): Promise<SecretScanningAlert[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/secret-scanning/alerts`;
  const data = await githubSecurityApiRequest(url, settings.pat);

  return data || [];
};

// Get branch protection rules
export const getBranchProtection = async (
  settings: GitHubSettings,
  branch: string = 'main'
): Promise<BranchProtection | null> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches/${branch}/protection`;
  const data = await githubSecurityApiRequest(url, settings.pat);

  return data;
};

// Check if security policy exists
export const getSecurityPolicy = async (
  settings: GitHubSettings
): Promise<{ exists: boolean; content?: string }> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  try {
    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/SECURITY.md`;
    const data = await githubSecurityApiRequest(url, settings.pat);

    if (data && data.content) {
      const content = atob(data.content.replace(/\s/g, ''));
      return { exists: true, content };
    }
  } catch (error) {
    // Try .github/SECURITY.md
    try {
      const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/.github/SECURITY.md`;
      const data = await githubSecurityApiRequest(url, settings.pat);

      if (data && data.content) {
        const content = atob(data.content.replace(/\s/g, ''));
        return { exists: true, content };
      }
    } catch (error2) {
      // No security policy found
    }
  }

  return { exists: false };
};

// Calculate security score based on various factors
const calculateSecurityScore = (
  overview: Partial<SecurityOverview>
): number => {
  let score = 100;

  // Deduct points for vulnerabilities
  const summary = overview.summary!;
  score -= summary.criticalVulnerabilities * 20;
  score -= summary.highVulnerabilities * 10;
  score -= summary.mediumVulnerabilities * 5;
  score -= summary.lowVulnerabilities * 2;

  // Deduct points for secrets
  score -= summary.openSecrets * 15;

  // Deduct points for code issues
  score -= summary.codeIssues * 3;

  // Bonus points for security measures
  if (overview.branchProtection?.enabled) score += 10;
  if (overview.securityPolicy?.exists) score += 5;

  return Math.max(0, Math.min(100, score));
};

// Get comprehensive security overview
export const getSecurityOverview = async (
  settings: GitHubSettings
): Promise<SecurityOverview> => {
  try {
    const [
      dependabotAlerts,
      vulnerabilityAlerts,
      codeScanningAlerts,
      secretScanningAlerts,
      branchProtection,
      securityPolicy,
    ] = await Promise.allSettled([
      getDependabotAlerts(settings),
      getVulnerabilityAlerts(settings),
      getCodeScanningAlerts(settings),
      getSecretScanningAlerts(settings),
      getBranchProtection(settings),
      getSecurityPolicy(settings),
    ]);

    const dependabot =
      dependabotAlerts.status === 'fulfilled' ? dependabotAlerts.value : [];
    const vulnerabilities =
      vulnerabilityAlerts.status === 'fulfilled'
        ? vulnerabilityAlerts.value
        : [];
    const codeScanning =
      codeScanningAlerts.status === 'fulfilled' ? codeScanningAlerts.value : [];
    const secretScanning =
      secretScanningAlerts.status === 'fulfilled'
        ? secretScanningAlerts.value
        : [];
    const protection =
      branchProtection.status === 'fulfilled' ? branchProtection.value : null;
    const policy =
      securityPolicy.status === 'fulfilled'
        ? securityPolicy.value
        : { exists: false };

    // Calculate summary statistics
    const allVulns = [...dependabot, ...vulnerabilities];
    const criticalVulns = allVulns.filter(
      (v) =>
        v.security_advisory?.severity === 'critical' ||
        v.security_vulnerability?.severity === 'critical'
    ).length;
    const highVulns = allVulns.filter(
      (v) =>
        v.security_advisory?.severity === 'high' ||
        v.security_vulnerability?.severity === 'high'
    ).length;
    const mediumVulns = allVulns.filter(
      (v) =>
        v.security_advisory?.severity === 'medium' ||
        v.security_vulnerability?.severity === 'medium'
    ).length;
    const lowVulns = allVulns.filter(
      (v) =>
        v.security_advisory?.severity === 'low' ||
        v.security_vulnerability?.severity === 'low'
    ).length;

    const summary = {
      totalVulnerabilities: allVulns.length,
      criticalVulnerabilities: criticalVulns,
      highVulnerabilities: highVulns,
      mediumVulnerabilities: mediumVulns,
      lowVulnerabilities: lowVulns,
      openSecrets: secretScanning.filter((s) => s.state === 'open').length,
      codeIssues: codeScanning.filter((c) => c.state === 'open').length,
      securityScore: 0, // Will be calculated below
    };

    const overview: SecurityOverview = {
      vulnerabilityAlerts: vulnerabilities,
      codeScanningAlerts: codeScanning,
      secretScanningAlerts: secretScanning,
      dependabotAlerts: dependabot,
      branchProtection: protection,
      securityPolicy: policy,
      summary,
    };

    // Calculate security score
    overview.summary.securityScore = calculateSecurityScore(overview);

    return overview;
  } catch (error: any) {
    throw new Error(`Failed to fetch security overview: ${error.message}`);
  }
};

// Update branch protection rules
export const updateBranchProtection = async (
  settings: GitHubSettings,
  branch: string = 'main',
  protection: Partial<BranchProtection>
): Promise<BranchProtection> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches/${branch}/protection`;

  return githubSecurityApiRequest(url, settings.pat, {
    method: 'PUT',
    body: JSON.stringify(protection),
  });
};

// Dismiss a security alert
export const dismissSecurityAlert = async (
  settings: GitHubSettings,
  alertNumber: number,
  reason: string,
  comment?: string
): Promise<void> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/dependabot/alerts/${alertNumber}`;

  await githubSecurityApiRequest(url, settings.pat, {
    method: 'PATCH',
    body: JSON.stringify({
      state: 'dismissed',
      dismissed_reason: reason,
      dismissed_comment: comment,
    }),
  });
};
