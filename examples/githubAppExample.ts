/**
 * GitHub App Integration Example
 * 
 * Demonstrates how to use the new GitHub App infrastructure
 * for enterprise deployment and multi-tenant management.
 */

import githubAppConfig from '../services/githubAppConfig';
import GitHubAppService from '../services/githubAppService';

/**
 * Example: Initialize GitHub App Service
 */
async function initializeExample() {
  console.log('🚀 Initializing GitHub App Service Example...');
  
  try {
    // Get configuration summary
    const configSummary = githubAppConfig.getConfigSummary();
    console.log('📋 Configuration Summary:', configSummary);

    // Initialize GitHub App Service
    const githubAppService = await githubAppConfig.initializeGitHubAppService();
    console.log('✅ GitHub App Service initialized');

    // Get app-wide metrics
    const appMetrics = githubAppService.getAppMetrics();
    console.log('📊 App Metrics:', appMetrics);

    return githubAppService;
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}

/**
 * Example: Handle Webhook Event
 */
async function handleWebhookExample(githubAppService: GitHubAppService) {
  console.log('📨 Webhook Handling Example...');

  // Example webhook payload for installation event
  const webhookPayload = JSON.stringify({
    action: 'created',
    installation: {
      id: 12345,
      account: {
        login: 'example-org',
        type: 'Organization',
        id: 67890,
        avatar_url: 'https://github.com/example-org.png'
      },
      app_id: 123,
      target_id: 67890,
      target_type: 'Organization',
      permissions: {
        contents: 'read',
        issues: 'write',
        pull_requests: 'write'
      },
      events: ['push', 'pull_request', 'issues'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      repository_selection: 'all'
    },
    sender: {
      login: 'admin-user',
      id: 11111,
      type: 'User'
    }
  });

  const signature = 'sha256=example_signature_hash';

  try {
    // Note: In real implementation, signature would be properly calculated
    console.log('⚠️ Note: This is a mock webhook example');
    console.log('📦 Webhook payload prepared for installation event');
    
    // In real implementation:
    // const result = await githubAppService.handleWebhook('installation', webhookPayload, signature);
    // console.log('✅ Webhook processed:', result);
    
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
  }
}

/**
 * Example: Organization Management
 */
async function organizationManagementExample(githubAppService: GitHubAppService) {
  console.log('🏢 Organization Management Example...');

  try {
    // Get all installations overview
    const installations = await githubAppService.getAllInstallationsOverview();
    console.log(`📋 Found ${installations.length} installations`);

    // Example: Update tenant settings for first installation
    if (installations.length > 0) {
      const firstInstallation = installations[0];
      console.log(`🔧 Managing installation: ${firstInstallation.installation.account.login}`);

      // Update tenant settings
      const updatedTenant = githubAppService.updateTenantSettings(
        firstInstallation.installation.id,
        {
          complianceStandards: ['ISO27001', 'SOC2', 'HIPAA'],
          auditLevel: 'enterprise',
          features: {
            relationshipGraph: true,
            aiAssistant: true,
            complianceModule: true,
            securityDashboard: true,
            organizationalIntelligence: true,
            processAssetFramework: true
          }
        }
      );

      console.log('✅ Tenant settings updated:', {
        organization: updatedTenant.organizationLogin,
        plan: updatedTenant.subscription.plan,
        features: Object.keys(updatedTenant.settings.features).filter(
          key => updatedTenant.settings.features[key as keyof typeof updatedTenant.settings.features]
        )
      });

      // Check feature access
      const hasAdvancedFeatures = githubAppService.hasFeatureAccess(
        firstInstallation.installation.id,
        'organizationalIntelligence'
      );
      console.log('🎯 Advanced features access:', hasAdvancedFeatures);
    }
  } catch (error) {
    console.error('❌ Organization management failed:', error);
  }
}

/**
 * Example: Project Data Management
 */
async function projectDataExample(githubAppService: GitHubAppService) {
  console.log('📊 Project Data Management Example...');

  const exampleRepo = 'example-org/example-repo';

  try {
    // Get existing project data
    let projectData = githubAppService.getProjectData(exampleRepo);
    
    if (!projectData) {
      console.log('📝 No existing project data, creating example...');
      
      // Create example project data
      projectData = {
        projectName: 'Example Project',
        documents: {},
        requirements: [
          {
            id: 'REQ-001',
            title: 'User Authentication',
            description: 'System shall provide secure user authentication',
            category: 'Security',
            priority: 'High',
            status: 'Approved',
            createdBy: 'System',
            createdAt: new Date().toISOString(),
            updatedBy: 'System',
            updatedAt: new Date().toISOString()
          }
        ],
        testCases: [
          {
            id: 'TC-001',
            title: 'Test User Login',
            description: 'Verify user can login with valid credentials',
            status: 'Passed',
            gherkinScript: 'Given user has valid credentials\nWhen user attempts to login\nThen user should be authenticated',
            createdBy: 'System',
            createdAt: new Date().toISOString(),
            updatedBy: 'System',
            updatedAt: new Date().toISOString()
          }
        ],
        risks: [],
        configurationItems: [],
        links: {
          'REQ-001': {
            tests: ['TC-001'],
            cis: [],
            risks: []
          }
        },
        auditLog: [],
        processAssets: [],
        organizationalData: {
          projects: [],
          assets: [],
          metrics: {
            totalProjects: 1,
            totalAssets: 0,
            avgAssetReuse: 0,
            organizationalMaturityLevel: 1
          }
        }
      };

      // Update project data
      githubAppService.updateProjectData(exampleRepo, projectData);
      console.log('✅ Example project data created');
    } else {
      console.log('📋 Found existing project data:', {
        requirements: projectData.requirements.length,
        testCases: projectData.testCases.length,
        risks: projectData.risks.length
      });
    }

    // Sync repository (mock)
    await githubAppService.syncRepository(exampleRepo);
    console.log('🔄 Repository sync completed');

  } catch (error) {
    console.error('❌ Project data management failed:', error);
  }
}

/**
 * Example: Monitoring and Analytics
 */
async function monitoringExample(githubAppService: GitHubAppService) {
  console.log('📈 Monitoring and Analytics Example...');

  try {
    // Get app metrics
    const appMetrics = githubAppService.getAppMetrics();
    console.log('📊 App Metrics:', {
      installations: `${appMetrics.activeInstallations}/${appMetrics.totalInstallations}`,
      repositories: appMetrics.totalRepositories,
      users: appMetrics.totalUsers,
      apiCalls: appMetrics.apiCallsToday,
      webhookEvents: appMetrics.webhookEventsToday,
      errorRate: `${appMetrics.errorRate.toFixed(2)}%`
    });

    // Get webhook statistics
    const webhookStats = githubAppService.getWebhookStats();
    console.log('📨 Webhook Stats:', {
      totalEvents: webhookStats.totalEvents,
      successRate: `${webhookStats.successRate.toFixed(2)}%`,
      eventTypes: Object.keys(webhookStats.eventsByType),
      recentErrors: webhookStats.recentErrors.length
    });

    // Get recent webhook history
    const recentEvents = githubAppService.getWebhookHistory(undefined, 5);
    console.log('📋 Recent Events:', recentEvents.map(event => ({
      type: event.type,
      action: event.action,
      success: event.success,
      processedAt: event.processedAt
    })));

  } catch (error) {
    console.error('❌ Monitoring example failed:', error);
  }
}

/**
 * Main example function
 */
async function runGitHubAppExample() {
  console.log('🎯 GitHub App Integration Example Starting...\n');

  try {
    // Initialize service
    const githubAppService = await initializeExample();
    console.log('');

    // Run examples
    await handleWebhookExample(githubAppService);
    console.log('');

    await organizationManagementExample(githubAppService);
    console.log('');

    await projectDataExample(githubAppService);
    console.log('');

    await monitoringExample(githubAppService);
    console.log('');

    console.log('🎉 GitHub App Integration Example Completed Successfully!');

  } catch (error) {
    console.error('💥 Example failed:', error);
  } finally {
    // Cleanup
    await githubAppConfig.shutdown();
    console.log('🧹 Cleanup completed');
  }
}

// Export for use in other modules
export {
  initializeExample,
  handleWebhookExample,
  organizationManagementExample,
  projectDataExample,
  monitoringExample,
  runGitHubAppExample
};

// Run example if this file is executed directly
if (require.main === module) {
  runGitHubAppExample().catch(console.error);
}
