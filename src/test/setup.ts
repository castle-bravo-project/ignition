/**
 * Test Setup Configuration
 *
 * Global test setup for Vitest with React Testing Library
 * and custom matchers for enhanced testing capabilities.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock environment variables
beforeAll(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  vi.stubGlobal('localStorage', localStorageMock);

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  vi.stubGlobal('sessionStorage', sessionStorageMock);

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock fetch
  global.fetch = vi.fn();

  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Custom test utilities
export const mockProjectData = {
  projectName: 'Test Project',
  documents: {},
  requirements: [],
  testCases: [],
  configurationItems: [],
  processAssets: [],
  risks: [],
  links: {},
  riskCiLinks: {},
  issueCiLinks: {},
  issueRiskLinks: {},
  assetLinks: {},
};

export const createMockComponent = (name: string) => {
  return vi.fn().mockImplementation(({ children, ...props }: any) => {
    const React = require('react');
    return React.createElement(
      'div',
      {
        'data-testid': `mock-${name.toLowerCase()}`,
        ...props,
      },
      children
    );
  });
};

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: ({ children, ...props }: any) =>
        React.createElement('div', props, children),
      span: ({ children, ...props }: any) =>
        React.createElement('span', props, children),
      button: ({ children, ...props }: any) =>
        React.createElement('button', props, children),
      h1: ({ children, ...props }: any) =>
        React.createElement('h1', props, children),
      h2: ({ children, ...props }: any) =>
        React.createElement('h2', props, children),
      h3: ({ children, ...props }: any) =>
        React.createElement('h3', props, children),
      p: ({ children, ...props }: any) =>
        React.createElement('p', props, children),
    },
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
  };
});

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: createMockComponent('LineChart'),
  Bar: createMockComponent('BarChart'),
  Doughnut: createMockComponent('DoughnutChart'),
  Pie: createMockComponent('PieChart'),
}));

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      data: vi.fn(() => ({
        enter: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn(),
            style: vi.fn(),
            text: vi.fn(),
          })),
        })),
      })),
    })),
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn(() => ({
      range: vi.fn(),
    })),
  })),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: createMockComponent('Toaster'),
}));
