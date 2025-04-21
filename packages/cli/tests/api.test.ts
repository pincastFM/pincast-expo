import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PincastApi, AppCreateRequest } from '../src/api';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch', () => {
  return {
    default: vi.fn()
  };
});

// Mock config
vi.mock('../src/config', () => {
  return {
    getConfig: () => ({
      get: (key: string) => key === 'devToken' ? 'mock-token' : null
    })
  };
});

describe('PincastApi', () => {
  let api: PincastApi;
  
  beforeEach(() => {
    api = new PincastApi('test-token');
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('createApp', () => {
    it('should create an app and return the response', async () => {
      // Mock app request
      const appRequest: AppCreateRequest = {
        title: 'Test App',
        slug: 'test-app',
        buildUrl: 'https://test-app.vercel.app',
        description: 'A test app',
        geo: {
          center: [-122.4194, 37.7749],
          radiusMeters: 1000
        }
      };
      
      // Mock response
      const mockResponse = {
        id: 'app-123',
        title: 'Test App',
        slug: 'test-app',
        status: 'pending',
        buildUrl: 'https://test-app.vercel.app',
        dashboardUrl: 'https://dashboard.pincast.fm/apps/app-123'
      };
      
      // Set up fetch mock
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      // Call API
      const result = await api.createApp(appRequest);
      
      // Check fetch was called correctly
      expect(fetch).toHaveBeenCalledWith(
        'https://api.pincast.fm/ci/apps',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appRequest)
        }
      );
      
      // Check result
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error if the request fails', async () => {
      // Mock app request
      const appRequest: AppCreateRequest = {
        title: 'Test App',
        slug: 'test-app',
        buildUrl: 'https://test-app.vercel.app'
      };
      
      // Set up fetch mock to fail
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });
      
      // Call API and expect it to throw
      await expect(api.createApp(appRequest)).rejects.toThrow('Failed to create app: 400 Bad Request');
    });
  });
  
  describe('getApps', () => {
    it('should return all apps', async () => {
      // Mock response
      const mockResponse = [
        {
          id: 'app-1',
          title: 'App 1',
          slug: 'app-1',
          status: 'approved',
          buildUrl: 'https://app-1.vercel.app',
          dashboardUrl: 'https://dashboard.pincast.fm/apps/app-1'
        },
        {
          id: 'app-2',
          title: 'App 2',
          slug: 'app-2',
          status: 'pending',
          buildUrl: 'https://app-2.vercel.app',
          dashboardUrl: 'https://dashboard.pincast.fm/apps/app-2'
        }
      ];
      
      // Set up fetch mock
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      // Call API
      const result = await api.getApps();
      
      // Check fetch was called correctly
      expect(fetch).toHaveBeenCalledWith(
        'https://api.pincast.fm/ci/apps',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Check result
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error if the request fails', async () => {
      // Set up fetch mock to fail
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      });
      
      // Call API and expect it to throw
      await expect(api.getApps()).rejects.toThrow('Failed to get apps: 401 Unauthorized');
    });
  });
});