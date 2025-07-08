/**
 * Test Utilities
 * 
 * Reusable testing utilities, custom render functions,
 * and mock data generators for consistent testing.
 */

import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { ConfigurationItem, ProjectData, Requirement, Risk, TestCase } from '../../types';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const createMockRequirement = (overrides: Partial<Requirement> = {}): Requirement => ({
  id: 'REQ-001',
  description: 'Test requirement description',
  status: 'Active',
  priority: 'Medium',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'User',
  updatedBy: 'User',
  ...overrides,
});

export const createMockTestCase = (overrides: Partial<TestCase> = {}): TestCase => ({
  id: 'TC-001',
  description: 'Test case description',
  status: 'Passed',
  gherkin: 'Feature: Test\n  Scenario: Test scenario\n    Given test condition\n    When test action\n    Then test result',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'User',
  updatedBy: 'User',
  ...overrides,
});

export const createMockRisk = (overrides: Partial<Risk> = {}): Risk => ({
  id: 'RISK-001',
  description: 'Test risk description',
  probability: 'Medium',
  impact: 'High',
  status: 'Open',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'User',
  updatedBy: 'User',
  ...overrides,
});

export const createMockConfigurationItem = (overrides: Partial<ConfigurationItem> = {}): ConfigurationItem => ({
  id: 'CI-001',
  name: 'Test Configuration Item',
  type: 'Software Component',
  version: '1.0.0',
  status: 'Baseline',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'User',
  updatedBy: 'User',
  ...overrides,
});

export const createMockProjectData = (overrides: Partial<ProjectData> = {}): ProjectData => ({
  projectName: 'Test Project',
  documents: {
    sdp: {
      id: 'sdp',
      title: 'Software Development Plan',
      content: [],
    },
  },
  requirements: [createMockRequirement()],
  testCases: [createMockTestCase()],
  configurationItems: [createMockConfigurationItem()],
  processAssets: [],
  risks: [createMockRisk()],
  links: {
    'REQ-001': {
      tests: ['TC-001'],
      risks: ['RISK-001'],
      cis: ['CI-001'],
      issues: [],
    },
  },
  riskCiLinks: {},
  issueCiLinks: {},
  issueRiskLinks: {},
  assetLinks: {},
  assetUsage: {},
  auditLog: [],
  ...overrides,
});

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
    get store() {
      return { ...store };
    },
  };
};

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

// Mock API responses
export const mockApiResponse = function<T>(data: T, delay = 0): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message = 'API Error', delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Component testing helpers
export const getByTestId = (container: HTMLElement, testId: string) => {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`Element with data-testid="${testId}" not found`);
  }
  return element as HTMLElement;
};

export const queryByTestId = (container: HTMLElement, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
};

// Animation testing helpers
export const mockAnimationFrame = () => {
  let callbacks: FrameRequestCallback[] = [];
  let id = 0;

  const requestAnimationFrame = (callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return ++id;
  };

  const cancelAnimationFrame = (id: number) => {
    // Simple implementation for testing
  };

  const flush = () => {
    const currentCallbacks = callbacks;
    callbacks = [];
    currentCallbacks.forEach(callback => callback(performance.now()));
  };

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    flush,
  };
};
