import { normalizeServerAddress } from './serverAddress';
import type { PreferredConnection } from '../hooks/usePreferredConnection';

/**
 * Derives a stable room key from connection settings for WebRTC room identification.
 * Uses normalized server addresses to ensure consistency.
 */
export function deriveRoomKey(connection: PreferredConnection): string {
  if (connection.type === 'iax-dvswitch') {
    const normalizedGateway = normalizeServerAddress(connection.gateway);
    return `iax-${normalizedGateway}-${connection.nodeNumber || 'default'}`;
  }

  if (connection.type === 'digital-voice') {
    const normalizedBmServer = normalizeServerAddress(connection.bmServerAddress || '');
    const normalizedGatewayUrl = normalizeServerAddress(connection.gatewayUrl || '');
    const gatewayRoom = connection.gatewayRoom || '';
    
    // Include gateway room in key for gateway-based sessions
    if (normalizedGatewayUrl && gatewayRoom) {
      return `dv-${connection.mode}-${normalizedBmServer}-${normalizedGatewayUrl}-${gatewayRoom}`;
    }
    
    return `dv-${connection.mode}-${normalizedBmServer}-${connection.talkgroup || 'default'}`;
  }

  if (connection.type === 'directory-based') {
    const normalizedAddress = normalizeServerAddress(connection.networkAddress);
    return `dir-${normalizedAddress}-${connection.talkgroupId}`;
  }

  return 'unknown';
}

/**
 * Derives a human-readable room label from connection settings.
 */
export function deriveRoomLabel(connection: PreferredConnection): string {
  if (connection.type === 'iax-dvswitch') {
    return `${connection.gateway} Node ${connection.nodeNumber || 'Default'}`;
  }

  if (connection.type === 'digital-voice') {
    const serverLabel = connection.bmServerLabel || connection.bmServerAddress || 'Unknown Server';
    const talkgroupLabel = connection.talkgroup ? ` TG${connection.talkgroup}` : '';
    return `${serverLabel}${talkgroupLabel}`;
  }

  if (connection.type === 'directory-based') {
    return `${connection.networkLabel} - ${connection.talkgroupName}`;
  }

  return 'Unknown Room';
}
