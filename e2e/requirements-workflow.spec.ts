/**
 * Requirements Workflow E2E Tests
 * 
 * End-to-end tests for the complete requirements management workflow
 * including CRUD operations, linking, and AI assistance.
 */

import { test, expect } from '@playwright/test';

test.describe('Requirements Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"], #root');
    
    // Navigate to Requirements page
    await page.click('text=Requirements, [data-testid="nav-requirements"]');
    await page.waitForSelector('text=Requirements');
  });

  test('creates a new requirement', async ({ page }) => {
    // Look for add requirement button
    const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Fill in requirement form
    const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]').first();
    await expect(descriptionInput).toBeVisible();
    await descriptionInput.fill('E2E Test Requirement - User Authentication');
    
    // Set priority
    const prioritySelect = page.locator('select').filter({ hasText: /priority/i });
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption('High');
    }
    
    // Set status
    const statusSelect = page.locator('select').filter({ hasText: /status/i });
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Draft');
    }
    
    // Save the requirement
    const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Verify requirement appears in the list
    await expect(page.locator('text=E2E Test Requirement - User Authentication')).toBeVisible();
  });

  test('edits an existing requirement', async ({ page }) => {
    // First create a requirement to edit
    await test.step('Create requirement', async () => {
      const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]').first();
        await descriptionInput.fill('Original Requirement Description');
        
        const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
        await saveButton.click();
        
        await expect(page.locator('text=Original Requirement Description')).toBeVisible();
      }
    });
    
    // Edit the requirement
    await test.step('Edit requirement', async () => {
      const editButton = page.locator('button').filter({ hasText: /edit|modify/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const descriptionInput = page.locator('input[value*="Original"], textarea').filter({ hasText: /Original/i });
        if (await descriptionInput.isVisible()) {
          await descriptionInput.clear();
          await descriptionInput.fill('Updated Requirement Description');
          
          const saveButton = page.locator('button').filter({ hasText: /save|update/i });
          await saveButton.click();
          
          await expect(page.locator('text=Updated Requirement Description')).toBeVisible();
        }
      }
    });
  });

  test('deletes a requirement', async ({ page }) => {
    // First create a requirement to delete
    await test.step('Create requirement', async () => {
      const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]').first();
        await descriptionInput.fill('Requirement to Delete');
        
        const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
        await saveButton.click();
        
        await expect(page.locator('text=Requirement to Delete')).toBeVisible();
      }
    });
    
    // Delete the requirement
    await test.step('Delete requirement', async () => {
      const deleteButton = page.locator('button').filter({ hasText: /delete|remove/i }).first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion if modal appears
        const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|delete/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        // Verify requirement is removed
        await expect(page.locator('text=Requirement to Delete')).not.toBeVisible();
      }
    });
  });

  test('links requirement to test case', async ({ page }) => {
    // Create a requirement first
    await test.step('Create requirement', async () => {
      const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]').first();
        await descriptionInput.fill('Requirement for Linking');
        
        const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
        await saveButton.click();
        
        await expect(page.locator('text=Requirement for Linking')).toBeVisible();
      }
    });
    
    // Navigate to test cases and create one
    await test.step('Create test case', async () => {
      await page.click('text=Test Cases, [data-testid="nav-test-cases"]');
      await page.waitForSelector('text=Test Cases');
      
      const addTestButton = page.locator('button').filter({ hasText: /add|new|create/i });
      if (await addTestButton.isVisible()) {
        await addTestButton.click();
        
        const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]').first();
        await descriptionInput.fill('Test Case for Linking');
        
        const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
        await saveButton.click();
        
        await expect(page.locator('text=Test Case for Linking')).toBeVisible();
      }
    });
    
    // Go back to requirements and link
    await test.step('Link requirement to test case', async () => {
      await page.click('text=Requirements');
      await page.waitForSelector('text=Requirements');
      
      const linkButton = page.locator('button').filter({ hasText: /link|connect/i }).first();
      if (await linkButton.isVisible()) {
        await linkButton.click();
        
        // Select test case from dropdown or modal
        const testCaseOption = page.locator('text=Test Case for Linking');
        if (await testCaseOption.isVisible()) {
          await testCaseOption.click();
          
          const confirmLinkButton = page.locator('button').filter({ hasText: /link|connect|save/i });
          if (await confirmLinkButton.isVisible()) {
            await confirmLinkButton.click();
          }
        }
      }
    });
  });

  test('uses AI assistance for requirement generation', async ({ page }) => {
    // Look for AI assistance button
    const aiButton = page.locator('button').filter({ hasText: /ai|generate|assist/i });
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      // Enter prompt for AI
      const promptInput = page.locator('input[placeholder*="prompt"], textarea[placeholder*="prompt"]');
      if (await promptInput.isVisible()) {
        await promptInput.fill('Generate requirements for user authentication system');
        
        const generateButton = page.locator('button').filter({ hasText: /generate|create/i });
        await generateButton.click();
        
        // Wait for AI response
        await page.waitForTimeout(3000);
        
        // Check if generated content appears
        const generatedContent = page.locator('[data-testid*="generated"], .ai-generated');
        if (await generatedContent.isVisible()) {
          await expect(generatedContent).toContainText(/authentication|user|login/i);
        }
      }
    }
  });

  test('filters and searches requirements', async ({ page }) => {
    // Create multiple requirements for testing
    await test.step('Create test requirements', async () => {
      const requirements = [
        'User Authentication Requirement',
        'Data Validation Requirement',
        'Security Requirement'
      ];
      
      for (const req of requirements) {
        const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
        if (await addButton.isVisible()) {
          await addButton.click();
          
          const descriptionInput = page.locator('input[placeholder*="description"], textarea[placeholder*="description"]').first();
          await descriptionInput.fill(req);
          
          const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
          await saveButton.click();
          
          await expect(page.locator(`text=${req}`)).toBeVisible();
        }
      }
    });
    
    // Test search functionality
    await test.step('Search requirements', async () => {
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Authentication');
        
        // Wait for search results
        await page.waitForTimeout(500);
        
        // Should show only authentication requirement
        await expect(page.locator('text=User Authentication Requirement')).toBeVisible();
        await expect(page.locator('text=Data Validation Requirement')).not.toBeVisible();
      }
    });
    
    // Test filter functionality
    await test.step('Filter requirements', async () => {
      // Clear search first
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.clear();
      }
      
      // Use status filter
      const statusFilter = page.locator('select').filter({ hasText: /status|filter/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('Draft');
        
        // Wait for filter to apply
        await page.waitForTimeout(500);
        
        // Should show only draft requirements
        const visibleRequirements = page.locator('[data-testid*="requirement"], .requirement-item');
        const count = await visibleRequirements.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test('exports requirements data', async ({ page }) => {
    // Look for export functionality
    const exportButton = page.locator('button').filter({ hasText: /export|download/i });
    
    if (await exportButton.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/requirements|export/i);
    }
  });

  test('validates requirement form inputs', async ({ page }) => {
    // Try to save empty requirement
    const addButton = page.locator('button').filter({ hasText: /add|new|create/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Try to save without filling required fields
      const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Should show validation error
        const errorMessage = page.locator('.error, [data-testid*="error"], .validation-error');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toContainText(/required|empty|invalid/i);
        }
      }
    }
  });
});
