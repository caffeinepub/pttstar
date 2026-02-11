import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useQrzLookup() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (callsign: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Check if the backend has the qrzLookup method
      if (typeof (actor as any).qrzLookup !== 'function') {
        throw new Error('QRZ lookup is not configured on the backend. Please contact the administrator.');
      }
      
      const result = await (actor as any).qrzLookup(callsign);
      return result;
    },
  });
}
