# Ignition AI Dashboard - User Guide

## Overview

Ignition is a comprehensive meta-compliance tool designed to manage, monitor, and control projects within a GitHub organization while offering compliance tooling to others. It provides AI-powered project management, compliance assessment, and audit logging capabilities.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Initial Setup](#initial-setup)
3. [Core Features](#core-features)
4. [GitHub Integration](#github-integration)
5. [Compliance Management](#compliance-management)
6. [Audit Logging](#audit-logging)
7. [AI Features](#ai-features)
8. [Project Management](#project-management)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub account with repository access
- GitHub Personal Access Token (PAT)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/castle-bravo-project/ignition-github-app-main.git
   cd ignition-github-app-main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:5173 in your browser

## Initial Setup

### 1. Configure GitHub Integration

1. Navigate to **Settings** page
2. Go to **GitHub Integration** section
3. Enter your **GitHub Repository URL**
4. Add your **Personal Access Token (PAT)**
5. Set **Project File Path** (default: `ignition-project.json`)
6. Click **Save GitHub Settings**
7. Test connection with **Test GitHub Connection** button

### 2. GitHub PAT Requirements

Your PAT needs these permissions:
- `repo` (for private repositories)
- `contents:read` (to read repository data)
- `contents:write` (to save project data and audit logs)
- `issues:read` (to fetch repository issues)
- `pull_requests:read` (to analyze pull requests)

### 3. Initialize Project

1. Go to **Dashboard** page
2. Update **Project Name** and **Description**
3. Configure **Compliance Standards** (ISO 27001, SOC 2, HIPAA, FDA)
4. Save project data to GitHub repository

## Core Features

### Dashboard
- Project overview and statistics
- Quick access to all major features
- Recent activity summary
- Compliance status indicators

### Project Management
- Document management with AI assistance
- Requirements tracking and analysis
- Risk assessment and mitigation
- Test case generation and management

### GitHub Integration
- Bi-directional repository synchronization
- Pull request analysis with AI
- Issue tracking and management
- Repository scaffolding and setup

### Compliance Management
- Multi-standard compliance assessment
- Automated compliance checking
- Gap analysis and recommendations
- Compliance reporting and documentation

### Audit Logging
- Comprehensive activity tracking
- Persistent audit logs in GitHub
- Commit data integration
- Compliance-ready audit trails

## GitHub Integration

### Repository Connection

The application uses your GitHub repository as the source of truth for project data:

- **Project Data**: Stored in `ignition-project.json`
- **Audit Logs**: Stored in `audit-log.json`
- **Generated Files**: Test workflows, documentation, etc.

### Commit Data Integration

1. Go to **Audit Log** page
2. Click **Fetch Commits** button
3. System retrieves recent commits (last 7 days)
4. Commit data is processed into audit entries
5. Data is saved to persistent audit log

### Pull Request Analysis

1. Navigate to **GitHub** section
2. View open pull requests
3. Click **Analyze with AI** for detailed analysis
4. AI provides code review, security assessment, and recommendations

## Compliance Management

### Supported Standards

- **ISO 27001**: Information Security Management
- **SOC 2**: Service Organization Control 2
- **HIPAA**: Health Insurance Portability and Accountability Act
- **FDA**: Food and Drug Administration regulations

### Compliance Assessment

1. Go to **Compliance** page
2. Select applicable standards
3. Run automated assessment
4. Review findings and recommendations
5. Generate compliance reports

### Gap Analysis

The system automatically identifies:
- Missing compliance controls
- Incomplete documentation
- Risk areas requiring attention
- Recommended remediation actions

## Audit Logging

### Features

- **Real-time Logging**: All user and system actions
- **Persistent Storage**: Audit logs saved to GitHub repository
- **Compliance Ready**: Meets regulatory audit requirements
- **Searchable**: Filter by event type, actor, or content
- **Detailed**: Complete context and metadata for each event

### Audit Entry Types

- `USER_ACTION`: Manual user interactions
- `AI_ACTION`: AI-generated content or analysis
- `SYSTEM_ACTION`: Automated system operations
- `REPOSITORY_COMMIT`: Git commit data from repository
- `COMPLIANCE_CHECK`: Compliance assessment activities

### Viewing Audit Logs

1. Navigate to **Audit Log** page
2. Use search filter to find specific events
3. Click eye icon to view detailed event information
4. Export logs for external analysis (coming soon)

## AI Features

### Document Generation

- AI-powered document creation
- Template-based generation
- Compliance-aware content
- Automatic formatting and structure

### Code Analysis

- Pull request review and analysis
- Security vulnerability detection
- Code quality assessment
- Improvement recommendations

### Compliance Assessment

- Automated gap analysis
- Risk identification
- Control mapping
- Remediation suggestions

## Project Management

### Documents

- Create and manage project documents
- AI-assisted content generation
- Version control integration
- Compliance mapping

### Requirements

- Track functional and non-functional requirements
- Link to compliance standards
- Impact analysis
- Traceability matrix

### Risks

- Risk identification and assessment
- Mitigation strategy development
- Risk monitoring and tracking
- Compliance risk mapping

### Test Cases

- Test case generation and management
- Requirements traceability
- Automated test workflow generation
- Quality assurance integration

## Best Practices

### Security

- Store PAT securely (browser local storage only)
- Regularly rotate GitHub tokens
- Use repository-specific PATs when possible
- Enable two-factor authentication on GitHub

### Compliance

- Regularly run compliance assessments
- Keep audit logs comprehensive and detailed
- Document all changes and decisions
- Maintain traceability between requirements and controls

### Project Management

- Keep project data synchronized with GitHub
- Use descriptive commit messages
- Regularly backup project data
- Maintain clear documentation

## Troubleshooting

### Common Issues

**GitHub Connection Failed**
- Verify PAT is valid and has correct permissions
- Check repository URL format
- Ensure repository exists and is accessible

**Audit Log Save Failed**
- Check PAT write permissions
- Verify repository access
- Initialize audit log if first time

**AI Features Not Working**
- Verify API keys are configured
- Check internet connectivity
- Review API usage limits

For more detailed troubleshooting, see [Troubleshooting Guide](Troubleshooting.md).

## Support

- **Documentation**: Check wiki pages for detailed guides
- **Issues**: Report bugs on GitHub repository
- **Community**: Join discussions in repository discussions

---

*This guide covers the core functionality of Ignition AI Dashboard. For advanced features and configuration, see the additional wiki pages.*
