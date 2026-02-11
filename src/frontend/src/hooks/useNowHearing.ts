import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PersistentTransmission } from '../backend';

export function useGetNowHearing() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PersistentTransmission[]>({
    queryKey: ['nowHearing'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNowHearing();
    },
    enabled: !!actor && !actorFetching,
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });
}

export function useUpdateNowHearing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNowHearing();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nowHearing'] });
    },
  });
}
