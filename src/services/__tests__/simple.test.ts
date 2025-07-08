/**
 * Simple Service Tests
 * 
 * Basic tests to verify our testing setup works for services.
 */

import { describe, expect, it, vi } from 'vitest';

// Simple utility functions to test
const addNumbers = (a: number, b: number): number => a + b;
const formatString = (str: string): string => str.toUpperCase();
const asyncFunction = async (value: string): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(`processed: ${value}`), 10);
  });
};

describe('Simple Service Tests', () => {
  it('tests basic math function', () => {
    expect(addNumbers(2, 3)).toBe(5);
    expect(addNumbers(-1, 1)).toBe(0);
    expect(addNumbers(0, 0)).toBe(0);
  });

  it('tests string formatting', () => {
    expect(formatString('hello')).toBe('HELLO');
    expect(formatString('Test')).toBe('TEST');
    expect(formatString('')).toBe('');
  });

  it('tests async function', async () => {
    const result = await asyncFunction('test');
    expect(result).toBe('processed: test');
  });

  it('tests mocking with vi', () => {
    const mockFn = vi.fn();
    mockFn.mockReturnValue('mocked result');
    
    const result = mockFn('test input');
    
    expect(result).toBe('mocked result');
    expect(mockFn).toHaveBeenCalledWith('test input');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('tests promise rejection', async () => {
    const failingFunction = async (): Promise<string> => {
      throw new Error('Test error');
    };

    await expect(failingFunction()).rejects.toThrow('Test error');
  });

  it('tests object properties', () => {
    const testObject = {
      id: 1,
      name: 'Test Object',
      active: true,
      metadata: {
        created: '2024-01-01',
        tags: ['test', 'object']
      }
    };

    expect(testObject).toHaveProperty('id', 1);
    expect(testObject).toHaveProperty('name', 'Test Object');
    expect(testObject.metadata.tags).toContain('test');
    expect(testObject.metadata.tags).toHaveLength(2);
  });
});
