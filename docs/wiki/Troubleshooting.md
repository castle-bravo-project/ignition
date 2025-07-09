# Troubleshooting Guide

## Common Issues and Solutions

### GitHub Integration Issues

#### 1. "Bad credentials" Error (401)

**Problem**: GitHub API returns 401 Unauthorized error.

**Symptoms**:
- Cannot save project data
- Audit log save fails
- GitHub connection test fails

**Solutions**:

1. **Check PAT Validity**
   ```bash
   # Test your PAT with curl
   curl -H "Authorization: Bearer YOUR_PAT" https://api.github.com/user
   ```

2. **Verify PAT Permissions**
   - Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - Ensure your PAT has these scopes:
     - `repo` (for private repositories)
     - `contents:read` and `contents:write`
     - `issues:read`
     - `pull_requests:read`

3. **Check PAT Expiration**
   - PATs can expire (30, 60, 90 days, or custom)
   - Create a new PAT if expired

4. **Verify Repository Access**
   - Ensure you have access to the repository
   - Check if repository is private and PAT has `repo` scope

#### 2. "Repository not found" Error (404)

**Problem**: Cannot access the specified repository.

**Solutions**:

1. **Check Repository URL Format**
   ```
   Correct: https://github.com/owner/repository-name
   Incorrect: https://github.com/owner/repository-name.git
   ```

2. **Verify Repository Exists**
   - Visit the repository URL in your browser
   - Ensure you have access to the repository

3. **Check Repository Privacy**
   - Private repositories require `repo` scope
   - Public repositories need `public_repo` scope

#### 3. Rate Limiting Issues (403)

**Problem**: GitHub API rate limit exceeded.

**Symptoms**:
- API calls fail with 403 status
- "Rate limit exceeded" error messages

**Solutions**:

1. **Wait for Rate Limit Reset**
   - GitHub allows 5,000 requests per hour
   - Check reset time in error message

2. **Optimize API Usage**
   - Reduce frequency of operations
   - Use caching when possible
   - Batch operations together

3. **Use GitHub App Instead of PAT**
   - GitHub Apps have higher rate limits
   - Consider migrating to GitHub App authentication

### Application Issues

#### 4. Project Data Not Loading

**Problem**: Project data doesn't load or appears empty.

**Solutions**:

1. **Check File Path**
   - Verify `filePath` in GitHub settings
   - Default is `ignition-project.json`
   - Ensure file exists in repository root

2. **Initialize Project Data**
   - Go to Settings → GitHub Integration
   - Click "Save GitHub Settings" to create initial file

3. **Check File Format**
   - Ensure file contains valid JSON
   - Use JSON validator if needed

#### 5. Audit Log Issues

**Problem**: Audit log not saving or loading properly.

**Solutions**:

1. **Initialize Audit Log**
   ```javascript
   // Create initial audit log file
   const auditService = createPersistentAuditService(githubSettings);
   await auditService.initializeAuditLog('Project Name');
   ```

2. **Check Audit Log File**
   - File should be at `audit-log.json` in repository root
   - Verify file has correct JSON structure

3. **Verify Write Permissions**
   - PAT needs `contents:write` permission
   - Test with "Test GitHub Connection" button

#### 6. AI Features Not Working

**Problem**: AI-powered features fail or don't respond.

**Solutions**:

1. **Check API Keys**
   - Verify Gemini API key is configured
   - Check API key validity and quotas

2. **Network Connectivity**
   - Ensure internet connection is stable
   - Check for firewall or proxy issues

3. **API Quotas**
   - Check if you've exceeded API usage limits
   - Wait for quota reset or upgrade plan

### Performance Issues

#### 7. Slow Loading Times

**Problem**: Application loads slowly or becomes unresponsive.

**Solutions**:

1. **Clear Browser Cache**
   - Clear browser cache and local storage
   - Refresh the application

2. **Check Network Connection**
   - Verify stable internet connection
   - Test with other websites

