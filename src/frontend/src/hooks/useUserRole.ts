import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRole } from '../backend';

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const role = await actor.getCallerUserRole();
        console.log('useGetCallerUserRole: Role fetched', { role });
        return role;
      } catch (error) {
        console.error('useGetCallerUserRole: Failed to fetch role', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log('useIsCallerAdmin: Admin status fetched', { isAdmin });
        return isAdmin;
      } catch (error) {
        console.error('useIsCallerAdmin: Failed to fetch admin status', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
  });
}
