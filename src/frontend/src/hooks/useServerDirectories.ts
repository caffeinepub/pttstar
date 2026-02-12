/**
 * Server Directories Hook
 * React Query-based hook for managing BrandMeister and AllStar server directories
 * with failure-tolerant caching (preserves cached data on fetch failure)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServerDirectorySources,
  setServerDirectorySources,
  getServerDirectoryMetadata,
  setServerDirectoryMetadata,
  type ServerDirectorySource,
} from '../utils/serverDirectorySources';
import {
  getCachedServerList,
  setCachedServerList,
  getCacheAge,
  type ServerEntry,
} from '../utils/serverDirectoryCache';
import { fetchBrandmeisterServers, fetchAllstarServers } from '../utils/serverDirectoryFetch';

export function useServerDirectorySources() {
  return useQuery({
    queryKey: ['serverDirectorySources'],
    queryFn: () => getServerDirectorySources(),
    staleTime: Infinity,
  });
}

export function useUpdateServerDirectorySources() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sources: Partial<ServerDirectorySource>) => {
      setServerDirectorySources(sources);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverDirectorySources'] });
    },
  });
}

export function useBrandmeisterServers() {
  const { data: sources } = useServerDirectorySources();

  return useQuery<ServerEntry[]>({
    queryKey: ['brandmeisterServers'],
    queryFn: async () => {
      // Try cache first
      const cached = getCachedServerList('brandmeister');
      if (cached && cached.length > 0) {
        return cached;
      }

      // Fetch from GitHub
      if (!sources?.brandmeister) {
        console.warn('BrandMeister source URL not configured, returning empty list');
        return [];
      }

      try {
        const entries = await fetchBrandmeisterServers(sources.brandmeister);
        setCachedServerList('brandmeister', entries);
        setServerDirectoryMetadata('brandmeister', {
          lastUpdated: Date.now(),
          lastError: null,
        });
        return entries;
      } catch (error: any) {
        console.error('Failed to fetch BrandMeister servers, using cached data:', error);
        setServerDirectoryMetadata('brandmeister', {
          lastUpdated: getServerDirectoryMetadata('brandmeister').lastUpdated,
          lastError: error.message || 'Fetch failed',
        });
        // Return cached data even if fetch failed
        return cached || [];
      }
    },
    enabled: !!sources,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false, // Don't retry, use cached data instead
  });
}

export function useAllstarServers() {
  const { data: sources } = useServerDirectorySources();

  return useQuery<ServerEntry[]>({
    queryKey: ['allstarServers'],
    queryFn: async () => {
      // Try cache first
      const cached = getCachedServerList('allstar');
      if (cached && cached.length > 0) {
        return cached;
      }

      // Fetch from GitHub
      if (!sources?.allstar) {
        console.warn('AllStar source URL not configured, returning empty list');
        return [];
      }

      try {
        const entries = await fetchAllstarServers(sources.allstar);
        setCachedServerList('allstar', entries);
        setServerDirectoryMetadata('allstar', {
          lastUpdated: Date.now(),
          lastError: null,
        });
        return entries;
      } catch (error: any) {
        console.error('Failed to fetch AllStar servers, using cached data:', error);
        setServerDirectoryMetadata('allstar', {
          lastUpdated: getServerDirectoryMetadata('allstar').lastUpdated,
          lastError: error.message || 'Fetch failed',
        });
        // Return cached data even if fetch failed
        return cached || [];
      }
    },
    enabled: !!sources,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false, // Don't retry, use cached data instead
  });
}

export function useRefreshBrandmeisterServers() {
  const queryClient = useQueryClient();
  const { data: sources } = useServerDirectorySources();

  return useMutation({
    mutationFn: async () => {
      if (!sources?.brandmeister) {
        throw new Error('BrandMeister source URL not configured');
      }

      const entries = await fetchBrandmeisterServers(sources.brandmeister);
      setCachedServerList('brandmeister', entries);
      setServerDirectoryMetadata('brandmeister', {
        lastUpdated: Date.now(),
        lastError: null,
      });

      return entries;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['brandmeisterServers'], data);
      queryClient.invalidateQueries({ queryKey: ['brandmeisterMetadata'] });
    },
    onError: (error: Error) => {
      const metadata = getServerDirectoryMetadata('brandmeister');
      setServerDirectoryMetadata('brandmeister', {
        lastUpdated: metadata.lastUpdated,
        lastError: error.message,
      });
      queryClient.invalidateQueries({ queryKey: ['brandmeisterMetadata'] });
    },
  });
}

export function useRefreshAllstarServers() {
  const queryClient = useQueryClient();
  const { data: sources } = useServerDirectorySources();

  return useMutation({
    mutationFn: async () => {
      if (!sources?.allstar) {
        throw new Error('AllStar source URL not configured');
      }

      const entries = await fetchAllstarServers(sources.allstar);
      setCachedServerList('allstar', entries);
      setServerDirectoryMetadata('allstar', {
        lastUpdated: Date.now(),
        lastError: null,
      });

      return entries;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['allstarServers'], data);
      queryClient.invalidateQueries({ queryKey: ['allstarMetadata'] });
    },
    onError: (error: Error) => {
      const metadata = getServerDirectoryMetadata('allstar');
      setServerDirectoryMetadata('allstar', {
        lastUpdated: metadata.lastUpdated,
        lastError: error.message,
      });
      queryClient.invalidateQueries({ queryKey: ['allstarMetadata'] });
    },
  });
}

export function useBrandmeisterMetadata() {
  return useQuery({
    queryKey: ['brandmeisterMetadata'],
    queryFn: () => getServerDirectoryMetadata('brandmeister'),
    staleTime: 5000,
  });
}

export function useAllstarMetadata() {
  return useQuery({
    queryKey: ['allstarMetadata'],
    queryFn: () => getServerDirectoryMetadata('allstar'),
    staleTime: 5000,
  });
}
