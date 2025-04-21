import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from './setup';
import { HttpResponse, http } from 'msw';
import { createPincastClient } from '../src/runtime/client';

describe('Pincast Client', () => {
  let client: ReturnType<typeof createPincastClient>;

  beforeEach(() => {
    // Reset location for each test
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com'),
      writable: true
    });
    
    // Create client with API base
    client = createPincastClient('https://api.pincast.fm');
  });

  it('should use configured API base URL', () => {
    // Intercept request to verify URL
    let requestUrl = '';
    server.use(
      http.get('https://api.pincast.fm/data/items', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json([{ id: '1', name: 'Test' }]);
      })
    );
    
    return client.collection('items').getAll().then(() => {
      expect(requestUrl).toContain('https://api.pincast.fm/data/items');
    });
  });

  it('should use dev proxy when in local development', () => {
    // Set location to localhost
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:3000'),
      writable: true
    });
    
    // Create new client
    const localClient = createPincastClient('https://api.pincast.fm');
    
    // Intercept request to verify URL
    let requestUrl = '';
    server.use(
      http.get('http://localhost:8787/data/items', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json([{ id: '1', name: 'Test' }]);
      })
    );
    
    return localClient.collection('items').getAll().then(() => {
      expect(requestUrl).toContain('http://localhost:8787/data/items');
    });
  });

  it('should add authorization header when token is provided', () => {
    // Intercept request to verify headers
    let authHeader = '';
    server.use(
      http.get('https://api.pincast.fm/data/items', ({ request }) => {
        authHeader = request.headers.get('Authorization') || '';
        return HttpResponse.json([{ id: '1', name: 'Test' }]);
      })
    );
    
    const token = 'test-token';
    return client.collection('items').getAll({}, token).then(() => {
      expect(authHeader).toBe(`Bearer ${token}`);
    });
  });

  it('should handle query parameters correctly', () => {
    // Intercept request to verify query params
    let requestUrl = '';
    server.use(
      http.get('https://api.pincast.fm/data/items', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json([{ id: '1', name: 'Test' }]);
      })
    );
    
    const params = {
      limit: 10,
      sort: 'name'
    };
    
    return client.collection('items').getAll(params).then(() => {
      expect(requestUrl).toContain('limit=10');
      expect(requestUrl).toContain('sort=name');
    });
  });

  it('should handle near query correctly', () => {
    // Intercept request to verify URL
    let requestUrl = '';
    server.use(
      http.get('https://api.pincast.fm/data/items/near', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json([{ id: '1', name: 'Test', distance: 100 }]);
      })
    );
    
    const point = { longitude: -73.93, latitude: 40.72 };
    const radius = 1500;
    
    return client.collection('items').near(point, radius).then((items) => {
      expect(requestUrl).toContain('lng=-73.93');
      expect(requestUrl).toContain('lat=40.72');
      expect(requestUrl).toContain('radius=1500');
      expect(items[0].distance).toBe(100);
    });
  });
});