import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetFavoriteNetworks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['favoriteNetworks'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const favorites = await actor.getFavoriteNetworks();
        console.log('useGetFavoriteNetworks: Fetched favorites', {
          count: favorites.length,
        });
        return favorites;
      } catch (error) {
        console.error('useGetFavoriteNetworks: Failed to fetch favorites', {
          error: error instanceof Error ? error.message : String(error),
        });
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

export function useToggleFavoriteNetwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (networkId: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        console.log('useToggleFavoriteNetwork: Toggling favorite', { networkId });
        const result = await actor.toggleFavoriteNetwork(networkId);
        console.log('useToggleFavoriteNetwork: Toggle successful', { isFavorite: result });
        return result;
      } catch (error) {
        console.error('useToggleFavoriteNetwork: Failed to toggle favorite', {
          networkId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteNetworks'] });
    },
    retry: 1,
  });
}
