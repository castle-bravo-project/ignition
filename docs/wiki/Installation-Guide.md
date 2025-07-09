# Installation Guide

## Overview

This guide covers the complete installation and setup process for Ignition AI Dashboard, from initial setup to production deployment.

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For repository management
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Required Accounts and Keys

1. **GitHub Account** with repository access
2. **GitHub Personal Access Token (PAT)** with appropriate permissions
3. **Google AI API Key** (for Gemini AI features)
4. **Repository** for storing project data and audit logs

## Installation Methods

### Method 1: Live Demo (Quickest)

**Best for**: Testing and evaluation

1. Visit [https://castle-bravo-project.github.io/ignition/](https://castle-bravo-project.github.io/ignition/)
2. Configure your API keys in Settings
3. Connect to your GitHub repository
4. Start using immediately

**Pros**: No installation required, always up-to-date
**Cons**: Requires internet connection, limited customization

### Method 2: Local Development Setup

**Best for**: Development and customization

#### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/castle-bravo-project/ignition-github-app-main.git
cd ignition-github-app-main
```

#### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install
```

#### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file with your configuration:

```bash
# Core Application
VITE_APP_TITLE="Ignition AI Dashboard"
VITE_APP_VERSION="2.0.0"

# AI Services (Optional - can be configured in UI)
VITE_GEMINI_API_KEY="your_gemini_api_key_here"

# GitHub Integration (Optional - can be configured in UI)
VITE_GITHUB_PAT="your_github_pat_here"
VITE_GITHUB_REPO_URL="https://github.com/your-org/your-repo"
VITE_GITHUB_FILE_PATH="ignition-project.json"

# Security & Compliance
VITE_ENABLE_AUDIT_LOGGING="true"
VITE_SESSION_TIMEOUT="3600000"
```

#### Step 4: Start Development Server

```bash
# Start development server
npm run dev
```

Application will be available at `http://localhost:5173`

#### Step 5: Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Method 3: Docker Deployment

**Best for**: Production deployment

#### Step 1: Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  ignition:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_APP_TITLE=Ignition AI Dashboard
      - VITE_ENABLE_AUDIT_LOGGING=true
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

#### Step 2: Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f ignition
```

#### Step 3: Using Pre-built Image

```bash
# Pull and run pre-built image
docker run -d \
  --name ignition \
  -p 8080:80 \
  -e VITE_ENABLE_AUDIT_LOGGING=true \
  ghcr.io/castle-bravo-project/ignition:latest
```

## Configuration

### GitHub Setup

#### Step 1: Create Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Set expiration (recommend 90 days or longer)
4. Select required scopes:
   - ✅ `repo` (for private repositories)
   - ✅ `public_repo` (for public repositories)
   - ✅ `read:org` (for organization repositories)

#### Step 2: Repository Preparation

1. **Create or select repository** for project data storage
2. **Ensure access** - You must have write access to the repository
3. **Initialize repository** - Can be empty or existing project

#### Step 3: Configure in Application

1. Navigate to **Settings** page
2. Go to **GitHub Integration** section
3. Enter **Repository URL**: `https://github.com/owner/repository`
4. Enter **Personal Access Token**
5. Set **Project File Path**: `ignition-project.json` (default)
6. Click **Save GitHub Settings**
7. Test connection with **Test GitHub Connection**

### AI Services Setup

#### Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create account or sign in
3. Generate API key
4. Configure in Settings → AI Services
5. Test functionality with document generation

#### Alternative AI Services

The application is designed to support multiple AI providers:
- **OpenAI GPT** (planned)
- **Anthropic Claude** (planned)
- **Local AI models** (planned)

### Application Configuration

#### Basic Settings

1. **Project Information**
   - Project name and description
   - Organization details
   - Contact information

2. **Compliance Standards**
   - Select applicable standards (ISO 27001, SOC 2, HIPAA, FDA)
   - Configure compliance requirements
   - Set assessment schedules

3. **Audit Configuration**
   - Enable/disable audit logging
   - Set retention periods
   - Configure event categories
   - Set up notifications

#### Advanced Settings

1. **Security Configuration**
   - Session timeout settings
   - Data encryption options
   - Access control settings

2. **Performance Settings**
   - Cache configuration
   - API rate limiting
   - Resource optimization

3. **Integration Settings**
   - External API endpoints
   - Webhook configuration (if needed)
   - Export/import settings

## Verification

### Step 1: Basic Functionality

1. **Dashboard Access**: Verify dashboard loads correctly
2. **GitHub Connection**: Test GitHub integration
3. **Project Creation**: Create a test project
4. **Data Persistence**: Save and reload project data

### Step 2: Feature Testing

1. **Document Management**: Create and edit documents
2. **Requirements**: Add and manage requirements
3. **Risk Assessment**: Create risk entries
4. **Audit Logging**: Verify audit events are recorded

### Step 3: AI Features

1. **Content Generation**: Test AI document generation
2. **Code Analysis**: Analyze a pull request
3. **Compliance Assessment**: Run compliance check

### Step 4: Integration Testing

1. **Commit Data**: Fetch recent commits
2. **Issue Tracking**: View repository issues
3. **Pull Requests**: Analyze pull requests

## Troubleshooting Installation

### Common Issues

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Visit https://nodejs.org/ for latest version
```

#### Dependency Installation Failures

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Conflicts

```bash
# Use different port
npm run dev -- --port 3000

# Or set in package.json
"dev": "vite --port 3000"
```

#### Build Failures

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint

# Clean build
rm -rf dist
npm run build
```

### Environment Issues

#### Missing Environment Variables

Ensure all required environment variables are set:

```bash
# Check environment variables
echo $VITE_GEMINI_API_KEY
echo $VITE_GITHUB_PAT
```

#### API Key Issues

1. **Verify API keys are valid**
2. **Check API quotas and limits**
3. **Ensure proper permissions**

### Docker Issues

#### Build Failures

```bash
# Check Docker version
docker --version

# Clean Docker cache
docker system prune -a

# Rebuild image
docker-compose build --no-cache
```

#### Permission Issues

```bash
# Fix file permissions
chmod -R 755 .

# Check Docker daemon
sudo systemctl status docker
```

## Production Deployment

### Security Considerations

1. **API Key Management**
   - Use environment variables
   - Never commit keys to version control
   - Rotate keys regularly

2. **HTTPS Configuration**
   - Use SSL/TLS certificates
   - Configure secure headers
   - Enable HSTS

3. **Access Control**
   - Implement authentication
   - Use firewall rules
   - Monitor access logs

### Performance Optimization

1. **Caching**
   - Enable browser caching
   - Use CDN for static assets
   - Implement API caching

2. **Monitoring**
   - Set up health checks
   - Monitor resource usage
   - Configure alerting

### Backup and Recovery

1. **Data Backup**
   - Repository data is automatically backed up in GitHub
   - Export project data regularly
   - Backup configuration files

2. **Disaster Recovery**
   - Document recovery procedures
   - Test backup restoration
   - Maintain offline copies

## Support and Maintenance

### Regular Maintenance

1. **Updates**
   - Check for application updates
   - Update dependencies regularly
   - Monitor security advisories

2. **Monitoring**
   - Check application health
   - Monitor API usage
   - Review audit logs

3. **Backup Verification**
   - Test data restoration
   - Verify backup integrity
   - Update backup procedures

### Getting Help

- **Documentation**: [Wiki Pages](https://github.com/castle-bravo-project/ignition/wiki)
- **Issues**: [GitHub Issues](https://github.com/castle-bravo-project/ignition/issues)
- **Community**: [GitHub Discussions](https://github.com/castle-bravo-project/ignition/discussions)

---

*For advanced deployment scenarios and enterprise features, see the [Advanced Configuration Guide](Advanced-Configuration.md).*
