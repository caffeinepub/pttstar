import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PersistentTransmission } from '../backend';

export function useGetNowHearing() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PersistentTransmission[]>({
    queryKey: ['nowHearing'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const transmissions = await actor.getNowHearing();
        return transmissions;
      } catch (error) {
        console.error('useGetNowHearing: Failed to fetch activity', {
          error: error instanceof Error ? error.message : String(error),
        });
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchOnWindowFocus: false, // Disable window focus refetch to prevent compounding with polling
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
  });
}

interface UpdateNowHearingParams {
  fromCallsign: string;
  network: string;
  talkgroup: string;
  dmrId?: bigint;
  dmrOperatorName?: string;
  dmrOperatorLocation?: string;
}

export function useUpdateNowHearing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateNowHearingParams) => {
      if (!actor) throw new Error('Actor not available');
      try {
        console.log('useUpdateNowHearing: Recording activity', {
          callsign: params.fromCallsign,
          network: params.network,
          talkgroup: params.talkgroup,
        });
        await actor.updateNowHearing(
          params.fromCallsign,
          params.network,
          params.talkgroup,
          params.dmrId ?? null,
          params.dmrOperatorName ?? null,
          params.dmrOperatorLocation ?? null
        );
      } catch (error) {
        console.error('useUpdateNowHearing: Failed to record activity', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nowHearing'] });
    },
    retry: 1,
  });
}
