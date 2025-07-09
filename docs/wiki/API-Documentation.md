# API Documentation

## Overview

Ignition AI Dashboard provides a comprehensive set of APIs for project management, compliance assessment, and GitHub integration. This document covers all available APIs, their endpoints, parameters, and usage examples.

## Authentication

All API calls require authentication via GitHub Personal Access Token (PAT).

```javascript
// Authentication header
headers: {
  'Authorization': `Bearer ${githubPAT}`,
  'Accept': 'application/vnd.github.v3+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Ignition-AI-Dashboard/1.0.0'
}
```

## Project Data API

### Get Project Data

Retrieve complete project data from GitHub repository.

```javascript
// Function: getFileContent(settings, filePath)
const projectData = await getFileContent(githubSettings, 'ignition-project.json');
```

**Parameters:**
- `githubSettings`: GitHub configuration object
- `filePath`: Path to project file (default: 'ignition-project.json')

**Response:**
```json
{
  "content": "base64-encoded-content",
  "sha": "file-sha-hash"
}
```

### Save Project Data

Save project data to GitHub repository.

```javascript
// Function: saveFileContent(settings, content, commitMessage, currentSha)
await saveFileContent(
  githubSettings,
  JSON.stringify(projectData, null, 2),
  'Update project data',
  currentSha
);
```

**Parameters:**
- `githubSettings`: GitHub configuration object
- `content`: Project data as JSON string
- `commitMessage`: Commit message for the change
- `currentSha`: Current file SHA for conflict resolution

## GitHub Integration API

### Repository Information

Get repository details and permissions.

```javascript
// Function: testGitHubConnection(settings)
const result = await testGitHubConnection(githubSettings);
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to owner/repo. Repository is private.",
  "permissions": ["read", "write", "admin"]
}
```

### Issues API

Fetch repository issues.

```javascript
// Function: getRepoIssues(settings)
const issues = await getRepoIssues(githubSettings);
```

**Response:**
```json
[
  {
    "number": 123,
    "title": "Issue title",
    "state": "open",
    "html_url": "https://github.com/owner/repo/issues/123"
  }
]
```

### Pull Requests API

Fetch repository pull requests.

```javascript
// Function: getPullRequests(settings)
const pullRequests = await getPullRequests(githubSettings);
```

**Response:**
```json
[
  {
    "number": 456,
    "title": "PR title",
    "user": { "login": "username" },
    "html_url": "https://github.com/owner/repo/pull/456",
    "state": "open",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
]
```

### Commit Data API

Fetch recent commits from repository.

```javascript
// Function: getRecentCommits(settings, since, limit)
const commits = await getRecentCommits(
  githubSettings,
  '2024-01-01T00:00:00Z', // since date
  25 // limit
);
```

**Parameters:**
- `settings`: GitHub configuration object
- `since`: ISO date string for earliest commit (optional)
- `limit`: Maximum number of commits to fetch (default: 50)

**Response:**
```json
[
  {
    "sha": "commit-sha-hash",
    "commit": {
      "message": "Commit message",
      "author": {
        "name": "Author Name",
        "email": "author@example.com",
        "date": "2024-01-01T00:00:00Z"
      },
      "committer": {
        "name": "Committer Name",
        "email": "committer@example.com",
        "date": "2024-01-01T00:00:00Z"
      }
    },
    "author": {
      "login": "github-username",
      "avatar_url": "https://avatars.githubusercontent.com/..."
    },
    "html_url": "https://github.com/owner/repo/commit/sha",
    "stats": {
      "additions": 10,
      "deletions": 5,
      "total": 15
    },
    "files": [
      {
        "filename": "path/to/file.js",
        "status": "modified",
        "additions": 5,
        "deletions": 2,
        "changes": 7
      }
    ]
  }
]
```

### Pull Request Files API

Get files changed in a pull request.

```javascript
// Function: getPullRequestFiles(settings, prNumber)
const files = await getPullRequestFiles(githubSettings, 123);
```

**Response:**
```json
[
  {
    "filename": "path/to/file.js",
    "status": "modified",
    "additions": 10,
    "deletions": 5,
    "changes": 15,
    "patch": "@@ -1,3 +1,3 @@\n-old line\n+new line"
  }
]
```

### Comment on Pull Request

Post a comment on a pull request.

