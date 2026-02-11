import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { useEffect, useRef } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_QUERY_KEY = 'actor';

export function useActorWithError() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();
    const invalidationInProgressRef = useRef(false);
    
    const actorQuery = useQuery<backendInterface>({
        queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
        queryFn: async () => {
            try {
                const isAuthenticated = !!identity;
                const hasSecretParam = !!getSecretParameter('caffeineAdminToken');

                console.log('useActorWithError: Initializing actor', {
                    isAuthenticated,
                    hasIdentity: !!identity,
                    hasSecretParam,
                });

                if (!isAuthenticated) {
                    return await createActorWithConfig();
                }

                const actorOptions = {
                    agentOptions: {
                        identity
                    }
                };

                const actor = await createActorWithConfig(actorOptions);
                const adminToken = getSecretParameter('caffeineAdminToken') || '';
                await actor._initializeAccessControlWithSecret(adminToken);
                
                console.log('useActorWithError: Actor initialized successfully');
                return actor;
            } catch (error) {
                console.error('useActorWithError: Actor initialization failed', {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                });
                throw error;
            }
        },
        staleTime: Infinity,
        enabled: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    });

    useEffect(() => {
        if (actorQuery.data && !invalidationInProgressRef.current) {
            invalidationInProgressRef.current = true;
            
            queryClient.invalidateQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                },
                refetchType: 'none',
            });

            setTimeout(() => {
                invalidationInProgressRef.current = false;
            }, 100);
        }
    }, [actorQuery.data, queryClient]);

    return {
        actor: actorQuery.data || null,
        isFetching: actorQuery.isFetching,
        error: actorQuery.error as Error | null,
        isError: actorQuery.isError,
    };
}
