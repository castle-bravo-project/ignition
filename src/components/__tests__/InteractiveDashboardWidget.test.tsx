/**
 * Interactive Dashboard Widget Component Tests
 * 
 * Unit tests for the interactive dashboard widget component
 * including hover effects, drill-down functionality, and animations.
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InteractiveDashboardWidget from '../../../components/InteractiveDashboardWidget';
import { render } from '../../test/utils';

describe('InteractiveDashboardWidget Component', () => {
  const mockOnDrillDown = vi.fn();
  const mockOnRefresh = vi.fn();

  const defaultWidgetData = {
    id: 'widget-1',
    title: 'Test Widget',
    value: '42',
    unit: 'items',
    description: 'Test widget description',
    trend: 'up' as const,
    trendValue: '+5%',
    icon: 'BarChart3',
    color: 'blue',
    drillDownData: [
      { label: 'Item 1', value: 20 },
      { label: 'Item 2', value: 22 },
    ],
    lastUpdated: '2024-01-01T12:00:00Z',
    isLoading: false,
    hasError: false,
  };

  const defaultProps = {
    data: defaultWidgetData,
    onDrillDown: mockOnDrillDown,
    onRefresh: mockOnRefresh,
    className: 'test-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders widget with basic information', () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('items')).toBeInTheDocument();
    expect(screen.getByText('Test widget description')).toBeInTheDocument();
  });

  it('displays trend information correctly', () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    expect(screen.getByText('+5%')).toBeInTheDocument();
    // Should show up trend indicator
  });

  it('handles drill down interaction', async () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    const widget = screen.getByText('Test Widget').closest('div');
    expect(widget).toBeInTheDocument();

    if (widget) {
      fireEvent.click(widget);
      await waitFor(() => {
        expect(mockOnDrillDown).toHaveBeenCalledWith(defaultWidgetData);
      });
    }
  });

  it('handles refresh interaction', async () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    // Look for refresh button (might be an icon)
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledWith('widget-1');
    });
  });

  it('displays loading state', () => {
    const loadingData = { ...defaultWidgetData, isLoading: true };
    render(<InteractiveDashboardWidget {...defaultProps} data={loadingData} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorData = { ...defaultWidgetData, hasError: true };
    render(<InteractiveDashboardWidget {...defaultProps} data={errorData} />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('handles hover effects', async () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    const widget = screen.getByText('Test Widget').closest('div');
    expect(widget).toBeInTheDocument();

    if (widget) {
      fireEvent.mouseEnter(widget);
      
      // Should trigger hover effects (animations, etc.)
      await waitFor(() => {
        expect(widget).toHaveClass('test-class');
      });

      fireEvent.mouseLeave(widget);
    }
  });

  it('displays drill down data when expanded', async () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    const widget = screen.getByText('Test Widget').closest('div');
    if (widget) {
      fireEvent.click(widget);

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument();
      });
    }
  });

  it('handles different trend directions', () => {
    const downTrendData = {
      ...defaultWidgetData,
      trend: 'down' as const,
      trendValue: '-3%',
    };

    render(<InteractiveDashboardWidget {...defaultProps} data={downTrendData} />);

    expect(screen.getByText('-3%')).toBeInTheDocument();
    // Should show down trend indicator
  });

  it('handles widget without drill down data', () => {
    const noDrillDownData = {
      ...defaultWidgetData,
      drillDownData: undefined,
    };

    render(<InteractiveDashboardWidget {...defaultProps} data={noDrillDownData} />);

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    // Should not show drill down functionality
  });

  it('displays last updated time', () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    // Should display formatted last updated time
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });

  it('handles different color themes', () => {
    const redWidgetData = { ...defaultWidgetData, color: 'red' };
    render(<InteractiveDashboardWidget {...defaultProps} data={redWidgetData} />);

    const widget = screen.getByText('Test Widget').closest('div');
    expect(widget).toBeInTheDocument();
    // Should apply red color theme
  });

  it('handles missing optional props', () => {
    const minimalProps = {
      data: {
        id: 'widget-minimal',
        title: 'Minimal Widget',
        value: '10',
        description: 'Minimal description',
        isLoading: false,
        hasError: false,
      },
    };

    render(<InteractiveDashboardWidget {...minimalProps} />);

    expect(screen.getByText('Minimal Widget')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    render(<InteractiveDashboardWidget {...defaultProps} />);

    const widget = screen.getByText('Test Widget').closest('div');
    if (widget) {
      widget.focus();
      fireEvent.keyDown(widget, { key: 'Enter' });

      await waitFor(() => {
        expect(mockOnDrillDown).toHaveBeenCalledWith(defaultWidgetData);
      });
    }
  });
});
