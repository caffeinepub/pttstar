import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PersistentNetwork } from '../backend';

export function useGetBuiltinNetworks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PersistentNetwork[]>({
    queryKey: ['builtinNetworks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBuiltinNetworks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSearchNetworks(searchText: string, searchField: string, sortField: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PersistentNetwork[]>({
    queryKey: ['searchNetworks', searchText, searchField, sortField],
    queryFn: async () => {
      if (!actor) return [];
      // Since searchNetworks doesn't exist in the backend, we'll filter client-side
      const networks = await actor.getBuiltinNetworks();
      
      if (!searchText) return networks;
      
      // Simple client-side filtering by network label
      return networks.filter(network => 
        network.networkLabel.toLowerCase().includes(searchText.toLowerCase())
      );
    },
    enabled: !!actor && !actorFetching,
  });
}
