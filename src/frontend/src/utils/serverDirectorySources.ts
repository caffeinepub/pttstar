/**
 * Server Directory Sources Configuration
 * Manages GitHub raw source URLs for BrandMeister and AllStar server lists
 * with DroidStar-style defaults and metadata persistence
 */

const STORAGE_KEY_PREFIX = 'pttstar_server_directory_';

export interface ServerDirectorySource {
  brandmeister: string;
  allstar: string;
}

export interface ServerDirectoryMetadata {
  lastUpdated: number | null;
  lastError: string | null;
}

// Default GitHub raw URLs for server lists (DroidStar-style defaults)
const DEFAULT_SOURCES: ServerDirectorySource = {
  brandmeister: 'https://raw.githubusercontent.com/brandmeister/brandmeister-hosts/master/BM_Hosts.txt',
  allstar: 'https://raw.githubusercontent.com/AllStarLink/ASL-Nodes-Diff/main/asl-nodes.txt',
};

export function getServerDirectorySources(): ServerDirectorySource {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}sources`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        brandmeister: parsed.brandmeister || DEFAULT_SOURCES.brandmeister,
        allstar: parsed.allstar || DEFAULT_SOURCES.allstar,
      };
    }
  } catch (error) {
    console.error('Failed to load server directory sources:', error);
  }
  return DEFAULT_SOURCES;
}

export function setServerDirectorySources(sources: Partial<ServerDirectorySource>): void {
  try {
    const current = getServerDirectorySources();
    const updated = { ...current, ...sources };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}sources`, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save server directory sources:', error);
  }
}

export function getServerDirectoryMetadata(type: 'brandmeister' | 'allstar'): ServerDirectoryMetadata {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}metadata_${type}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Failed to load ${type} metadata:`, error);
  }
  return { lastUpdated: null, lastError: null };
}

export function setServerDirectoryMetadata(
  type: 'brandmeister' | 'allstar',
  metadata: ServerDirectoryMetadata
): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}metadata_${type}`, JSON.stringify(metadata));
  } catch (error) {
    console.error(`Failed to save ${type} metadata:`, error);
  }
}

export function resetServerDirectorySources(): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}sources`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}metadata_brandmeister`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}metadata_allstar`);
  } catch (error) {
    console.error('Failed to reset server directory sources:', error);
  }
}
