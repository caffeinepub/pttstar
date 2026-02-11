import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetFavoriteNetworks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['favoriteNetworks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavoriteNetworks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useToggleFavoriteNetwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (networkId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleFavoriteNetwork(networkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteNetworks'] });
    },
  });
}
