# Ignition AI Project Dashboard - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- Docker (optional)
- Kubernetes cluster (optional)
- GitHub Personal Access Token

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

## 🐳 Docker Deployment

### Development with Docker
```bash
# Build and run development container
npm run docker:build-dev
npm run docker:run-dev

# Or use docker-compose
docker-compose up ignition-dev
```

### Production with Docker
```bash
# Build production image
npm run docker:build

# Run production container
npm run docker:run

# Or use docker-compose
docker-compose up ignition-prod
```

### Production with Traefik (Recommended)
```bash
# Start full production stack with reverse proxy
docker-compose --profile production up -d
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.20+)
- kubectl configured
- Ingress controller (nginx recommended)
- cert-manager (for TLS)

### Deploy to Kubernetes
```bash
# Deploy all resources
npm run k8s:deploy

# Or manually apply
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n ignition
kubectl get services -n ignition
kubectl get ingress -n ignition
```

### Configuration
1. Update `k8s/ingress.yaml` with your domain
2. Configure TLS certificates via cert-manager
3. Adjust resource limits in `k8s/deployment.yaml`

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GITHUB_PAT=your_github_pat_here
VITE_GITHUB_REPO_URL=https://github.com/your-org/your-repo
VITE_GITHUB_FILE_PATH=data/projectData.json
```

### Optional Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_GITHUB_INTEGRATION=true
VITE_ENABLE_QUALITY_GATES=true
VITE_ENABLE_COMPLIANCE_CHECKS=true

# Security
VITE_ENABLE_AUDIT_LOGGING=true
VITE_SESSION_TIMEOUT=3600000
```

## 🔒 Security Configuration

### GitHub PAT Permissions
Your GitHub Personal Access Token needs:
- `repo` (for private repositories)
- `public_repo` (for public repositories)
- `read:org` (for organization repositories)

### API Key Security
- Store API keys in environment variables only
- Never commit API keys to version control
- Use different keys for different environments
- Rotate keys regularly

## 📊 Monitoring & Health Checks

### Health Endpoints
- **Application**: `http://localhost:8080/health`
- **Docker**: Built-in health checks
- **Kubernetes**: Liveness and readiness probes

### Monitoring
```bash
# Check application logs
docker logs ignition-container

# Kubernetes logs
kubectl logs -f deployment/ignition-app -n ignition

# Monitor resource usage
kubectl top pods -n ignition
```

## 🔄 CI/CD Pipeline

### GitHub Actions
The project includes automated CI/CD workflows:

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yaml`)
   - Runs tests and quality checks
   - Builds Docker images
   - Deploys to staging/production

2. **Docker Build** (`.github/workflows/docker-build.yaml`)
   - Tests Docker builds
   - Security scanning with Trivy

### Manual Deployment
```bash
# Build and push Docker image
docker build -t your-registry/ignition:latest .
docker push your-registry/ignition:latest

# Update Kubernetes deployment
kubectl set image deployment/ignition-app ignition=your-registry/ignition:latest -n ignition
```

## 🎯 Performance Optimization

### Production Optimizations
- Enable gzip compression (configured in nginx.conf)
- Use CDN for static assets
- Configure proper caching headers
- Enable HTTP/2

### Scaling
```bash
# Scale Kubernetes deployment
kubectl scale deployment ignition-app --replicas=5 -n ignition

# Auto-scaling is configured via HPA
kubectl get hpa -n ignition
```

## 🛠️ Troubleshooting

### Common Issues

#### Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t ignition:latest .
```

#### Kubernetes Pod Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n ignition

# Check logs
kubectl logs <pod-name> -n ignition

# Check events
kubectl get events -n ignition --sort-by='.lastTimestamp'
```

#### API Connection Issues
1. Verify environment variables are set
2. Check API key permissions
3. Verify network connectivity
4. Check rate limiting status

### Debug Mode
```bash
# Enable debug logging
export DEBUG=ignition:*

# Run with verbose output
npm run dev -- --verbose
```

## 📈 Quality Assurance

### Quality Gates
The application includes automated quality gates:
- Requirements completeness (85% threshold)
- Documentation quality (80% threshold)
- Risk management (90% threshold)

### Compliance Standards
Supported compliance frameworks:
- ISO 27001:2022
- SOC 2 Type II
- HIPAA Security Rule
- FDA 21 CFR Part 11

### Testing
```bash
# Run all tests
npm test

# Run quality checks
npm run lint
npm run type-check

# Security audit
npm audit
```

## 🔄 Backup & Recovery

### Data Backup
```bash
# Export project data
curl -H "Authorization: Bearer $GITHUB_PAT" \
  https://api.github.com/repos/owner/repo/contents/data/projectData.json

# Backup to local file
kubectl exec deployment/ignition-app -n ignition -- \
  cat /app/data/projectData.json > backup.json
```

### Disaster Recovery
1. Restore from GitHub repository
2. Redeploy using CI/CD pipeline
3. Verify all integrations are working
4. Run quality assessment

## 📞 Support

### Getting Help
- Check the [README.md](./README.md) for basic usage
- Review [FEATURES_AND_STYLE_GUIDE.md](./FEATURES_AND_STYLE_GUIDE.md) for features
- Check GitHub Issues for known problems
- Review audit logs for debugging

### Performance Monitoring
- Monitor GitHub API rate limits
- Track quality gate compliance
- Monitor deployment health
- Review security audit logs
