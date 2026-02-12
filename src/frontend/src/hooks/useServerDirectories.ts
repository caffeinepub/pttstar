/**
 * Server Directories Hook
 * React Query-based hook for managing BrandMeister and AllStar server directories
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
    enabled: !!sources,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
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
    enabled: !!sources,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
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
    },
    onError: (error: Error) => {
      setServerDirectoryMetadata('brandmeister', {
        lastUpdated: getServerDirectoryMetadata('brandmeister').lastUpdated,
        lastError: error.message,
      });
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
    },
    onError: (error: Error) => {
      setServerDirectoryMetadata('allstar', {
        lastUpdated: getServerDirectoryMetadata('allstar').lastUpdated,
        lastError: error.message,
      });
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
