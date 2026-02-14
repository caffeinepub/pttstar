/**
 * Received Clips Hook
 * React Query hook for fetching and parsing received audio clips from configured HTTP endpoint
 */

import { useQuery } from '@tanstack/react-query';
import { getPttClipHttpConfig } from '../utils/pttClipHttpConfig';

export interface ReceivedClip {
  id: string;
  url: string;
  label?: string;
  timestamp?: number;
}

async function fetchReceivedClips(): Promise<ReceivedClip[]> {
  const config = getPttClipHttpConfig();
  
  if (!config.receivedClipsUrl) {
    console.warn('Received clips URL not configured');
    return [];
  }

  const response = await fetch(config.receivedClipsUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch received clips: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Normalize the response to ReceivedClip[] format
  // Support various response formats
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      id: item.id || item.filename || `clip-${index}`,
      url: item.url || item.src || item.path || '',
      label: item.label || item.name || item.filename,
      timestamp: item.timestamp || item.time || item.date,
    }));
  }

  // If response is an object with a clips/items/data array
  if (data.clips) return normalizeClips(data.clips);
  if (data.items) return normalizeClips(data.items);
  if (data.data) return normalizeClips(data.data);

  throw new Error('Unexpected response format from received clips endpoint');
}

function normalizeClips(items: any[]): ReceivedClip[] {
  return items.map((item, index) => ({
    id: item.id || item.filename || `clip-${index}`,
    url: item.url || item.src || item.path || '',
    label: item.label || item.name || item.filename,
    timestamp: item.timestamp || item.time || item.date,
  }));
}

export function useReceivedClips() {
  const config = getPttClipHttpConfig();

  return useQuery<ReceivedClip[]>({
    queryKey: ['receivedClips', config.receivedClipsUrl],
    queryFn: fetchReceivedClips,
    enabled: !!config.receivedClipsUrl,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}
