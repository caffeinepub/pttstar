/**
 * Connection Presets
 * Single source of truth for preset identifiers, metadata, and helper functions.
 * Ensures consistent preset handling across Quick Setup, URL inference, and form-level application.
 */

export type PresetId = 'brandmeister-dmr' | 'tgif-dmr' | 'allstar';

export type PresetTargetForm = 'digital-voice' | 'iax';

export interface PresetMetadata {
  id: PresetId;
  label: string;
  description: string;
  targetForm: PresetTargetForm;
  icon?: string;
}

export const PRESET_DEFINITIONS: Record<PresetId, PresetMetadata> = {
  'brandmeister-dmr': {
    id: 'brandmeister-dmr',
    label: 'BrandMeister DMR',
    description: 'Connect to BrandMeister DMR network',
    targetForm: 'digital-voice',
  },
  'tgif-dmr': {
    id: 'tgif-dmr',
    label: 'TGIF DMR',
    description: 'Connect to TGIF DMR network',
    targetForm: 'digital-voice',
  },
  'allstar': {
    id: 'allstar',
    label: 'AllStar Network',
    description: 'Connect to AllStar Link network',
    targetForm: 'iax',
  },
};

export function getPresetMetadata(presetId: PresetId): PresetMetadata {
  return PRESET_DEFINITIONS[presetId];
}

export function getTargetFormForPreset(presetId: PresetId): PresetTargetForm {
  return PRESET_DEFINITIONS[presetId].targetForm;
}

export function isDigitalVoicePreset(presetId: PresetId): boolean {
  return PRESET_DEFINITIONS[presetId].targetForm === 'digital-voice';
}

export function isIaxPreset(presetId: PresetId): boolean {
  return PRESET_DEFINITIONS[presetId].targetForm === 'iax';
}

export function getAllPresets(): PresetMetadata[] {
  return Object.values(PRESET_DEFINITIONS);
}

export function getDigitalVoicePresets(): PresetMetadata[] {
  return getAllPresets().filter(p => p.targetForm === 'digital-voice');
}

export function getIaxPresets(): PresetMetadata[] {
  return getAllPresets().filter(p => p.targetForm === 'iax');
}
