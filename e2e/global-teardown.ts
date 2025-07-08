/**
 * Playwright Global Teardown
 * 
 * Global teardown for E2E tests including cleanup
 * and test result processing.
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...');

  try {
    // Cleanup test data if needed
    console.log('🗑️ Cleaning up test data...');
    
    // Any global cleanup operations can go here
    // For example, clearing test databases, removing test files, etc.
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here as it might mask test failures
  }
}

export default globalTeardown;
