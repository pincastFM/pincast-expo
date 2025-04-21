import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePincastAnalytics, initAnalytics } from '../src/composables/usePincastAnalytics';
import { usePincastAuth, initAuth } from '../src/composables/usePincastAuth';

// Mock auth
vi.mock('../src/composables/usePincastAuth', () => {
  const mockSession = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'player',
    isAuthenticated: true
  };
  
  return {
    usePincastAuth: vi.fn().mockReturnValue({
      getSession: vi.fn().mockResolvedValue(mockSession),
      getToken: vi.fn().mockResolvedValue('test-token'),
      session: { value: mockSession },
      isAuthenticated: { value: true },
      player: { value: { id: 'test-user-id', email: 'test@example.com' } },
      role: { value: 'player' }
    }),
    initAuth: vi.fn()
  };
});

describe('usePincastAnalytics composable', () => {
  const mockTrack = vi.fn().mockResolvedValue(true);
  const mockIdentify = vi.fn().mockResolvedValue(true);
  
  beforeEach(() => {
    vi.resetAllMocks();
    initAnalytics(mockTrack, mockIdentify);
  });

  it('should track events with user info', async () => {
    const analytics = usePincastAnalytics();
    
    await analytics.track('test_event', { foo: 'bar' });
    
    expect(mockTrack).toHaveBeenCalledWith('test_event', {
      player_id: 'test-user-id',
      foo: 'bar'
    });
  });

  it('should identify users with traits', async () => {
    const analytics = usePincastAnalytics();
    
    await analytics.identify('custom-id', { foo: 'bar' });
    
    expect(mockIdentify).toHaveBeenCalledWith('custom-id', {
      foo: 'bar'
    });
  });

  it('should use current user ID when no ID is provided for identify', async () => {
    const analytics = usePincastAnalytics();
    
    await analytics.identify(undefined, { foo: 'bar' });
    
    expect(mockIdentify).toHaveBeenCalledWith('test-user-id', {
      foo: 'bar'
    });
  });

  it('should track page views', async () => {
    const analytics = usePincastAnalytics();
    
    await analytics.pageView('/test-page', { referrer: '/home' });
    
    expect(mockTrack).toHaveBeenCalledWith('page_view', {
      player_id: 'test-user-id',
      page: '/test-page',
      referrer: '/home'
    });
  });

  it('should handle tracking errors gracefully', async () => {
    const errorTrack = vi.fn().mockRejectedValue(new Error('Tracking failed'));
    initAnalytics(errorTrack);
    
    const analytics = usePincastAnalytics();
    
    const result = await analytics.track('error_event');
    
    expect(result).toBe(false);
  });

  it('should handle identification errors gracefully', async () => {
    const errorIdentify = vi.fn().mockRejectedValue(new Error('Identification failed'));
    initAnalytics(undefined, errorIdentify);
    
    const analytics = usePincastAnalytics();
    
    const result = await analytics.identify('error-user');
    
    expect(result).toBe(false);
  });
});