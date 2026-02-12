/**
 * Server Address Normalization
 * Ensures consistent server/gateway address formatting across the app
 */

/**
 * Normalizes a server or gateway address for consistent storage and comparison
 * - Trims whitespace
 * - Converts to lowercase for case-insensitive comparison
 * - Preserves host:port formatting
 */
export function normalizeServerAddress(address: string | undefined): string {
  if (!address) return '';
  
  return address
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ''); // Remove any internal whitespace
}

/**
 * Checks if two server addresses are equivalent after normalization
 */
export function areServerAddressesEqual(addr1: string | undefined, addr2: string | undefined): boolean {
  return normalizeServerAddress(addr1) === normalizeServerAddress(addr2);
}
