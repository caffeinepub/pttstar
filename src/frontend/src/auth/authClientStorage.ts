/**
 * Dedicated storage adapter for the regenerated Internet Identity auth flow.
 * Uses a unique namespace to avoid conflicts with any existing auth storage.
 */

const STORAGE_KEY_PREFIX = 'pttstar_regenerated_auth_';
const AUTH_CLIENT_KEY = `${STORAGE_KEY_PREFIX}client`;

export interface AuthClientStorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * localStorage-backed storage adapter with regenerated-flow-only namespace
 */
export const regeneratedAuthStorage: AuthClientStorageAdapter = {
  async get(key: string): Promise<string | null> {
    try {
      const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
      return localStorage.getItem(fullKey);
    } catch (error) {
      console.error('[RegeneratedAuth] Storage get error:', error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
      localStorage.setItem(fullKey, value);
    } catch (error) {
      console.error('[RegeneratedAuth] Storage set error:', error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('[RegeneratedAuth] Storage remove error:', error);
    }
  },
};

/**
 * Clear all regenerated auth storage (for clean logout)
 */
export function clearRegeneratedAuthStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[RegeneratedAuth] Cleared all regenerated auth storage');
  } catch (error) {
    console.error('[RegeneratedAuth] Error clearing storage:', error);
  }
}
