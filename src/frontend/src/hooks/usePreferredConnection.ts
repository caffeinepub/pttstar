// Connection persistence helper for directory-based, IAX/DVSwitch, and Digital Voice connections
import type { PersistentNetwork } from '../backend';

const STORAGE_KEY = 'pttstar-connection';

// Legacy directory-based connection (no discriminator for backward compatibility)
export interface DirectoryConnection {
  network: PersistentNetwork;
  talkgroup: string;
}

// IAX/DVSwitch connection with AllStar credentials
export interface IaxDvswitchConnection {
  type: 'iax-dvswitch';
  gateway: string;
  iaxUsername?: string;
  iaxPassword?: string;
  port?: string;
  nodeNumber?: string;
  userCallsign?: string;
  // AllStar credentials
  allstarId?: string;
  allstarPassword?: string;
}

// Digital Voice connection with BrandMeister server selection and gateway configuration
export interface DigitalVoiceConnection {
  type: 'digital-voice';
  mode: string;
  reflector: string;
  talkgroup?: string; // User-entered TG for DMR networks
  bmUsername?: string;
  bmPassword?: string;
  dmrId?: string;
  ssid?: string;
  // BrandMeister server selection
  bmServerLabel?: string;
  bmServerAddress?: string;
  // Digital Voice Gateway configuration for real transmission
  gatewayUrl?: string;
  gatewayToken?: string;
  gatewayRoom?: string;
  gatewayUsername?: string;
}

export type StoredConnection = DirectoryConnection | IaxDvswitchConnection | DigitalVoiceConnection;

// Type guard to check if connection is IAX/DVSwitch
export function isIaxDvswitchConnection(conn: StoredConnection): conn is IaxDvswitchConnection {
  return 'type' in conn && conn.type === 'iax-dvswitch';
}

// Type guard to check if connection is Digital Voice
export function isDigitalVoiceConnection(conn: StoredConnection): conn is DigitalVoiceConnection {
  return 'type' in conn && conn.type === 'digital-voice';
}

// Type guard to check if connection is directory-based
export function isDirectoryConnection(conn: StoredConnection): conn is DirectoryConnection {
  return 'network' in conn && 'talkgroup' in conn;
}

// Helper to check if Digital Voice gateway is configured
export function isDigitalVoiceGatewayConfigured(conn: DigitalVoiceConnection): boolean {
  return !!(conn.gatewayUrl && conn.gatewayUrl.trim());
}

// Save connection to sessionStorage
export function saveConnection(connection: StoredConnection): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  } catch (e) {
    console.error('Failed to save connection', e);
  }
}

// Load connection from sessionStorage with backward compatibility
export function loadConnection(): StoredConnection | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as any;
    
    // Handle backward compatibility for legacy username/password and destination fields
    if (parsed.type === 'iax-dvswitch') {
      const connection: IaxDvswitchConnection = {
        type: 'iax-dvswitch',
        gateway: parsed.gateway,
        iaxUsername: parsed.iaxUsername || parsed.username,
        iaxPassword: parsed.iaxPassword || parsed.password,
        port: parsed.port,
        nodeNumber: parsed.nodeNumber,
        userCallsign: parsed.userCallsign,
        allstarId: parsed.allstarId,
        allstarPassword: parsed.allstarPassword,
      };
      return connection;
    }
    
    // Handle Digital Voice connections with backward compatibility
    // Ignore legacy hotspotSecurity field if present
    if (parsed.type === 'digital-voice') {
      const connection: DigitalVoiceConnection = {
        type: 'digital-voice',
        mode: parsed.mode,
        reflector: parsed.reflector,
        talkgroup: parsed.talkgroup, // May be undefined for older saved connections
        bmUsername: parsed.bmUsername,
        bmPassword: parsed.bmPassword,
        // hotspotSecurity intentionally omitted (legacy field ignored)
        dmrId: parsed.dmrId,
        ssid: parsed.ssid,
        // BrandMeister server selection (new fields, backward compatible)
        bmServerLabel: parsed.bmServerLabel,
        bmServerAddress: parsed.bmServerAddress,
        // Digital Voice Gateway configuration (new fields, backward compatible)
        gatewayUrl: parsed.gatewayUrl,
        gatewayToken: parsed.gatewayToken,
        gatewayRoom: parsed.gatewayRoom,
        gatewayUsername: parsed.gatewayUsername,
      };
      return connection;
    }
    
    // Handle legacy directory connections
    return parsed as StoredConnection;
  } catch (e) {
    console.error('Failed to load connection', e);
    return null;
  }
}

// Clear connection from sessionStorage
export function clearConnection(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
