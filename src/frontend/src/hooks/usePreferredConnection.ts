import { normalizeServerAddress } from '../utils/serverAddress';

const CONNECTION_KEY = 'pttstar_preferred_connection';

export type IaxDvswitchConnection = {
  type: 'iax-dvswitch';
  gateway: string;
  iaxUsername?: string;
  iaxPassword?: string;
  userCallsign: string;
  port?: string;
  nodeNumber?: string;
  allstarUsername?: string;
  allstarPassword?: string;
};

export type DigitalVoiceConnection = {
  type: 'digital-voice';
  mode: string;
  reflector: string;
  talkgroup?: string;
  bmUsername?: string;
  bmPassword?: string;
  dmrId?: string;
  ssid?: string;
  bmServerAddress?: string;
  bmServerLabel?: string;
  gatewayUrl?: string;
  gatewayToken?: string;
  gatewayRoom?: string;
  gatewayUsername?: string;
  tgifHotspotSecurityPassword?: string;
};

export type DirectoryBasedConnection = {
  type: 'directory-based';
  networkLabel: string;
  networkAddress: string;
  talkgroupId: string;
  talkgroupName: string;
};

export type PreferredConnection = IaxDvswitchConnection | DigitalVoiceConnection | DirectoryBasedConnection;

export function saveConnection(connection: PreferredConnection): void {
  // Normalize server/gateway addresses before saving
  if (connection.type === 'iax-dvswitch') {
    connection.gateway = normalizeServerAddress(connection.gateway);
  } else if (connection.type === 'digital-voice') {
    if (connection.bmServerAddress) {
      connection.bmServerAddress = normalizeServerAddress(connection.bmServerAddress);
    }
    if (connection.gatewayUrl) {
      connection.gatewayUrl = normalizeServerAddress(connection.gatewayUrl);
    }
  } else if (connection.type === 'directory-based') {
    connection.networkAddress = normalizeServerAddress(connection.networkAddress);
  }

  sessionStorage.setItem(CONNECTION_KEY, JSON.stringify(connection));
}

export function loadConnection(): PreferredConnection | null {
  const stored = sessionStorage.getItem(CONNECTION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored connection:', error);
    return null;
  }
}

export function clearConnection(): void {
  sessionStorage.removeItem(CONNECTION_KEY);
}

export function isIaxDvswitchConnection(connection: PreferredConnection): connection is IaxDvswitchConnection {
  return connection.type === 'iax-dvswitch';
}

export function isDigitalVoiceConnection(connection: PreferredConnection): connection is DigitalVoiceConnection {
  return connection.type === 'digital-voice';
}

export function isDirectoryBasedConnection(connection: PreferredConnection): connection is DirectoryBasedConnection {
  return connection.type === 'directory-based';
}

export function isDigitalVoiceGatewayConfigured(connection: DigitalVoiceConnection): boolean {
  return !!(connection.gatewayUrl && connection.gatewayToken);
}

export function isBrandmeisterDmrConnection(connection: DigitalVoiceConnection): boolean {
  return connection.mode === 'dmr' && !!connection.bmServerAddress;
}

export function isTgifDmrConnection(connection: DigitalVoiceConnection): boolean {
  return connection.mode === 'dmr' && connection.reflector.toLowerCase().includes('tgif');
}

export function getBrandmeisterMissingFields(connection: DigitalVoiceConnection): string[] {
  const missing: string[] = [];
  if (!connection.reflector) missing.push('Network/Reflector');
  if (!connection.bmServerAddress) missing.push('BrandMeister Server');
  return missing;
}

export function getTgifMissingFields(connection: DigitalVoiceConnection): string[] {
  const missing: string[] = [];
  if (!connection.reflector) missing.push('Network/Reflector');
  if (!connection.tgifHotspotSecurityPassword) missing.push('TGIF Hotspot Security Password');
  return missing;
}

export function areBrandmeisterRequiredFieldsSatisfied(connection: DigitalVoiceConnection): boolean {
  // Required: reflector and bmServerAddress (server is auto-selected, no URL input needed)
  return !!(
    connection.reflector &&
    connection.bmServerAddress &&
    normalizeServerAddress(connection.bmServerAddress)
  );
}

export function areAllstarRequiredFieldsSatisfied(connection: IaxDvswitchConnection): boolean {
  // Required: gateway (auto-set to allstarlink.org) and nodeNumber
  return !!(
    connection.gateway &&
    normalizeServerAddress(connection.gateway) &&
    connection.nodeNumber
  );
}

export function isBrandmeisterConnectionReadyForAutoConnect(connection: DigitalVoiceConnection): boolean {
  return !!(
    connection.mode === 'dmr' &&
    connection.reflector &&
    connection.bmServerAddress &&
    normalizeServerAddress(connection.bmServerAddress) &&
    connection.gatewayUrl &&
    connection.gatewayToken
  );
}