3. **Reduce Data Size**
   - Large project files can slow loading
   - Consider archiving old data

#### 8. Memory Issues

**Problem**: Browser becomes slow or crashes.

**Solutions**:

1. **Close Other Tabs**
   - Free up browser memory
   - Restart browser if needed

2. **Check Local Storage**
   - Clear local storage if corrupted
   - Note: This will reset settings

3. **Use Incognito Mode**
   - Test in private/incognito window
   - Helps identify extension conflicts

### Data Issues

#### 9. Data Synchronization Problems

**Problem**: Local data doesn't match repository data.

**Solutions**:

1. **Force Reload**
   - Use browser refresh (Ctrl+F5 or Cmd+Shift+R)
   - Clear cache and reload

2. **Check for Conflicts**
   - Multiple users editing simultaneously
   - Use "Load from GitHub" to get latest version

3. **Backup and Reset**
   - Export current data as backup
   - Reset and reload from repository

#### 10. Commit Fetching Issues

**Problem**: "Fetch Commits" button doesn't work or returns no data.

**Solutions**:

1. **Check Repository Activity**
   - Ensure repository has recent commits
   - Default fetches last 7 days

2. **Verify PAT Permissions**
   - Need `contents:read` permission
   - Test GitHub connection

3. **Check Date Range**
   - Modify date range in code if needed
   - Look for commits in different time periods

### Browser Compatibility

#### 11. Features Not Working in Browser

**Problem**: Some features don't work in specific browsers.

**Solutions**:

1. **Use Supported Browsers**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

2. **Enable JavaScript**
   - Ensure JavaScript is enabled
   - Check for script blockers

3. **Update Browser**
   - Use latest browser version
   - Enable modern JavaScript features

### Development Issues

#### 12. Build or Development Server Issues

**Problem**: Cannot start development server or build fails.

**Solutions**:

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

2. **Clean Install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Environment Variables**
   - Verify `.env` file exists
   - Check for required environment variables

4. **Port Conflicts**
   ```bash
   # If port 5173 is in use
   npm run dev -- --port 3000
   ```

## Debugging Tips

### 1. Browser Developer Tools

- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls and responses
- **Application**: Inspect local storage data
- **Sources**: Debug JavaScript code

### 2. GitHub API Testing

Test GitHub API calls directly:

```bash
# Test repository access
curl -H "Authorization: Bearer YOUR_PAT" \
     https://api.github.com/repos/OWNER/REPO

# Test file access
curl -H "Authorization: Bearer YOUR_PAT" \
     https://api.github.com/repos/OWNER/REPO/contents/ignition-project.json
```

### 3. Local Storage Inspection

Check stored data in browser:

```javascript
// In browser console
console.log(localStorage.getItem('githubSettings'));
console.log(localStorage.getItem('projectData'));
console.log(localStorage.getItem('auditSettings'));
```

### 4. Network Monitoring

Monitor API calls:
- Open Developer Tools → Network tab
- Filter by "XHR" or "Fetch"
- Check request/response details
- Look for error status codes

## Getting Help

### 1. Check Logs

- Browser console for JavaScript errors
- Network tab for API failures
- Application tab for storage issues

### 2. Gather Information

When reporting issues, include:
- Browser and version
- Error messages (exact text)
- Steps to reproduce
- Screenshots if helpful
- Network requests (if relevant)

### 3. Common Error Codes

- **400**: Bad Request - Check request format
- **401**: Unauthorized - Check PAT and permissions
- **403**: Forbidden - Rate limit or insufficient permissions
- **404**: Not Found - Check repository URL and file paths
- **422**: Unprocessable Entity - Check data format
- **500**: Server Error - GitHub API issue, try again later

### 4. Reset Options

**Soft Reset** (keeps settings):
- Refresh browser page
- Clear browser cache

**Hard Reset** (loses settings):
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

*If you continue to experience issues, please check the [GitHub repository issues](https://github.com/castle-bravo-project/ignition-github-app-main/issues) or create a new issue with detailed information.*
