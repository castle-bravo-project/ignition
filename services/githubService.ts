import {
  AuditLogEntry,
  GitHubIssue,
  PullRequest,
  PullRequestFile,
} from '../types';

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface GitHubSettings {
  repoUrl: string;
  pat: string;
  filePath: string;
}

export const parseRepoUrl = (url: string): GitHubRepo | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      return null;
    }
    const pathParts = urlObj.pathname.split('/').filter((p) => p);
    if (pathParts.length < 2) {
      return null;
    }
    return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
  } catch (e) {
    return null;
  }
};

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

interface GitHubApiResponse<T = any> {
  data: T;
  rateLimit: RateLimitInfo;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRateLimitInfo = (response: Response): RateLimitInfo => {
  return {
    limit: parseInt(response.headers.get('x-ratelimit-limit') || '5000'),
    remaining: parseInt(
      response.headers.get('x-ratelimit-remaining') || '5000'
    ),
    reset: parseInt(response.headers.get('x-ratelimit-reset') || '0'),
    used: parseInt(response.headers.get('x-ratelimit-used') || '0'),
  };
};

export const githubApiRequest = async (
  url: string,
  pat: string,
  options: RequestInit = {},
  retries = 3
): Promise<any> => {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Ignition-AI-Dashboard/1.0.0',
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers });
      const rateLimit = getRateLimitInfo(response);

      // Handle rate limiting
      if (
        response.status === 429 ||
        (response.status === 403 &&
          response.headers.get('x-ratelimit-remaining') === '0')
      ) {
        const resetTime = rateLimit.reset * 1000;
        const waitTime = Math.max(resetTime - Date.now(), 1000);

        if (attempt < retries) {
          console.warn(
            `Rate limit exceeded. Waiting ${Math.round(
              waitTime / 1000
            )}s before retry...`
          );
          await sleep(waitTime);
          continue;
        } else {
          throw new Error(
            `GitHub API rate limit exceeded. Reset at ${new Date(
              resetTime
            ).toLocaleTimeString()}`
          );
        }
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));

        // Retry on server errors
        if (response.status >= 500 && attempt < retries) {
          const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.warn(
            `Server error ${response.status}. Retrying in ${backoffTime}ms...`
          );
          await sleep(backoffTime);
          continue;
        }

        throw new Error(
          `GitHub API Error (${response.status}): ${
            errorData.message || errorData.documentation_url || 'Unknown error'
          }`
        );
      }

      // Warn if rate limit is getting low
      if (rateLimit.remaining < 100) {
        console.warn(
          `GitHub API rate limit warning: ${rateLimit.remaining}/${rateLimit.limit} requests remaining`
        );
      }

      // For 204 No Content response
      if (response.status === 204) return null;

      return response.json();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      // Retry on network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const backoffTime = Math.pow(2, attempt) * 1000;
        console.warn(`Network error. Retrying in ${backoffTime}ms...`);
        await sleep(backoffTime);
        continue;
      }

      throw error;
    }
  }
};

export const getFileContent = async (
  settings: GitHubSettings,
  path?: string
): Promise<{ content: string; sha: string }> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const filePath = path || settings.filePath;
  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`;
  const data = await githubApiRequest(url, settings.pat);

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`Path '${filePath}' is not a file.`);
  }

  // Base64 decode
  const content = atob(data.content);
  return { content, sha: data.sha };
};

export const saveFileContent = async (
  settings: GitHubSettings,
  fileContent: string,
  commitMessage: string,
  currentSha?: string
): Promise<any> => {
  return saveFileToRepo(
    settings,
    settings.filePath,
    fileContent,
    commitMessage,
    currentSha
  );
};

export const saveFileToRepo = async (
  settings: GitHubSettings,
  path: string,
  fileContent: string,
  commitMessage: string,
  currentSha?: string
): Promise<any> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');
  if (!commitMessage) throw new Error('Commit message cannot be empty.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`;

  let sha = currentSha;
  if (!sha) {
    try {
      const fileData = await getFileContent(settings, path);
      sha = fileData.sha;
    } catch (e: any) {
      // If file does not exist (404), that's fine, we're creating it.
      if (!e.message.includes('404')) {
        throw e; // Re-throw other errors.
      }
    }
  }

  // Base64 encode with Unicode support
  const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

  const body: { message: string; content: string; sha?: string } = {
    message: commitMessage,
    content: encodedContent,
  };

  if (sha) {
    body.sha = sha;
  }

  return githubApiRequest(url, settings.pat, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const getRepoIssues = async (
  settings: GitHubSettings
): Promise<GitHubIssue[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/issues?state=open`;
  const data = await githubApiRequest(url, settings.pat);

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response when fetching issues.');
  }

  // Filter out pull requests and map to our simplified type
  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      html_url: issue.html_url,
    }));
};

export const getPullRequests = async (
  settings: GitHubSettings
): Promise<PullRequest[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/pulls?state=open`;
  const data = await githubApiRequest(url, settings.pat);

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response when fetching pull requests.');
  }

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    user: { login: pr.user.login },
    html_url: pr.html_url,
    state: pr.state,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
  }));
};

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed';
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

