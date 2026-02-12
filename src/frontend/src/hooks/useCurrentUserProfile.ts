import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorWithError } from './useActorWithError';
import type { ImmutableUserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching, isError: actorError } = useActorWithError();

  const query = useQuery<ImmutableUserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('useGetCallerUserProfile: Profile fetched successfully', {
          hasProfile: profile !== null,
        });
        return profile;
      } catch (error) {
        console.error('useGetCallerUserProfile: Failed to fetch profile', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !actorError,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActorWithError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ImmutableUserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        console.log('useSaveCallerUserProfile: Saving profile', {
          callsign: profile.callsign,
          hasName: !!profile.name,
        });
        await actor.saveCallerUserProfile(profile);
        console.log('useSaveCallerUserProfile: Profile saved successfully');
      } catch (error) {
        console.error('useSaveCallerUserProfile: Failed to save profile', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    retry: 2,
  });
}
