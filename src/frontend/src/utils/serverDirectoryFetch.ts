/**
 * Server Directory Fetch
 * Fetch and parse logic for BrandMeister and AllStar server lists from GitHub
 */

import type { ServerEntry } from './serverDirectoryCache';

const FETCH_TIMEOUT_MS = 10000; // 10 seconds

export async function fetchBrandmeisterServers(url: string): Promise<ServerEntry[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    return parseBrandmeisterList(text);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    throw new Error(`Failed to fetch BrandMeister servers: ${error.message}`);
  }
}

export async function fetchAllstarServers(url: string): Promise<ServerEntry[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    return parseAllstarList(text);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    throw new Error(`Failed to fetch AllStar servers: ${error.message}`);
  }
}

function parseBrandmeisterList(text: string): ServerEntry[] {
  const entries: ServerEntry[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue; // Skip empty lines and comments
    }

    // Expected format: "Label|address:port" or "Label|address"
    const parts = trimmed.split('|');
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const address = parts[1].trim();
      if (label && address) {
        entries.push({ label, address });
      }
    } else {
      // Fallback: treat entire line as address, derive label from it
      const address = trimmed;
      const label = address.split('.')[0] || address;
      entries.push({ label, address });
    }
  }

  return entries;
}

function parseAllstarList(text: string): ServerEntry[] {
  const entries: ServerEntry[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue; // Skip empty lines and comments
    }

    // Expected format: "NodeNumber|Label|address:port" or similar
    const parts = trimmed.split('|');
    if (parts.length >= 2) {
      const label = parts[1]?.trim() || parts[0]?.trim();
      const address = parts[2]?.trim() || parts[1]?.trim();
      if (label && address) {
        entries.push({ label, address });
      }
    } else {
      // Fallback: treat entire line as address
      const address = trimmed;
      const label = address.split('.')[0] || address;
      entries.push({ label, address });
    }
  }

  return entries;
}
