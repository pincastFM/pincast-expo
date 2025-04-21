import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logout } from '../src/commands/logout';
import * as configModule from '../src/config';

// Mock the config module
vi.mock('../src/config', () => ({
  getConfig: vi.fn(),
  clearAuthTokens: vi.fn()
}));

describe('Logout Command', () => {
  // Mock console.log
  const originalConsoleLog = console.log;
  let consoleOutput: string[] = [];
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock console.log
    consoleOutput = [];
    console.log = vi.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
  });
  
  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });
  
  it('should clear auth tokens when logged in', async () => {
    // Mock a logged in user
    vi.mocked(configModule.getConfig).mockReturnValue({
      get: vi.fn().mockReturnValue('user-123')
    } as any);
    
    await logout();
    
    // Check that clearAuthTokens was called
    expect(vi.mocked(configModule.clearAuthTokens)).toHaveBeenCalled();
  });
  
  it('should show message when not logged in', async () => {
    // Mock not logged in
    vi.mocked(configModule.getConfig).mockReturnValue({
      get: vi.fn().mockReturnValue(undefined)
    } as any);
    
    await logout();
    
    // Check that clearAuthTokens was not called
    expect(vi.mocked(configModule.clearAuthTokens)).not.toHaveBeenCalled();
  });
});