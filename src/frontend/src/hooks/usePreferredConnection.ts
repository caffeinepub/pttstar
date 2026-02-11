// Connection persistence helper for both directory-based and IAX/DVSwitch connections
import type { PersistentNetwork } from '../backend';

const STORAGE_KEY = 'pttstar-connection';

// Legacy directory-based connection (no discriminator for backward compatibility)
export interface DirectoryConnection {
  network: PersistentNetwork;
  talkgroup: string;
}

// New IAX/DVSwitch connection
export interface IaxDvswitchConnection {
  type: 'iax-dvswitch';
  gateway: string;
  iaxUsername?: string;
  iaxPassword?: string;
  port?: string;
  nodeNumber?: string;
}

export type StoredConnection = DirectoryConnection | IaxDvswitchConnection;

// Type guard to check if connection is IAX/DVSwitch
export function isIaxDvswitchConnection(conn: StoredConnection): conn is IaxDvswitchConnection {
  return 'type' in conn && conn.type === 'iax-dvswitch';
}

// Type guard to check if connection is directory-based
export function isDirectoryConnection(conn: StoredConnection): conn is DirectoryConnection {
  return 'network' in conn && 'talkgroup' in conn;
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
      };
      return connection;
    }
    
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
