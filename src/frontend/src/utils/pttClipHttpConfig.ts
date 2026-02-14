/**
 * PTT Clip HTTP Configuration
 * Client-side localStorage-backed configuration for non-real-time clip HTTP settings
 */

const STORAGE_KEY_PREFIX = 'pttClipHttp_';

export interface PttClipHttpConfig {
  uploadUrl: string;
  receivedClipsUrl: string;
}

const DEFAULT_CONFIG: PttClipHttpConfig = {
  uploadUrl: '',
  receivedClipsUrl: '',
};

export function getPttClipHttpConfig(): PttClipHttpConfig {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}config`);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.warn('Failed to load PTT clip HTTP config:', err);
  }
  return DEFAULT_CONFIG;
}

export function setPttClipHttpConfig(config: Partial<PttClipHttpConfig>): void {
  try {
    const current = getPttClipHttpConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}config`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save PTT clip HTTP config:', err);
    throw new Error('Failed to save configuration');
  }
}

export function validateUploadUrl(url: string): string | null {
  if (!url.trim()) {
    return 'Upload URL is required';
  }
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

export function validateReceivedClipsUrl(url: string): string | null {
  if (!url.trim()) {
    return 'Received clips URL is required';
  }
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
}
