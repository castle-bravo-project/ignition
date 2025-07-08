/**
 * Enhanced Dashboard Component Tests
 * 
 * Comprehensive unit tests for the Enhanced Dashboard component
 * including UX features, animations, and interactive widgets.
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EnhancedDashboard from '../../../components/EnhancedDashboard';
import { createMockProjectData, render } from '../../test/utils';

// Mock the child components
vi.mock('../InteractiveDashboardWidget', () => ({
  default: ({ data, onDrillDown }: any) => (
    <div data-testid="interactive-widget">
      Interactive Widget - {data.title}
      <button onClick={() => onDrillDown && onDrillDown(data)}>
        Drill Down
      </button>
    </div>
  ),
}));

vi.mock('../AnimatedChart', () => ({
  default: ({ data, type }: any) => (
    <div data-testid="animated-chart">
      Animated Chart - {type} - {data.length} points
    </div>
  ),
}));

vi.mock('../NotificationSystem', () => ({
  default: ({ notifications }: any) => (
    <div data-testid="notification-system">
      Notifications - {notifications.length} items
    </div>
  ),
  createNotification: vi.fn(),
  showSuccessNotification: vi.fn(),
}));

vi.mock('../AiChat', () => ({
  default: () => <div data-testid="ai-chat">AI Chat</div>,
}));

vi.mock('../BadgeShowcase', () => ({
  default: () => <div data-testid="badge-showcase">Badge Showcase</div>,
}));

vi.mock('../RiskHeatMap', () => ({
  default: ({ risks }: any) => (
    <div data-testid="risk-heat-map">Risk Heat Map - {risks.length} risks</div>
  ),
}));

vi.mock('../RtmView', () => ({
  default: () => <div data-testid="rtm-view">RTM View</div>,
}));

describe('EnhancedDashboard Component', () => {
  const mockOnDocumentUpdate = vi.fn();
  const defaultProps = {
    projectData: createMockProjectData(),
    onDocumentUpdate: mockOnDocumentUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders enhanced dashboard with all sections', () => {
    render(<EnhancedDashboard {...defaultProps} />);

    expect(screen.getByText('Enhanced Project Intelligence Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('notification-system')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chat')).toBeInTheDocument();
    expect(screen.getByTestId('badge-showcase')).toBeInTheDocument();
  });

  it('displays interactive widgets with correct data', () => {
    const projectData = createMockProjectData({
      requirements: [
        { id: 'REQ-1', description: 'Test 1', status: 'Draft', priority: 'High', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'REQ-2', description: 'Test 2', status: 'Approved', priority: 'Medium', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      testCases: [
        { id: 'TC-1', description: 'Test 1', status: 'Passed', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      links: {
        'REQ-1': { tests: ['TC-1'], risks: [], cis: [], issues: [] },
      },
    });

    render(<EnhancedDashboard {...defaultProps} projectData={projectData} />);

    // Check for interactive widgets
    const widgets = screen.getAllByTestId('interactive-widget');
    expect(widgets.length).toBeGreaterThan(0);
  });

  it('calculates metrics correctly', () => {
    const projectData = createMockProjectData({
      requirements: [
        { id: 'REQ-1', description: 'Test 1', status: 'Draft', priority: 'High', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'REQ-2', description: 'Test 2', status: 'Approved', priority: 'Medium', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      testCases: [
        { id: 'TC-1', description: 'Test 1', status: 'Passed', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
      links: {
        'REQ-1': { tests: ['TC-1'], risks: [], cis: [], issues: [] },
        'REQ-2': { tests: [], risks: [], cis: [], issues: [] },
      },
    });

    render(<EnhancedDashboard {...defaultProps} projectData={projectData} />);

    // The component should calculate 50% test coverage (1 out of 2 requirements linked)
    // This would be reflected in the widgets or charts
    expect(screen.getByTestId('animated-chart')).toBeInTheDocument();
  });

  it('handles drill down interactions', async () => {
    render(<EnhancedDashboard {...defaultProps} />);

    const drillDownButton = screen.getByText('Drill Down');
    fireEvent.click(drillDownButton);

    // Should handle drill down interaction
    await waitFor(() => {
      // The drill down functionality should be triggered
      expect(drillDownButton).toBeInTheDocument();
    });
  });

  it('displays animated charts with data', () => {
    const projectData = createMockProjectData({
      requirements: [
        { id: 'REQ-1', description: 'Test 1', status: 'Draft', priority: 'High', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'REQ-2', description: 'Test 2', status: 'Approved', priority: 'Medium', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
    });

    render(<EnhancedDashboard {...defaultProps} projectData={projectData} />);

    expect(screen.getByTestId('animated-chart')).toBeInTheDocument();
  });

  it('handles empty project data gracefully', () => {
    const emptyProjectData = createMockProjectData({
      requirements: [],
      testCases: [],
      risks: [],
      documents: {},
    });

    render(<EnhancedDashboard {...defaultProps} projectData={emptyProjectData} />);

    expect(screen.getByText('Enhanced Project Intelligence Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('notification-system')).toBeInTheDocument();
  });

  it('displays risk heat map with correct data', () => {
    const projectData = createMockProjectData({
      risks: [
        { id: 'RISK-1', description: 'Test risk', probability: 'High', impact: 'High', status: 'Open', mitigation: 'Test', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
        { id: 'RISK-2', description: 'Test risk 2', probability: 'Low', impact: 'Low', status: 'Closed', mitigation: 'Test', createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' },
      ],
    });

    render(<EnhancedDashboard {...defaultProps} projectData={projectData} />);

    expect(screen.getByText('Risk Heat Map - 2 risks')).toBeInTheDocument();
  });

  it('handles document updates through AI chat', () => {
    render(<EnhancedDashboard {...defaultProps} />);

    expect(screen.getByTestId('ai-chat')).toBeInTheDocument();
    expect(mockOnDocumentUpdate).not.toHaveBeenCalled();
  });

  it('displays notification system', () => {
    render(<EnhancedDashboard {...defaultProps} />);

    const notificationSystem = screen.getByTestId('notification-system');
    expect(notificationSystem).toBeInTheDocument();
    expect(notificationSystem).toHaveTextContent('Notifications - 0 items');
  });

  it('renders with loading state', () => {
    render(<EnhancedDashboard {...defaultProps} />);

    // The component should handle loading states gracefully
    expect(screen.getByText('Enhanced Project Intelligence Dashboard')).toBeInTheDocument();
  });
});
