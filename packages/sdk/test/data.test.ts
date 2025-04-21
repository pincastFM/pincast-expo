import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePincastData, initDataClient } from '../src/composables/usePincastData';
import { usePincastAuth } from '../src/composables/usePincastAuth';
import { createPincastClient } from '../src/runtime/client';
import { server } from './setup';
import { HttpResponse, http } from 'msw';

// Mock auth
vi.mock('../src/composables/usePincastAuth', () => {
  return {
    usePincastAuth: vi.fn().mockReturnValue({
      getToken: vi.fn().mockResolvedValue('test-token')
    })
  };
});

describe('usePincastData composable', () => {
  // Create client for testing
  const client = createPincastClient('https://api.pincast.fm');
  
  beforeEach(() => {
    vi.resetAllMocks();
    initDataClient(client);
    
    // Reset MSW handlers
    server.resetHandlers();
  });

  it('should get all items from a collection', async () => {
    // Setup mock response
    server.use(
      http.get('https://api.pincast.fm/data/test-collection', () => {
        return HttpResponse.json([
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' }
        ]);
      })
    );
    
    const data = usePincastData('test-collection');
    const items = await data.getAll();
    
    expect(items.length).toBe(2);
    expect(items[0].id).toBe('1');
    expect(items[1].name).toBe('Item 2');
  });

  it('should get a single item by ID', async () => {
    // Setup mock response
    server.use(
      http.get('https://api.pincast.fm/data/test-collection/1', () => {
        return HttpResponse.json({ id: '1', name: 'Item 1' });
      })
    );
    
    const data = usePincastData('test-collection');
    const item = await data.getById('1');
    
    expect(item).not.toBeNull();
    expect(item?.id).toBe('1');
    expect(item?.name).toBe('Item 1');
  });

  it('should return null for non-existent item', async () => {
    // Setup mock 404 response
    server.use(
      http.get('https://api.pincast.fm/data/test-collection/999', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );
    
    const data = usePincastData('test-collection');
    const item = await data.getById('999');
    
    expect(item).toBeNull();
  });

  it('should create a new item', async () => {
    // Setup mock response
    server.use(
      http.post('https://api.pincast.fm/data/test-collection', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          id: 'new-id',
          ...body
        });
      })
    );
    
    const data = usePincastData('test-collection');
    const newItem = await data.create({ name: 'New Item' });
    
    expect(newItem.id).toBe('new-id');
    expect(newItem.name).toBe('New Item');
  });

  it('should update an existing item', async () => {
    // Setup mock response
    server.use(
      http.patch('https://api.pincast.fm/data/test-collection/1', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          id: '1',
          name: 'Original Name',
          ...body
        });
      })
    );
    
    const data = usePincastData('test-collection');
    const updatedItem = await data.update('1', { description: 'Updated description' });
    
    expect(updatedItem.id).toBe('1');
    expect(updatedItem.description).toBe('Updated description');
  });

  it('should delete an item', async () => {
    // Setup mock response
    server.use(
      http.delete('https://api.pincast.fm/data/test-collection/1', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );
    
    const data = usePincastData('test-collection');
    const result = await data.remove('1');
    
    expect(result).toBe(true);
  });

  it('should handle delete errors', async () => {
    // Setup mock error response
    server.use(
      http.delete('https://api.pincast.fm/data/test-collection/error', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );
    
    const data = usePincastData('test-collection');
    const result = await data.remove('error');
    
    expect(result).toBe(false);
  });

  it('should find items near a point', async () => {
    // Setup mock response
    server.use(
      http.get('https://api.pincast.fm/data/test-collection/near', () => {
        return HttpResponse.json([
          { id: '1', name: 'Near Item 1', distance: 100 },
          { id: '2', name: 'Near Item 2', distance: 200 }
        ]);
      })
    );
    
    const data = usePincastData('test-collection');
    const nearbyItems = await data.near({ latitude: 40.7128, longitude: -74.006 }, 1000);
    
    expect(nearbyItems.length).toBe(2);
    expect(nearbyItems[0].distance).toBe(100);
    expect(nearbyItems[1].distance).toBe(200);
  });

  it('should store an item (create if no ID, update if ID exists)', async () => {
    // Setup mock responses
    server.use(
      http.post('https://api.pincast.fm/data/test-collection', async () => {
        return HttpResponse.json({ id: 'new-id', name: 'New Item' });
      }),
      
      http.patch('https://api.pincast.fm/data/test-collection/existing-id', async () => {
        return HttpResponse.json({ id: 'existing-id', name: 'Updated Item' });
      })
    );
    
    const data = usePincastData('test-collection');
    
    // Create new
    const newItem = await data.store({ name: 'New Item' });
    expect(newItem.id).toBe('new-id');
    
    // Update existing
    const updatedItem = await data.store({ id: 'existing-id', name: 'Updated Item' });
    expect(updatedItem.id).toBe('existing-id');
    expect(updatedItem.name).toBe('Updated Item');
  });

  it('should pass auth token to the API', async () => {
    // Mock the auth token
    (usePincastAuth().getToken as jest.Mock).mockResolvedValue('mock-auth-token');
    
    // Setup request inspector
    let authHeader = '';
    server.use(
      http.get('https://api.pincast.fm/data/test-collection', ({ request }) => {
        authHeader = request.headers.get('Authorization') || '';
        return HttpResponse.json([]);
      })
    );
    
    const data = usePincastData('test-collection');
    await data.getAll();
    
    expect(authHeader).toBe('Bearer mock-auth-token');
  });
});