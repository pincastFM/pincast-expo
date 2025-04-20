import { vi } from 'vitest';
import * as httpMocks from 'node-mocks-http';
import { H3Event } from 'h3';

import type { RequestMethod } from 'node-mocks-http';

/**
 * Creates a properly mocked H3 event object using node-mocks-http
 */
export function createMockH3Event(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}): H3Event {
  // Create mock request and response
  const req = httpMocks.createRequest({
    method: (options.method || 'GET') as RequestMethod,
    url: options.url || '/',
    headers: options.headers || {},
    body: options.body
  });
  
  const res = httpMocks.createResponse();
  
  // Import h3 dynamically to avoid circular dependency issues
  const h3 = require('h3');
  
  // Create H3 event
  const event = h3.createEvent(req, res);
  
  // Add context with params if provided
  if (options.params) {
    event.context = event.context || {};
    event.context.params = options.params;
  }
  
  // Add query params if provided
  if (options.query) {
    event.context = event.context || {};
    event.context.query = options.query;
  }
  
  return event;
}

/**
 * Creates a mock database response
 * @param data Data to be returned by the query
 * @returns A chainable mock database query object
 */
export function createMockDbQuery(data: any[]) {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(data),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue(data),
  };
}

/**
 * Helper to mock the db object properly
 * @param mockData Mock data to be returned by the query
 * @returns A mock db object
 */
export function mockDb(mockData: any[] = []) {
  return {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue(mockData),
        orderBy: vi.fn().mockImplementation(() => ({
          limit: vi.fn().mockImplementation(() => ({
            offset: vi.fn().mockResolvedValue(mockData),
          })),
          where: vi.fn().mockResolvedValue(mockData),
        })),
      })),
    })),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation(() => ({
        returning: vi.fn().mockResolvedValue(mockData),
      })),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          returning: vi.fn().mockResolvedValue(mockData),
        })),
      })),
    })),
  };
}