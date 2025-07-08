# Ignition Deployment Checklist

## Pre-Deployment Setup

### 1. Repository Setup
- [ ] Create private repository in your GitHub organization
- [ ] Repository name should be `ignition` (lowercase for GitHub Pages URL)
- [ ] Initialize with README
- [ ] Set repository visibility to Private

### 2. Local Repository Preparation
- [ ] Copy all Ignition files to new repository
- [ ] Verify `.nojekyll` file exists in `public/` directory
- [ ] Verify `.gitignore` excludes `node_modules`, `dist`, etc.
- [ ] Update `vite.config.ts` base path to match repository name

### 3. GitHub Pages Configuration
- [ ] Go to repository Settings → Pages
- [ ] Set Source to "GitHub Actions"
- [ ] Verify workflow permissions are enabled

## Deployment Steps

### 1. Initial Commit
```bash
git add .
git commit -m "Initial Ignition deployment"
git push origin main
```

### 2. Verify Build
- [ ] Check GitHub Actions tab for workflow execution
- [ ] Verify build completes successfully
- [ ] Check for any deployment errors

### 3. Test Deployment
- [ ] Access GitHub Pages URL: `https://[org].github.io/ignition/`
- [ ] Verify application loads correctly
- [ ] Test core functionality:
  - [ ] Project creation
  - [ ] Dashboard navigation
  - [ ] AI chat functionality
  - [ ] Compliance assessments

## Post-Deployment Verification

### MVP Functionality Checklist
- [ ] **Project Management**: Create, save, load projects
- [ ] **Process Assets**: Requirements, test cases, documents
- [ ] **Compliance Engine**: ISO 27001, SOC 2, HIPAA assessments
- [ ] **AI Integration**: Gemini API working for suggestions
- [ ] **GitHub Integration**: Repository analysis and scaffolding
- [ ] **Audit Logging**: Compliance actions tracked
- [ ] **Meta-Compliance**: Badge system functional

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Responsive design working
- [ ] All assets loading correctly

## Next Steps: Open CTI Project Bootstrap

Once Ignition is deployed and verified:

1. **Use Ignition to create Open CTI project**
   - Define project requirements
   - Set up compliance framework
   - Generate initial documentation

2. **Scaffold Open CTI repository**
   - Use Ignition's GitHub integration
   - Create repository structure
   - Set up CI/CD workflows

3. **Establish project management**
   - Configure Ignition to monitor Open CTI
   - Set up automated assessments
   - Enable continuous compliance

## Troubleshooting

### Common Issues
- **Build fails**: Check Node.js version (should be 20+)
- **Assets not loading**: Verify base path in vite.config.ts
- **GitHub Pages 404**: Ensure `.nojekyll` file exists
- **API errors**: Check Gemini API key configuration

### Debug Commands
```bash
# Local build test
npm run build
npm run preview

# Check build output
ls -la dist/

# Verify .nojekyll
cat dist/.nojekyll
```
