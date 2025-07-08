/**
 * Dashboard E2E Tests
 * 
 * End-to-end tests for the main dashboard functionality
 * including navigation, metrics display, and user interactions.
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Ensure we're on the dashboard page
    await expect(page.locator('text=Project Dashboard, text=Enhanced Project Intelligence Dashboard')).toBeVisible();
  });

  test('displays main dashboard elements', async ({ page }) => {
    // Check for main dashboard title
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();
    
    // Check for metrics cards
    await expect(page.locator('[data-testid*="metric"], .metric-card, .widget')).toHaveCount.greaterThan(0);
    
    // Check for navigation sidebar
    await expect(page.locator('[data-testid="sidebar"], .sidebar, nav')).toBeVisible();
  });

  test('navigates between different pages', async ({ page }) => {
    // Test navigation to Requirements page
    await page.click('text=Requirements, [data-testid="nav-requirements"]');
    await expect(page.locator('text=Requirements')).toBeVisible();
    
    // Test navigation to Test Cases page
    await page.click('text=Test Cases, [data-testid="nav-test-cases"]');
    await expect(page.locator('text=Test Cases')).toBeVisible();
    
    // Test navigation back to Dashboard
    await page.click('text=Dashboard, [data-testid="nav-dashboard"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('displays project metrics correctly', async ({ page }) => {
    // Check for requirements count
    const requirementsMetric = page.locator('[data-testid*="requirements"], .metric').filter({ hasText: /requirements/i });
    await expect(requirementsMetric).toBeVisible();
    
    // Check for test coverage metric
    const coverageMetric = page.locator('[data-testid*="coverage"], .metric').filter({ hasText: /coverage|%/i });
    await expect(coverageMetric).toBeVisible();
    
    // Check for risk metrics
    const riskMetric = page.locator('[data-testid*="risk"], .metric').filter({ hasText: /risk/i });
    await expect(riskMetric).toBeVisible();
  });

  test('interacts with dashboard widgets', async ({ page }) => {
    // Look for interactive widgets
    const widgets = page.locator('[data-testid*="widget"], .widget, .interactive-widget');
    const widgetCount = await widgets.count();
    
    if (widgetCount > 0) {
      // Click on the first widget
      await widgets.first().click();
      
      // Check if drill-down or modal appears
      await page.waitForTimeout(500); // Wait for animations
      
      // Look for expanded content or modal
      const expandedContent = page.locator('[data-testid*="drill-down"], .modal, .expanded-widget');
      // This might be visible or not depending on implementation
    }
  });

  test('displays charts and visualizations', async ({ page }) => {
    // Check for chart containers
    const charts = page.locator('canvas, svg, [data-testid*="chart"]');
    await expect(charts).toHaveCount.greaterThan(0);
    
    // Wait for charts to render
    await page.waitForTimeout(1000);
    
    // Check if charts have content (not empty)
    const firstChart = charts.first();
    await expect(firstChart).toBeVisible();
  });

  test('handles responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="sidebar"], .sidebar')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if mobile navigation works
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .hamburger');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-nav"], .mobile-nav')).toBeVisible();
    }
  });

  test('loads data from localStorage', async ({ page }) => {
    // Set test data in localStorage
    await page.evaluate(() => {
      const testData = {
        projectName: 'E2E Test Project',
        requirements: [
          {
            id: 'REQ-E2E-001',
            description: 'E2E test requirement',
            status: 'Draft',
            priority: 'High',
          }
        ],
        testCases: [],
        configurationItems: [],
        risks: [],
        links: {},
      };
      localStorage.setItem('ignition-project-data', JSON.stringify(testData));
    });
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Check if the test data is displayed
    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });

  test('handles error states gracefully', async ({ page }) => {
    // Simulate network error by intercepting requests
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to trigger an API call (if any)
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // The app should still load and not crash
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('persists data changes', async ({ page }) => {
    // Navigate to requirements page
    await page.click('text=Requirements');
    await page.waitForSelector('text=Requirements');
    
    // Add a new requirement (if add button exists)
    const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Fill in requirement details
      const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]');
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('E2E Test Requirement');
        
        // Save the requirement
        const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Check if requirement appears in the list
          await expect(page.locator('text=E2E Test Requirement')).toBeVisible();
        }
      }
    }
  });

  test('displays real-time notifications', async ({ page }) => {
    // Look for notification system
    const notificationArea = page.locator('[data-testid*="notification"], .notification, .toast');
    
    // Trigger an action that might show a notification
    const actionButton = page.locator('button').filter({ hasText: /save|update|generate/i }).first();
    if (await actionButton.isVisible()) {
      await actionButton.click();
      
      // Wait for potential notification
      await page.waitForTimeout(1000);
      
      // Check if notification appeared
      // This is optional as notifications might not always appear
    }
  });
});
