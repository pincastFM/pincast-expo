import fetch from 'node-fetch';
import { getConfig } from './config';

// Constants
const API_BASE_URL = process.env.PINCAST_API_URL || 'https://api.pincast.fm';

// Types
export interface AppCreateRequest {
  title: string;
  slug: string;
  buildUrl: string;
  description?: string;
  geo: {
    center: [number, number]; // [longitude, latitude]
    radiusMeters: number;
  };
  heroUrl?: string;
  sdkVersion?: string;
}

export interface AppResponse {
  appId: string;
  versionId: string;
  dashboard: string;
  status: 'draft' | 'pending' | 'published' | 'hidden';
}

/**
 * API client for Pincast services
 */
export class PincastApi {
  private token: string;
  
  constructor(token?: string) {
    this.token = token || getConfig().get('devToken') || '';
    
    if (!this.token) {
      throw new Error('Authentication required. Please run `pincast login` first.');
    }
  }
  
  /**
   * Get headers with authentication
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Create a new app submission
   */
  async createApp(app: AppCreateRequest): Promise<AppResponse> {
    const response = await fetch(`${API_BASE_URL}/ci/apps`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(app)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create app: ${response.status} ${error}`);
    }
    
    return await response.json() as AppResponse;
  }
  
  /**
   * Get all apps for the current developer
   */
  async getApps(): Promise<AppResponse[]> {
    const response = await fetch(`${API_BASE_URL}/ci/apps`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get apps: ${response.status} ${error}`);
    }
    
    return await response.json() as AppResponse[];
  }
  
  /**
   * Get a specific app by ID
   */
  async getApp(id: string): Promise<AppResponse> {
    const response = await fetch(`${API_BASE_URL}/ci/apps/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get app: ${response.status} ${error}`);
    }
    
    return await response.json() as AppResponse;
  }
}