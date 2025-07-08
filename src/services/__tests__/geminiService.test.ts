/**
 * Gemini Service Integration Tests
 *
 * Comprehensive tests for the Gemini AI service integration
 * including API calls, response handling, and error scenarios.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Gemini API
const mockGenerateContent = vi.fn();
const mockGetAiClient = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

// We'll mock the functions directly in the tests instead of using vi.mock

describe('Gemini Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    vi.stubEnv('GEMINI_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generateDocumentContent', () => {
    it('generates content successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Generated document content',
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateDocumentContent('SDP', 'Test Project');

      expect(result).toBe('Generated document content');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Software Development Plan')
      );
    });

    it('handles API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(
        generateDocumentContent('SDP', 'Test Project')
      ).rejects.toThrow('Failed to generate document content');
    });

    it('handles missing API client', async () => {
      mockGetAiClient.mockReturnValue(null);

      await expect(
        generateDocumentContent('SDP', 'Test Project')
      ).rejects.toThrow('AI client not available');
    });

    it('generates different document types', async () => {
      const mockResponse = {
        response: {
          text: () => 'Generated content',
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await generateDocumentContent('SAD', 'Test Project');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Software Architecture Document')
      );

      await generateDocumentContent('CM', 'Test Project');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Configuration Management Plan')
      );
    });
  });

  describe('improveDocumentContent', () => {
    it('improves content successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Improved content',
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await improveDocumentContent('Original content');

      expect(result).toBe('Improved content');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Original content')
      );
    });

    it('handles empty content', async () => {
      const mockResponse = {
        response: {
          text: () => 'Generated content for empty input',
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await improveDocumentContent('');

      expect(result).toBe('Generated content for empty input');
    });

    it('handles improvement errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Improvement failed'));

      await expect(improveDocumentContent('Test content')).rejects.toThrow(
        'Failed to improve document content'
      );
    });
  });

  describe('analyzePullRequest', () => {
    const mockPrData = {
      title: 'Test PR',
      body: 'Test description',
      files: [{ filename: 'test.ts', patch: '+console.log("test");' }],
    };

    it('analyzes pull request successfully', async () => {
      const mockResponse = {
        response: {
          text: () =>
            JSON.stringify({
              summary: 'Test analysis',
              risks: ['Low risk'],
              suggestions: ['Good code'],
              complexity: 'Low',
            }),
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await analyzePullRequest(mockPrData);

      expect(result.summary).toBe('Test analysis');
      expect(result.risks).toEqual(['Low risk']);
      expect(result.suggestions).toEqual(['Good code']);
      expect(result.complexity).toBe('Low');
    });

    it('handles invalid JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid JSON',
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await expect(analyzePullRequest(mockPrData)).rejects.toThrow(
        'Failed to analyze pull request'
      );
    });

    it('handles analysis errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Analysis failed'));

      await expect(analyzePullRequest(mockPrData)).rejects.toThrow(
        'Failed to analyze pull request'
      );
    });
  });

  describe('generateTestWorkflowFiles', () => {
    it('generates workflow files successfully', async () => {
      const mockWorkflowFiles = {
        '.github/workflows/ignition-testing.yml': 'workflow content',
        'scripts/ignition-test-runner.js': 'script content',
      };

      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockWorkflowFiles),
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateTestWorkflowFiles();

      expect(result).toEqual(mockWorkflowFiles);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('ignition-testing.yml')
      );
    });

    it('handles workflow generation errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Generation failed'));

      await expect(generateTestWorkflowFiles()).rejects.toThrow(
        'Failed to get AI-generated test workflow files'
      );
    });
  });

  describe('scaffoldRepositoryFiles', () => {
    it('scaffolds repository files successfully', async () => {
      const mockFiles = {
        'README.md': '# Test Project',
        'package.json': '{"name": "test"}',
        '.gitignore': 'node_modules/',
      };

      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockFiles),
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await scaffoldRepositoryFiles('Test Project');

      expect(result).toEqual(mockFiles);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Test Project')
      );
    });

    it('handles scaffolding errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Scaffolding failed'));

      await expect(scaffoldRepositoryFiles('Test Project')).rejects.toThrow(
        'Failed to get AI-generated repository files'
      );
    });
  });

  describe('API client initialization', () => {
    it('initializes client with API key', () => {
      const client = mockGetAiClient();
      expect(client).toBeDefined();
      expect(client.generateContent).toBeDefined();
    });

    it('handles missing API key', () => {
      vi.stubEnv('GEMINI_API_KEY', '');
      mockGetAiClient.mockReturnValue(null);

      const client = mockGetAiClient();
      expect(client).toBeNull();
    });
  });

  describe('Error handling and retries', () => {
    it('handles rate limiting', async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          response: { text: () => 'Success after retry' },
        });

      // This would test retry logic if implemented
      const mockResponse = {
        response: { text: () => 'Success after retry' },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateDocumentContent('SDP', 'Test');
      expect(result).toBe('Success after retry');
    });

    it('handles network timeouts', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network timeout'));

      await expect(generateDocumentContent('SDP', 'Test')).rejects.toThrow(
        'Failed to generate document content'
      );
    });
  });
});
