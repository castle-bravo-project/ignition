/**
 * Dashboard Component Tests
 * 
 * Comprehensive unit tests for the main Dashboard component
 * including metrics calculation, rendering, and user interactions.
 */

import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from '../../../components/Dashboard';
import { createMockProjectData, render } from '../../test/utils';

// Mock the child components
vi.mock('../../../components/AiChat', () => ({
  default: ({ projectData, onDocumentUpdate }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'ai-chat' }, [
      'AI Chat Component',
      React.createElement('button', {
        onClick: () => onDocumentUpdate('test', 'test', 'test', 'AI')
      }, 'Update Document')
    ]);
  },
}));

vi.mock('../../../components/BadgeShowcase', () => ({
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'badge-showcase' }, 'Badge Showcase');
  },
}));

vi.mock('../../../components/RiskHeatMap', () => ({
  default: ({ risks, isInteractive }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'risk-heat-map' }, `Risk Heat Map - ${risks.length} risks`);
  },
}));

vi.mock('../../../components/RtmView', () => ({
  default: ({ projectData }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'rtm-view' }, 'RTM View');
  },
}));

describe('Dashboard Component', () => {
  const mockOnDocumentUpdate = vi.fn();
  const defaultProps = {
    projectData: createMockProjectData(),
    onDocumentUpdate: mockOnDocumentUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with all main sections', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('Project Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chat')).toBeInTheDocument();
    expect(screen.getByTestId('badge-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('risk-heat-map')).toBeInTheDocument();
    expect(screen.getByTestId('rtm-view')).toBeInTheDocument();
  });

  it('calculates and displays correct metrics', () => {
    const projectData = createMockProjectData({
      requirements: [
        { id: 'REQ-1', description: 'Test 1', status: 'Draft', priority: 'High', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'REQ-2', description: 'Test 2', status: 'Approved', priority: 'Medium', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      testCases: [
        { id: 'TC-1', description: 'Test 1', status: 'Passed', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'TC-2', description: 'Test 2', status: 'Failed', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      links: {
        'REQ-1': { tests: ['TC-1'], risks: [], cis: [], issues: [] },
        'REQ-2': { tests: [], risks: [], cis: [], issues: [] },
      },
    });

    render(<Dashboard {...defaultProps} projectData={projectData} />);

    // Check if metrics are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Total requirements
    expect(screen.getByText('50%')).toBeInTheDocument(); // Test coverage (1 out of 2 linked)
  });

  it('handles document updates correctly', () => {
    render(<Dashboard {...defaultProps} />);

    const updateButton = screen.getByText('Update Document');
    fireEvent.click(updateButton);

    expect(mockOnDocumentUpdate).toHaveBeenCalledWith('test', 'test', 'test', 'AI');
  });

  it('displays empty state when no data', () => {
    const emptyProjectData = createMockProjectData({
      requirements: [],
      testCases: [],
      risks: [],
    });

    render(<Dashboard {...defaultProps} projectData={emptyProjectData} />);

    expect(screen.getByText('0')).toBeInTheDocument(); // No requirements
    expect(screen.getByText('0%')).toBeInTheDocument(); // No coverage
  });

  it('renders with different project names', () => {
    const projectData = createMockProjectData({
      projectName: 'Custom Project Name',
    });

    render(<Dashboard {...defaultProps} projectData={projectData} />);

    // The project name might be displayed in the dashboard
    expect(screen.getByText('Project Dashboard')).toBeInTheDocument();
  });

  it('handles missing links gracefully', () => {
    const projectData = createMockProjectData({
      requirements: [
        { id: 'REQ-1', description: 'Test 1', status: 'Draft', priority: 'High', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      links: {}, // No links
    });

    render(<Dashboard {...defaultProps} projectData={projectData} />);

    expect(screen.getByText('0%')).toBeInTheDocument(); // No coverage due to no links
  });

  it('calculates CI coverage correctly', () => {
    const projectData = createMockProjectData({
      requirements: [
        { id: 'REQ-1', description: 'Test 1', status: 'Draft', priority: 'High', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'REQ-2', description: 'Test 2', status: 'Approved', priority: 'Medium', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      configurationItems: [
        { id: 'CI-1', name: 'Component 1', type: 'Software Component', version: '1.0', status: 'Baseline', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      links: {
        'REQ-1': { tests: [], risks: [], cis: ['CI-1'], issues: [] },
        'REQ-2': { tests: [], risks: [], cis: [], issues: [] },
      },
    });

    render(<Dashboard {...defaultProps} projectData={projectData} />);

    // Should show 50% CI coverage (1 out of 2 requirements linked to CIs)
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles risks display', () => {
    const projectData = createMockProjectData({
      risks: [
        { id: 'RISK-1', description: 'Test risk', probability: 'High', impact: 'High', status: 'Open', mitigation: 'Test', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'RISK-2', description: 'Test risk 2', probability: 'Low', impact: 'Low', status: 'Closed', mitigation: 'Test', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
    });

    render(<Dashboard {...defaultProps} projectData={projectData} />);

    expect(screen.getByText('Risk Heat Map - 2 risks')).toBeInTheDocument();
  });
});
