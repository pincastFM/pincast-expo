import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { create } from '../../src/commands/create';

// Mock dependencies
vi.mock('fs-extra');
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));
vi.mock('cross-spawn', () => ({
  default: vi.fn(() => ({
    on: (event: string, callback: (code: number) => void) => {
      // Simulate successful installation
      if (event === 'close') callback(0);
    }
  }))
}));
vi.mock('prompts', () => ({
  default: vi.fn(() => Promise.resolve({
    title: 'Test Project',
    slug: 'test-project',
    latitude: '37.7749',
    longitude: '-122.4194',
    radius: '1000',
    proceed: true,
    dir: 'test-app'
  }))
}));
vi.mock('../../src/config', () => ({
  isAuthenticated: vi.fn(() => true),
  saveProjectConfig: vi.fn()
}));

describe('create command', () => {
  const testDir = 'test-app';
  const resolvedPath = path.resolve(process.cwd(), testDir);
  
  beforeEach(() => {
    // Mock filesystem functions
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.ensureDirSync).mockImplementation(() => undefined);
    vi.mocked(fs.writeJSONSync).mockImplementation(() => undefined);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    vi.mocked(fs.readJSONSync).mockReturnValue({
      name: 'original-name',
      version: '1.0.0'
    });
    vi.mocked(fs.removeSync).mockImplementation(() => undefined);
    
    // Spy on console
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should create a new project in the specified directory', async () => {
    await create(testDir);
    
    // Check if directory was created
    expect(fs.ensureDirSync).toHaveBeenCalledWith(testDir);
    
    // Check if template files were written
    expect(fs.writeJSONSync).toHaveBeenCalledWith(
      expect.stringContaining(testDir),
      expect.any(Object),
      { spaces: 2 }
    );
    
    // Check if config was created
    expect(fs.writeJSONSync).toHaveBeenCalledWith(
      path.join(resolvedPath, 'pincast.json'),
      expect.objectContaining({
        title: 'Test Project',
        slug: 'test-project',
        geo: expect.any(Object)
      }),
      { spaces: 2 }
    );
    
    // Check if env file was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(resolvedPath, '.env'),
      expect.stringContaining('PINCAST_API_URL')
    );
    
    // Check for success message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('created successfully')
    );
  });
  
  it('should handle errors during project creation', async () => {
    // Simulate error during directory creation
    vi.mocked(fs.ensureDirSync).mockImplementation(() => {
      throw new Error('Failed to create directory');
    });
    
    // Mock process.exit to prevent actual exit
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    
    await create(testDir);
    
    // Check if error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create project directory')
    );
    
    // Check if process.exit was called
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});