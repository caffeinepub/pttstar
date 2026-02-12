/**
 * Gateway URL Bootstrap
 * Captures gateway-related URL parameters on app load and persists them to sessionStorage.
 * Infers connection presets (BrandMeister DMR, TGIF DMR, or AllStar) from captured parameters.
 * 
 * Reference: DroidStar-like behavior replicated from
 * http://pizzanbeer.net/droidstar/DroidStar-1faf794-android-arm32.apk
 * See frontend/docs/droidstar-settings-reference.md for details.
 */

import { normalizeServerAddress } from './serverAddress';
import type { PresetId } from './connectionPresets';

const GATEWAY_PARAMS_KEY = 'pttstar_gateway_params';
const AUTO_FLOW_ATTEMPTED_KEY = 'pttstar_auto_flow_attempted';

export interface GatewayParameters {
  gatewayUrl?: string;
  gatewayToken?: string;
  gatewayRoom?: string;
  gatewayUsername?: string;
  server?: string;
  gateway?: string;
  port?: string;
  node?: string;
}

export function captureGatewayParameters(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const captured: GatewayParameters = {};

  // Digital Voice gateway parameters
  if (params.has('gatewayUrl')) captured.gatewayUrl = normalizeServerAddress(params.get('gatewayUrl')!);
  if (params.has('gatewayToken')) captured.gatewayToken = params.get('gatewayToken')!;
  if (params.has('gatewayRoom')) captured.gatewayRoom = params.get('gatewayRoom')!;
  if (params.has('gatewayUsername')) captured.gatewayUsername = params.get('gatewayUsername')!;
  if (params.has('server')) captured.server = normalizeServerAddress(params.get('server')!);

  // IAX/AllStar parameters
  if (params.has('gateway')) captured.gateway = normalizeServerAddress(params.get('gateway')!);
  if (params.has('port')) captured.port = params.get('port')!;
  if (params.has('node')) captured.node = params.get('node')!;

  if (Object.keys(captured).length > 0) {
    console.log('Gateway parameters captured from URL:', captured);
    sessionStorage.setItem(GATEWAY_PARAMS_KEY, JSON.stringify(captured));
  }
}

export function getPersistedGatewayParameter(key: keyof GatewayParameters): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const stored = sessionStorage.getItem(GATEWAY_PARAMS_KEY);
    if (!stored) return undefined;

    const params: GatewayParameters = JSON.parse(stored);
    return params[key];
  } catch (error) {
    console.error('Failed to read persisted gateway parameters:', error);
    return undefined;
  }
}

export function getInferredPreset(): PresetId | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(GATEWAY_PARAMS_KEY);
    if (!stored) return null;

    const params: GatewayParameters = JSON.parse(stored);

    // Check for TGIF DMR: server contains 'tgif'
    if (params.server && params.server.toLowerCase().includes('tgif')) {
      console.log('Inferred preset: tgif-dmr');
      return 'tgif-dmr';
    }

    // BrandMeister DMR: has gatewayUrl or server
    if (params.gatewayUrl || params.server) {
      console.log('Inferred preset: brandmeister-dmr');
      return 'brandmeister-dmr';
    }

    // AllStar: has gateway or node
    if (params.gateway || params.node) {
      console.log('Inferred preset: allstar');
      return 'allstar';
    }

    return null;
  } catch (error) {
    console.error('Failed to infer preset:', error);
    return null;
  }
}

export function hasAutoFlowBeenAttempted(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTO_FLOW_ATTEMPTED_KEY) === 'true';
}

export function markAutoFlowAttempted(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(AUTO_FLOW_ATTEMPTED_KEY, 'true');
}

export function clearAutoFlowAttempted(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(AUTO_FLOW_ATTEMPTED_KEY);
}
