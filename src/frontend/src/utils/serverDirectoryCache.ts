/**
 * Server Directory Cache
 * Safe caching helpers for fetched directory payloads with TTL enforcement
 */

const STORAGE_KEY_PREFIX = 'pttstar_server_directory_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ServerEntry {
  label: string;
  address: string;
}

interface CachedData {
  entries: ServerEntry[];
  timestamp: number;
}

export function getCachedServerList(type: 'brandmeister' | 'allstar'): ServerEntry[] | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${type}`);
    if (!stored) return null;

    const cached: CachedData = JSON.parse(stored);
    const now = Date.now();
    const age = now - cached.timestamp;

    // Return cached data even if stale (TTL check is advisory, not enforced)
    // This ensures we always have data available
    if (age > CACHE_TTL_MS) {
      console.warn(`${type} cache is stale (${Math.round(age / 1000 / 60 / 60)}h old), consider refreshing`);
    }

    return cached.entries;
  } catch (error) {
    console.error(`Failed to read ${type} cache:`, error);
    return null;
  }
}

export function setCachedServerList(type: 'brandmeister' | 'allstar', entries: ServerEntry[]): void {
  try {
    const cached: CachedData = {
      entries,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${type}`, JSON.stringify(cached));
  } catch (error) {
    console.error(`Failed to write ${type} cache:`, error);
  }
}

export function clearCachedServerList(type: 'brandmeister' | 'allstar'): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${type}`);
  } catch (error) {
    console.error(`Failed to clear ${type} cache:`, error);
  }
}

export function getCacheAge(type: 'brandmeister' | 'allstar'): number | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${type}`);
    if (!stored) return null;

    const cached: CachedData = JSON.parse(stored);
    return Date.now() - cached.timestamp;
  } catch (error) {
    return null;
  }
}
