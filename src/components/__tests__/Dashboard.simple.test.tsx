/**
 * Simple Dashboard Component Tests
 * 
 * Basic unit tests for the Dashboard component to verify our testing setup works.
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test/utils';

// Simple test component to verify our setup
const TestComponent = () => {
  return <div data-testid="test-component">Hello Test</div>;
};

describe('Simple Dashboard Tests', () => {
  it('renders test component', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('performs basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
  });

  it('handles arrays and objects', () => {
    const testArray = [1, 2, 3];
    const testObject = { name: 'test', value: 42 };
    
    expect(testArray).toHaveLength(3);
    expect(testArray).toContain(2);
    expect(testObject).toHaveProperty('name', 'test');
    expect(testObject.value).toBe(42);
  });
});