export const getRecentCommits = async (
  settings: GitHubSettings,
  since?: string,
  limit: number = 50
): Promise<GitHubCommit[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  // Build URL with optional since parameter
  let url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits?per_page=${limit}`;
  if (since) {
    url += `&since=${since}`;
  }

  const data = await githubApiRequest(url, settings.pat);

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response when fetching commits.');
  }

  return data;
};

export const processCommitsToAuditEntries = (
  commits: GitHubCommit[],
  repoFullName: string
): AuditLogEntry[] => {
  return commits.map((commit) => {
    const isIgnitionGenerated =
      commit.commit.message.toLowerCase().includes('audit:') ||
      commit.commit.message.toLowerCase().includes('ignition:') ||
      commit.commit.message.toLowerCase().includes('meta-compliance');

    const commitDate = new Date(commit.commit.author.date);
    const shortSha = commit.sha.substring(0, 7);

    return {
      id: `commit_${commit.sha}_${Date.now()}`,
      timestamp: commitDate.toISOString(),
      actor: isIgnitionGenerated ? 'System' : 'User',
      eventType: 'REPOSITORY_COMMIT',
      summary: `Commit ${shortSha}: ${commit.commit.message}`,
      details: {
        commitSha: commit.sha,
        commitUrl: commit.html_url,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          githubLogin: commit.author?.login || 'Unknown',
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
        },
        repository: repoFullName,
        message: commit.commit.message,
        isIgnitionGenerated,
        stats: commit.stats,
        filesChanged:
          commit.files?.map((file) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
          })) || [],
        source: 'github_api_poll',
        complianceRelevant: true,
        dataClassification: 'INTERNAL',
      },
    };
  });
};

export const getPullRequestFiles = async (
  settings: GitHubSettings,
  prNumber: number
): Promise<PullRequestFile[]> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/pulls/${prNumber}/files`;
  const data = await githubApiRequest(url, settings.pat);

  if (!Array.isArray(data)) {
    throw new Error(
      `Unexpected response when fetching files for PR #${prNumber}.`
    );
  }

  return data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
  }));
};

export const postCommentToPr = async (
  settings: GitHubSettings,
  prNumber: number,
  commentBody: string
): Promise<any> => {
  const repoInfo = parseRepoUrl(settings.repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub Repository URL.');

  // Validate comment body
  if (!commentBody || commentBody.trim().length === 0) {
    throw new Error('Comment body cannot be empty.');
  }

  if (commentBody.length > 65536) {
    throw new Error(
      'Comment body exceeds maximum length of 65,536 characters.'
    );
  }

  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/issues/${prNumber}/comments`;

  return githubApiRequest(url, settings.pat, {
    method: 'POST',
    body: JSON.stringify({ body: commentBody }),
  });
};

// Enhanced validation functions
export const validateGitHubSettings = (
  settings: GitHubSettings
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate repository URL
  if (!settings.repoUrl || settings.repoUrl.trim().length === 0) {
    errors.push('Repository URL is required.');
  } else {
    const repoInfo = parseRepoUrl(settings.repoUrl);
    if (!repoInfo) {
      errors.push(
        'Invalid GitHub repository URL format. Expected: https://github.com/owner/repo'
      );
    }
  }

  // Validate PAT
  if (!settings.pat || settings.pat.trim().length === 0) {
    errors.push('Personal Access Token (PAT) is required.');
  } else {
    // Basic PAT format validation
    if (!settings.pat.match(/^gh[ps]_[A-Za-z0-9_]{36,255}$/)) {
      errors.push(
        'Invalid Personal Access Token format. Expected format: ghp_... or ghs_...'
      );
    }
  }

  // Validate file path
  if (!settings.filePath || settings.filePath.trim().length === 0) {
    errors.push('File path is required.');
  } else {
    // Check for invalid characters in file path
    if (settings.filePath.includes('..') || settings.filePath.startsWith('/')) {
      errors.push('File path contains invalid characters or patterns.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const testGitHubConnection = async (
  settings: GitHubSettings
): Promise<{ success: boolean; message: string; permissions?: string[] }> => {
  try {
    const validation = validateGitHubSettings(settings);
    if (!validation.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    const repoInfo = parseRepoUrl(settings.repoUrl);
    if (!repoInfo) {
      return {
        success: false,
        message: 'Invalid repository URL format.',
      };
    }

    // Test repository access
    const repoUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`;
    const repoData = await githubApiRequest(repoUrl, settings.pat);

    // Check permissions
    const permissions: string[] = [];
    if (repoData.permissions) {
      if (repoData.permissions.pull) permissions.push('read');
      if (repoData.permissions.push) permissions.push('write');
      if (repoData.permissions.admin) permissions.push('admin');
    }

    return {
      success: true,
      message: `Successfully connected to ${
        repoData.full_name
      }. Repository is ${repoData.private ? 'private' : 'public'}.`,
      permissions,
    };
  } catch (error: any) {
    let message = `Connection failed: ${error.message}`;

    if (error.message.includes('404')) {
      message =
        'Repository not found. Check the URL and ensure your PAT has access to this repository.';
    } else if (error.message.includes('403')) {
      message =
        'Access denied. Your PAT may not have the required permissions for this repository.';
    } else if (error.message.includes('401')) {
      message = 'Authentication failed. Check your Personal Access Token.';
    }

    return {
      success: false,
      message,
    };
  }
};

// Security utilities
export const sanitizeCommitMessage = (message: string): string => {
  // Remove potentially dangerous characters and limit length
  return message
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\r?\n/g, ' ') // Replace newlines with spaces
    .trim()
    .substring(0, 72); // Git recommended commit message length
};

export const validateFileContent = (
  content: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check file size (GitHub has a 100MB limit, but we'll be more conservative)
  const sizeInMB = new Blob([content]).size / (1024 * 1024);
  if (sizeInMB > 25) {
    errors.push(
      `File size (${sizeInMB.toFixed(2)}MB) exceeds recommended limit of 25MB.`
    );
  }

  // Check for valid JSON if it's supposed to be JSON
  try {
    JSON.parse(content);
  } catch (e) {
    errors.push('Content is not valid JSON.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
