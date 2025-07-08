/**
 * GitHub Service Integration Tests
 *
 * Comprehensive tests for GitHub API integration
 * including repository operations, pull requests, and error handling.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getFileContent,
  getPullRequestFiles,
  getPullRequests,
  getRepoIssues,
  postCommentToPr,
  saveFileToRepo,
} from '../../../services/githubService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GitHub Service Integration Tests', () => {
  const mockSettings = {
    token: 'test-token',
    owner: 'test-owner',
    repo: 'test-repo',
    repoUrl: 'https://github.com/test-owner/test-repo',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPullRequests', () => {
    it('fetches pull requests successfully', async () => {
      const mockPRs = [
        {
          number: 1,
          title: 'Test PR',
          body: 'Test description',
          state: 'open',
          user: { login: 'testuser' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPRs),
      });

      const result = await getPullRequests(mockSettings);

      expect(result).toEqual(mockPRs);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/pulls',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
        })
      );
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getPullRequests(mockSettings)).rejects.toThrow(
        'GitHub API error: 404 Not Found'
      );
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(getPullRequests(mockSettings)).rejects.toThrow(
        'Network error'
      );
    });

    it('handles empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await getPullRequests(mockSettings);
      expect(result).toEqual([]);
    });
  });

  describe('getPullRequestFiles', () => {
    it('fetches PR files successfully', async () => {
      const mockFiles = [
        {
          filename: 'test.ts',
          status: 'modified',
          additions: 5,
          deletions: 2,
          patch: '+console.log("test");',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFiles),
      });

      const result = await getPullRequestFiles(mockSettings, 1);

      expect(result).toEqual(mockFiles);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/pulls/1/files',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
        })
      );
    });

    it('handles invalid PR number', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getPullRequestFiles(mockSettings, 999)).rejects.toThrow(
        'GitHub API error: 404 Not Found'
      );
    });
  });

  describe('getRepoIssues', () => {
    it('fetches repository issues successfully', async () => {
      const mockIssues = [
        {
          number: 1,
          title: 'Test Issue',
          body: 'Issue description',
          state: 'open',
          user: { login: 'testuser' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIssues),
      });

      const result = await getRepoIssues(mockSettings);

      expect(result).toEqual(mockIssues);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/issues',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
        })
      );
    });

    it('filters out pull requests from issues', async () => {
      const mockResponse = [
        {
          number: 1,
          title: 'Test Issue',
          body: 'Issue description',
          state: 'open',
          user: { login: 'testuser' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          number: 2,
          title: 'Test PR',
          body: 'PR description',
          state: 'open',
          user: { login: 'testuser' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          pull_request: {
            url: 'https://api.github.com/repos/test/test/pulls/2',
          },
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getRepoIssues(mockSettings);

      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
    });
  });

  describe('getFileContent', () => {
    it('fetches file content successfully', async () => {
      const mockFileData = {
        content: btoa('file content'), // Base64 encoded
        encoding: 'base64',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFileData),
      });

      const result = await getFileContent(mockSettings, 'test.txt');

      expect(result).toBe('file content');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/test.txt',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
        })
      );
    });

    it('handles file not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        getFileContent(mockSettings, 'nonexistent.txt')
      ).rejects.toThrow('GitHub API error: 404 Not Found');
    });

    it('handles binary files', async () => {
      const mockFileData = {
        content: 'binary-content-base64',
        encoding: 'base64',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFileData),
      });

      const result = await getFileContent(mockSettings, 'image.png');
      expect(typeof result).toBe('string');
    });
  });

  describe('saveFileToRepo', () => {
    it('saves new file successfully', async () => {
      const mockResponse = {
        content: { sha: 'new-sha' },
        commit: { sha: 'commit-sha' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await saveFileToRepo(
        mockSettings,
        'new-file.txt',
        'file content',
        'Add new file'
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/new-file.txt',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
          body: expect.stringContaining(btoa('file content')),
        })
      );
    });

    it('updates existing file successfully', async () => {
      const mockResponse = {
        content: { sha: 'updated-sha' },
        commit: { sha: 'commit-sha' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await saveFileToRepo(
        mockSettings,
        'existing-file.txt',
        'updated content',
        'Update file',
        'existing-sha'
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/existing-file.txt',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"sha":"existing-sha"'),
        })
      );
    });

    it('handles save errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
      });

      await expect(
        saveFileToRepo(mockSettings, 'test.txt', 'content', 'message')
      ).rejects.toThrow('GitHub API error: 422 Unprocessable Entity');
    });
  });

  describe('postCommentToPr', () => {
    it('posts comment successfully', async () => {
      const mockResponse = {
        id: 123,
        body: 'Test comment',
        user: { login: 'bot' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await postCommentToPr(mockSettings, 1, 'Test comment');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
          body: expect.stringContaining('"body":"Test comment"'),
        })
      );
    });

    it('handles comment posting errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(
        postCommentToPr(mockSettings, 1, 'Test comment')
      ).rejects.toThrow('GitHub API error: 403 Forbidden');
    });
  });

  describe('Authentication and headers', () => {
    it('includes proper authentication headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getPullRequests(mockSettings);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          }),
        })
      );
    });

    it('handles missing token', async () => {
      const settingsWithoutToken = { ...mockSettings, token: '' };

      await expect(getPullRequests(settingsWithoutToken)).rejects.toThrow();
    });
  });
});