```javascript
// Function: postCommentToPr(settings, prNumber, commentBody)
await postCommentToPr(
  githubSettings,
  123,
  'AI Analysis: This PR looks good!'
);
```

## Audit Log API

### Persistent Audit Service

Create and manage persistent audit logs.

```javascript
// Create service
const auditService = createPersistentAuditService(githubSettings);

// Add single audit entry
await auditService.addAuditEntry({
  id: 'unique-id',
  timestamp: new Date().toISOString(),
  actor: 'User',
  eventType: 'DOCUMENT_CREATED',
  summary: 'Created new document',
  details: { documentId: 'doc-123' }
});

// Add multiple audit entries
await auditService.addAuditEntries([entry1, entry2, entry3]);

// Load existing audit log
await auditService.loadAuditLog();
```

### Audit Entry Format

```json
{
  "id": "audit_1234567890_abc123",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "actor": "User|AI|System|Automation",
  "eventType": "EVENT_TYPE",
  "summary": "Human-readable summary",
  "details": {
    "key": "value",
    "metadata": "additional context"
  }
}
```

### Commit Processing API

Convert commits to audit entries.

```javascript
// Function: processCommitsToAuditEntries(commits, repoFullName)
const auditEntries = processCommitsToAuditEntries(commits, 'owner/repo');
```

## AI Services API

### Gemini AI Service

AI-powered content generation and analysis.

```javascript
// Document generation
const document = await generateDocument(prompt, context);

// Pull request analysis
const analysis = await analyzePullRequest(prData, files);

// Test workflow generation
const workflow = await generateTestWorkflowFiles(projectData);
```

### Assessment Generation

AI-powered compliance and project assessments.

```javascript
// Generate assessment
const assessment = await generateAssessment(projectData, standards);

// Analyze requirements
const analysis = await analyzeRequirements(requirements);
```

## Compliance API

### Compliance Service

Automated compliance assessment and reporting.

```javascript
// Run compliance assessment
const assessment = await runComplianceAssessment(projectData, standards);

// Generate compliance report
const report = await generateComplianceReport(assessment);

// Get compliance gaps
const gaps = await identifyComplianceGaps(projectData, standard);
```

### Supported Standards

- `ISO27001`: ISO 27001 Information Security Management
- `SOC2`: SOC 2 Service Organization Control
- `HIPAA`: Health Insurance Portability and Accountability Act
- `FDA`: Food and Drug Administration regulations

## Utility APIs

### Repository Parsing

Parse GitHub repository URLs.

```javascript
// Function: parseRepoUrl(url)
const repoInfo = parseRepoUrl('https://github.com/owner/repo');
// Returns: { owner: 'owner', repo: 'repo' }
```

### Rate Limiting

All GitHub API calls include automatic rate limiting handling:

- Automatic retry with exponential backoff
- Rate limit monitoring and warnings
- Graceful degradation when limits approached

### Error Handling

Standardized error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "additional": "context"
  }
}
```

## Usage Examples

### Complete Project Sync

```javascript
// Load project data
const projectData = await getFileContent(githubSettings);

// Modify project data
projectData.documents.push(newDocument);

// Save back to repository
await saveFileContent(
  githubSettings,
  JSON.stringify(projectData, null, 2),
  'Add new document',
  projectData.sha
);

// Log the action
await auditService.addAuditEntry({
  id: generateId(),
  timestamp: new Date().toISOString(),
  actor: 'User',
  eventType: 'DOCUMENT_ADDED',
  summary: 'Added new document to project',
  details: { documentId: newDocument.id }
});
```

### Commit Data Integration

```javascript
// Fetch recent commits
const commits = await getRecentCommits(githubSettings, since, 25);

// Process to audit entries
const auditEntries = processCommitsToAuditEntries(commits, 'owner/repo');

// Save to audit log
await auditService.addAuditEntries(auditEntries);
```

## Rate Limits

- **GitHub API**: 5,000 requests per hour per PAT
- **AI Services**: Varies by provider and plan
- **Local Storage**: Browser-dependent (typically 5-10MB)

## Security Considerations

- PAT tokens stored in browser local storage only
- All API calls use HTTPS
- Sensitive data masked in audit logs
- Repository access validated before operations

---

*For implementation details and advanced usage, see the source code and [Feature Documentation](Feature-Documentation.md).*
