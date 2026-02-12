import { normalizeServerAddress } from './serverAddress';
import type { PreferredConnection } from '../hooks/usePreferredConnection';

/**
 * Derives a stable room key from connection settings.
 * Used for WebRTC signaling and activity tracking.
 */
export function deriveRoomKey(connection: PreferredConnection): string {
  if (connection.type === 'iax-dvswitch') {
    // Use normalized gateway address for stable key
    const normalizedGateway = normalizeServerAddress(connection.gateway);
    return `iax:${normalizedGateway}`;
  }

  if (connection.type === 'digital-voice') {
    // Use normalized reflector for stable key
    const normalizedReflector = normalizeServerAddress(connection.reflector);
    return `dv:${connection.mode}:${normalizedReflector}:${connection.talkgroup || 'default'}`;
  }

  if (connection.type === 'directory-based') {
    // Use normalized network address for stable key
    const normalizedAddress = normalizeServerAddress(connection.networkAddress);
    return `dir:${normalizedAddress}:${connection.talkgroupId}`;
  }

  return 'unknown';
}

/**
 * Derives a human-readable label from connection settings.
 * Used for UI display.
 */
export function deriveRoomLabel(connection: PreferredConnection): string {
  if (connection.type === 'iax-dvswitch') {
    return `IAX: ${connection.gateway}`;
  }

  if (connection.type === 'digital-voice') {
    return `${connection.mode}: ${connection.reflector} / TG ${connection.talkgroup || 'default'}`;
  }

  if (connection.type === 'directory-based') {
    return `${connection.networkLabel} / ${connection.talkgroupName}`;
  }

  return 'Unknown Connection';
}
