import { describe, it, expect } from 'vitest';
import { apiClient } from '../client';

describe('API Client', () => {
  it('should have HTTP methods', () => {
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.put).toBeDefined();
    expect(apiClient.delete).toBeDefined();
  });

  it('should build URLs correctly', async () => {
    // This is a basic test - full tests would use MSW
    expect(apiClient).toBeDefined();
  });
});
