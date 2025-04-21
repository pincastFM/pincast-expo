import { describe, it, expect, beforeEach } from 'vitest';
import { setupSDK, mockLogto, mockClient, mockTrack, mockIdentify } from './setup';
import { usePincastAuth } from '../src/composables/usePincastAuth';
import { usePincastLocation } from '../src/composables/usePincastLocation';
import { usePincastData } from '../src/composables/usePincastData';
import { usePincastAnalytics } from '../src/composables/usePincastAnalytics';

// This test suite specifically tests the integration of all SDK components
// with properly mocked dependencies to ensure they work together correctly
describe('SDK Integration', () => {
  // Reset and setup before each test
  beforeEach(() => {
    setupSDK();
  });

  describe('Core SDK functionality', () => {
    it('should authenticate users via Logto', async () => {
      const auth = usePincastAuth();
      
      // Check that all expected methods and properties exist
      expect(auth.signIn).toBeDefined();
      expect(auth.signOut).toBeDefined();
      expect(auth.getToken).toBeDefined();
      expect(auth.getSession).toBeDefined();
      expect(auth.refreshSession).toBeDefined();
      
      // Test authentication
      await auth.signIn();
      expect(mockLogto.signIn).toHaveBeenCalled();
      
      // Test token retrieval
      const token = await auth.getToken();
      expect(token).toBe('mock-token-123');
      expect(mockLogto.getAccessToken).toHaveBeenCalled();
    });
    
    it('should provide location services', async () => {
      const location = usePincastLocation();
      
      // Check that all expected methods and properties exist
      expect(location.getCurrentPosition).toBeDefined();
      expect(location.startWatching).toBeDefined();
      expect(location.stopWatching).toBeDefined();
      expect(location.distanceTo).toBeDefined();
      
      // Test getting current position
      const pos = await location.getCurrentPosition();
      expect(pos.latitude).toBe(40.7128);
      expect(pos.longitude).toBe(-74.006);
    });
    
    it('should provide data access', async () => {
      const testData = usePincastData('test-collection');
      
      // Check that all expected methods exist
      expect(testData.getAll).toBeDefined();
      expect(testData.getById).toBeDefined();
      expect(testData.create).toBeDefined();
      expect(testData.update).toBeDefined();
      expect(testData.remove).toBeDefined();
      expect(testData.near).toBeDefined();
      
      // Test data retrieval
      const items = await testData.getAll();
      expect(items).toEqual([{ id: 'item-1' }]);
      expect(mockClient.collection).toHaveBeenCalledWith('test-collection');
    });
    
    it('should track analytics events', async () => {
      const analytics = usePincastAnalytics();
      
      // Check that all expected methods exist
      expect(analytics.track).toBeDefined();
      expect(analytics.identify).toBeDefined();
      expect(analytics.pageView).toBeDefined();
      
      // Test event tracking
      await analytics.track('test_event', { value: 123 });
      expect(mockTrack).toHaveBeenCalled();
      
      // Test user identification
      await analytics.identify('user-456', { custom: 'value' });
      expect(mockIdentify).toHaveBeenCalled();
    });
  });
});