import type { StoredConnection } from '../hooks/usePreferredConnection';
import { isIaxDvswitchConnection, isDirectoryConnection } from '../hooks/usePreferredConnection';

/**
 * Derive a stable room key from the current connection settings.
 * This key is used to scope WebRTC signaling to the correct room.
 */
export function deriveRoomKey(connection: StoredConnection | null): string {
  if (!connection) {
    return 'default-room';
  }

  if (isIaxDvswitchConnection(connection)) {
    // For IAX/DVSwitch: use gateway + node number
    const parts = [
      'iax',
      connection.gateway,
      connection.nodeNumber || 'no-node',
    ];
    return parts.join(':');
  }

  if (isDirectoryConnection(connection)) {
    // For directory connections: use network + talkgroup
    const parts = [
      'dir',
      connection.network.networkLabel,
      connection.talkgroup,
    ];
    return parts.join(':');
  }

  return 'default-room';
}

/**
 * Generate a human-readable label for the current room/connection.
 */
export function deriveRoomLabel(connection: StoredConnection | null): string {
  if (!connection) {
    return 'No Connection';
  }

  if (isIaxDvswitchConnection(connection)) {
    const parts = [connection.gateway];
    if (connection.nodeNumber) {
      parts.push(`Node ${connection.nodeNumber}`);
    }
    return parts.join(' / ');
  }

  if (isDirectoryConnection(connection)) {
    return `${connection.network.networkLabel} / ${connection.talkgroup}`;
  }

  return 'Unknown Connection';
}
