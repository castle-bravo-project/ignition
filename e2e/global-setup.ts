/**
 * Playwright Global Setup
 * 
 * Global setup for E2E tests including authentication,
 * test data preparation, and environment configuration.
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:5173');
    
    // Wait for the main app to load
    await page.waitForSelector('[data-testid="app-container"], #root', { timeout: 30000 });
    
    // Setup test data in localStorage if needed
    await page.evaluate(() => {
      const testProjectData = {
        projectName: 'E2E Test Project',
        documents: {},
        requirements: [
          {
            id: 'REQ-E2E-001',
            description: 'E2E test requirement',
            status: 'Draft',
            priority: 'High',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'E2E Test',
            updatedBy: 'E2E Test',
          }
        ],
        testCases: [
          {
            id: 'TC-E2E-001',
            description: 'E2E test case',
            status: 'Passed',
            gherkin: 'Feature: E2E Test\n  Scenario: Test scenario\n    Given test condition\n    When test action\n    Then test result',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'E2E Test',
            updatedBy: 'E2E Test',
          }
        ],
        configurationItems: [],
        processAssets: [],
        risks: [],
        links: {},
        riskCiLinks: {},
        issueCiLinks: {},
        issueRiskLinks: {},
        assetLinks: {},
      };
      
      localStorage.setItem('ignition-project-data', JSON.stringify(testProjectData));
    });

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
