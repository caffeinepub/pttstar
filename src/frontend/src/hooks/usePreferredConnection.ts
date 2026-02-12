import { normalizeServerAddress } from '../utils/serverAddress';

const CONNECTION_KEY = 'pttstar_preferred_connection';
const DV_AUTO_SAVE_ATTEMPTED_KEY = 'pttstar_dv_auto_save_attempted';
const IAX_AUTO_SAVE_ATTEMPTED_KEY = 'pttstar_iax_auto_save_attempted';

export type IaxDvswitchConnection = {
  type: 'iax-dvswitch';
  gateway: string;
  port?: string;
  iaxUsername?: string;
  iaxPassword?: string;
  userCallsign: string;
  nodeNumber?: string;
  allstarUsername?: string;
  allstarPassword?: string;
  phoneToIaxConfirmed?: boolean;
  codecType?: 'ulaw' | 'slin' | 'adpcm';
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
    const parsed = JSON.parse(stored);
    
    // Apply backward-compatible defaults for IAX connections
    if (parsed.type === 'iax-dvswitch') {
      return {
        ...parsed,
        phoneToIaxConfirmed: parsed.phoneToIaxConfirmed ?? false,
        codecType: parsed.codecType ?? 'ulaw',
      };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse stored connection:', error);
    return null;
  }
}

export function clearConnection(): void {
  sessionStorage.removeItem(CONNECTION_KEY);
  clearAutoSaveAttemptFlags();
}

export function clearAutoSaveAttemptFlags(): void {
  sessionStorage.removeItem(DV_AUTO_SAVE_ATTEMPTED_KEY);
  sessionStorage.removeItem(IAX_AUTO_SAVE_ATTEMPTED_KEY);
}

export function isIaxDvswitchConnection(connection: PreferredConnection | null): connection is IaxDvswitchConnection {
  return connection?.type === 'iax-dvswitch';
}

export function isDigitalVoiceConnection(connection: PreferredConnection | null): connection is DigitalVoiceConnection {
  return connection?.type === 'digital-voice';
}

export function isDirectoryBasedConnection(connection: PreferredConnection | null): connection is DirectoryBasedConnection {
  return connection?.type === 'directory-based';
}

export function areAllstarRequiredFieldsSatisfied(connection: IaxDvswitchConnection): boolean {
  return !!(connection.gateway && connection.gateway.trim() !== '');
}

export function areBrandmeisterRequiredFieldsSatisfied(connection: DigitalVoiceConnection): boolean {
  return !!(
    connection.mode &&
    connection.reflector &&
    connection.bmUsername &&
    connection.bmPassword &&
    connection.dmrId &&
    connection.ssid
  );
}

export function areTgifRequiredFieldsSatisfied(connection: DigitalVoiceConnection): boolean {
  return !!(
    connection.mode &&
    connection.reflector &&
    connection.bmUsername &&
    connection.tgifHotspotSecurityPassword &&
    connection.dmrId &&
    connection.ssid
  );
}

export function isDigitalVoiceGatewayConfigured(connection: DigitalVoiceConnection): boolean {
  return !!(connection.gatewayUrl && connection.gatewayUrl.trim() !== '');
}

export function isBrandmeisterDmrConnection(connection: DigitalVoiceConnection): boolean {
  return connection.mode === 'dmr' && connection.reflector === 'BrandMeister';
}

export function isTgifDmrConnection(connection: DigitalVoiceConnection): boolean {
  return connection.mode === 'dmr' && connection.reflector === 'TGIF';
}

export function getBrandmeisterMissingFields(connection: DigitalVoiceConnection): string[] {
  const missing: string[] = [];
  
  if (!connection.mode) missing.push('Mode');
  if (!connection.reflector) missing.push('Network');
  if (!connection.bmUsername) missing.push('Username');
  if (!connection.bmPassword) missing.push('Password');
  if (!connection.dmrId) missing.push('DMR ID');
  if (!connection.ssid) missing.push('SSID');
  
  return missing;
}

export function getTgifMissingFields(connection: DigitalVoiceConnection): string[] {
  const missing: string[] = [];
  
  if (!connection.mode) missing.push('Mode');
  if (!connection.reflector) missing.push('Network');
  if (!connection.bmUsername) missing.push('Username');
  if (!connection.tgifHotspotSecurityPassword) missing.push('Hotspot Security Password');
  if (!connection.dmrId) missing.push('DMR ID');
  if (!connection.ssid) missing.push('SSID');
  
  return missing;
}
