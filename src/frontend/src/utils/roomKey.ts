import type { PersistentNetwork } from '../backend';
import type { IaxDvswitchConnection, DigitalVoiceConnection } from '../hooks/usePreferredConnection';

/**
 * Derives a stable, normalized room key from connection settings.
 * Different networks/reflectors/talkgroups produce distinct rooms.
 */
export function deriveRoomKey(
  connection:
    | { network: PersistentNetwork; talkgroup: string }
    | IaxDvswitchConnection
    | DigitalVoiceConnection
): string {
  if ('type' in connection) {
    if (connection.type === 'iax-dvswitch') {
      // IAX/DVSwitch: room key based on gateway + node number
      const gateway = connection.gateway.toLowerCase().trim();
      const node = connection.nodeNumber?.toLowerCase().trim() || 'default';
      return `iax-${gateway}-${node}`;
    }

    if (connection.type === 'digital-voice') {
      // Digital Voice: room key based on mode + reflector + talkgroup + BrandMeister server + gateway room
      const mode = connection.mode.toLowerCase().trim();
      const reflector = connection.reflector.toLowerCase().trim();
      const tg = connection.talkgroup?.toLowerCase().trim() || 'default';
      const bmServer = connection.bmServerAddress?.toLowerCase().trim() || '';
      const gatewayRoom = connection.gatewayRoom?.toLowerCase().trim() || '';
      
      // Include gateway room in room key if present (for gateway-specific scoping)
      if (gatewayRoom) {
        return `dv-${mode}-${reflector}-${bmServer}-${tg}-${gatewayRoom}`;
      }
      
      // Include BrandMeister server in room key if present
      if (bmServer) {
        return `dv-${mode}-${reflector}-${bmServer}-${tg}`;
      }
      
      return `dv-${mode}-${reflector}-${tg}`;
    }
  }

  // Directory-based connection
  const networkLabel = connection.network.networkLabel.toLowerCase().trim();
  const tg = connection.talkgroup.toLowerCase().trim();
  return `dir-${networkLabel}-${tg}`;
}

/**
 * Derives a human-readable label from connection settings.
 */
export function deriveRoomLabel(
  connection:
    | { network: PersistentNetwork; talkgroup: string }
    | IaxDvswitchConnection
    | DigitalVoiceConnection
): string {
  if ('type' in connection) {
    if (connection.type === 'iax-dvswitch') {
      // IAX/DVSwitch: label based on gateway + node
      const node = connection.nodeNumber || 'Default';
      return `IAX ${connection.gateway} (Node ${node})`;
    }

    if (connection.type === 'digital-voice') {
      // Digital Voice: label based on mode + reflector + talkgroup + BrandMeister server
      const mode = connection.mode.toUpperCase();
      const reflector = connection.reflector;
      const tg = connection.talkgroup || 'Default';
      
      // Include BrandMeister server in label if present
      if (connection.bmServerLabel) {
        return `${mode} ${reflector} (${connection.bmServerLabel}) TG ${tg}`;
      }
      
      return `${mode} ${reflector} TG ${tg}`;
    }
  }

  // Directory-based connection
  return `${connection.network.networkLabel} TG ${connection.talkgroup}`;
}
