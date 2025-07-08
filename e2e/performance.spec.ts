/**
 * Performance Testing Suite
 * 
 * Performance tests for the Ignition dashboard including
 * load times, rendering performance, and user interaction responsiveness.
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('measures initial page load performance', async ({ page }) => {
    // Start measuring performance
    const startTime = Date.now();
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the main content to be visible
    await page.waitForSelector('[data-testid="app-container"], #root');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Assert load time is reasonable (under 3 seconds)
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Initial page load time: ${loadTime}ms`);
  });

  test('measures dashboard rendering performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Measure dashboard rendering time
    const startTime = Date.now();
    
    // Wait for dashboard elements to be visible
    await page.waitForSelector('text=Dashboard, text=Enhanced Project Intelligence Dashboard');
    await page.waitForSelector('[data-testid*="metric"], .metric-card, .widget');
    
    // Wait for charts to render
    await page.waitForSelector('canvas, svg, [data-testid*="chart"]');
    
    const renderTime = Date.now() - startTime;
    
    // Assert rendering time is reasonable (under 2 seconds)
    expect(renderTime).toBeLessThan(2000);
    
    console.log(`Dashboard rendering time: ${renderTime}ms`);
  });

  test('measures navigation performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    const pages = ['Requirements', 'Test Cases', 'Configuration', 'Risks'];
    
    for (const pageName of pages) {
      const startTime = Date.now();
      
      // Navigate to page
      await page.click(`text=${pageName}`);
      await page.waitForSelector(`text=${pageName}`);
      
      const navigationTime = Date.now() - startTime;
      
      // Assert navigation is fast (under 1 second)
      expect(navigationTime).toBeLessThan(1000);
      
      console.log(`Navigation to ${pageName}: ${navigationTime}ms`);
    }
  });

  test('measures large dataset rendering performance', async ({ page }) => {
    // Set up large dataset in localStorage
    await page.evaluate(() => {
      const largeDataset = {
        projectName: 'Performance Test Project',
        requirements: Array.from({ length: 100 }, (_, i) => ({
          id: `REQ-${i + 1}`,
          description: `Performance test requirement ${i + 1}`,
          status: 'Draft',
          priority: 'Medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Performance Test',
          updatedBy: 'Performance Test',
        })),
        testCases: Array.from({ length: 50 }, (_, i) => ({
          id: `TC-${i + 1}`,
          description: `Performance test case ${i + 1}`,
          status: 'Passed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Performance Test',
          updatedBy: 'Performance Test',
        })),
        configurationItems: Array.from({ length: 30 }, (_, i) => ({
          id: `CI-${i + 1}`,
          name: `Performance CI ${i + 1}`,
          type: 'Software Component',
          version: '1.0.0',
          status: 'Baseline',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Performance Test',
          updatedBy: 'Performance Test',
        })),
        risks: Array.from({ length: 20 }, (_, i) => ({
          id: `RISK-${i + 1}`,
          description: `Performance test risk ${i + 1}`,
          probability: 'Medium',
          impact: 'Medium',
          status: 'Open',
          mitigation: 'Test mitigation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Performance Test',
          updatedBy: 'Performance Test',
        })),
        processAssets: [],
        links: {},
        riskCiLinks: {},
        issueCiLinks: {},
        issueRiskLinks: {},
        assetLinks: {},
      };
      
      localStorage.setItem('ignition-project-data', JSON.stringify(largeDataset));
    });
    
    const startTime = Date.now();
    
    // Navigate and wait for large dataset to render
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    await page.waitForLoadState('networkidle');
    
    const renderTime = Date.now() - startTime;
    
    // Assert large dataset rendering is reasonable (under 5 seconds)
    expect(renderTime).toBeLessThan(5000);
    
    console.log(`Large dataset rendering time: ${renderTime}ms`);
    
    // Test navigation to requirements page with large dataset
    const reqStartTime = Date.now();
    await page.click('text=Requirements');
    await page.waitForSelector('text=Requirements');
    
    // Wait for all requirements to be visible
    await page.waitForFunction(() => {
      const requirements = document.querySelectorAll('[data-testid*="requirement"], .requirement-item');
      return requirements.length >= 50; // Should show at least 50 items
    }, { timeout: 10000 });
    
    const reqRenderTime = Date.now() - reqStartTime;
    
    // Assert requirements page with large dataset loads reasonably
    expect(reqRenderTime).toBeLessThan(3000);
    
    console.log(`Requirements page with large dataset: ${reqRenderTime}ms`);
  });

  test('measures search and filter performance', async ({ page }) => {
    // Set up test data
    await page.evaluate(() => {
      const testData = {
        projectName: 'Search Performance Test',
        requirements: Array.from({ length: 50 }, (_, i) => ({
          id: `REQ-${i + 1}`,
          description: `Search test requirement ${i + 1} ${i % 2 === 0 ? 'authentication' : 'validation'}`,
          status: i % 3 === 0 ? 'Draft' : 'Approved',
          priority: 'Medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Search Test',
          updatedBy: 'Search Test',
        })),
        testCases: [],
        configurationItems: [],
        risks: [],
        processAssets: [],
        links: {},
        riskCiLinks: {},
        issueCiLinks: {},
        issueRiskLinks: {},
        assetLinks: {},
      };
      
      localStorage.setItem('ignition-project-data', JSON.stringify(testData));
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Navigate to requirements
    await page.click('text=Requirements');
    await page.waitForSelector('text=Requirements');
    
    // Test search performance
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      const searchStartTime = Date.now();
      
      await searchInput.fill('authentication');
      
      // Wait for search results to update
      await page.waitForTimeout(500);
      
      const searchTime = Date.now() - searchStartTime;
      
      // Assert search is fast (under 500ms)
      expect(searchTime).toBeLessThan(500);
      
      console.log(`Search performance: ${searchTime}ms`);
    }
    
    // Test filter performance
    const statusFilter = page.locator('select').filter({ hasText: /status|filter/i });
    if (await statusFilter.isVisible()) {
      const filterStartTime = Date.now();
      
      await statusFilter.selectOption('Draft');
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      const filterTime = Date.now() - filterStartTime;
      
      // Assert filtering is fast (under 300ms)
      expect(filterTime).toBeLessThan(300);
      
      console.log(`Filter performance: ${filterTime}ms`);
    }
  });

  test('measures memory usage during interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Perform various interactions
    const pages = ['Requirements', 'Test Cases', 'Configuration', 'Risks', 'Dashboard'];
    
    for (let i = 0; i < 3; i++) {
      for (const pageName of pages) {
        await page.click(`text=${pageName}`);
        await page.waitForSelector(`text=${pageName}`);
        await page.waitForTimeout(100);
      }
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
      
      console.log(`Memory usage increase: ${memoryIncrease} bytes (${memoryIncreasePercent.toFixed(2)}%)`);
      
      // Assert memory increase is reasonable (less than 50% increase)
      expect(memoryIncreasePercent).toBeLessThan(50);
    }
  });

  test('measures chart rendering performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Dashboard');
    
    const chartStartTime = Date.now();
    
    // Wait for charts to be present
    await page.waitForSelector('canvas, svg, [data-testid*="chart"]');
    
    // Wait for charts to finish rendering (check for content)
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      const svgs = document.querySelectorAll('svg');
      
      // Check if at least one chart has content
      for (const canvas of canvases) {
        const ctx = (canvas as HTMLCanvasElement).getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hasContent = imageData.data.some(pixel => pixel !== 0);
          if (hasContent) return true;
        }
      }
      
      for (const svg of svgs) {
        if (svg.children.length > 0) return true;
      }
      
      return false;
    }, { timeout: 5000 });
    
    const chartRenderTime = Date.now() - chartStartTime;
    
    // Assert chart rendering is reasonable (under 2 seconds)
    expect(chartRenderTime).toBeLessThan(2000);
    
    console.log(`Chart rendering time: ${chartRenderTime}ms`);
  });

  test('measures animation performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Look for animated elements
    const animatedElements = page.locator('[data-testid*="widget"], .widget, .animated');
    
    if (await animatedElements.count() > 0) {
      const animationStartTime = Date.now();
      
      // Trigger hover animations
      await animatedElements.first().hover();
      
      // Wait for animations to complete
      await page.waitForTimeout(1000);
      
      const animationTime = Date.now() - animationStartTime;
      
      // Assert animations are smooth (complete within 1 second)
      expect(animationTime).toBeLessThan(1000);
      
      console.log(`Animation performance: ${animationTime}ms`);
    }
  });
});
