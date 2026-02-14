/**
 * Authorization Error Utilities
 * Helpers to identify and handle authorization-related backend trap messages
 */

/**
 * Check if an error is an authorization-related trap from the backend
 */
export function isAuthorizationError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Match common authorization trap patterns from backend
  return (
    errorMessage.includes('Unauthorized:') ||
    errorMessage.includes('Only users can') ||
    errorMessage.includes('Only admin') ||
    errorMessage.includes('Can only view your own profile')
  );
}

/**
 * Extract a user-friendly message from an authorization error
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'Authorization failed';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Extract the message after "Unauthorized: " if present
  const match = errorMessage.match(/Unauthorized:\s*(.+)/);
  if (match) {
    return match[1];
  }
  
  return errorMessage;
}

/**
 * Check if the error indicates the user needs to be authenticated
 */
export function requiresAuthentication(error: unknown): boolean {
  if (!isAuthorizationError(error)) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    errorMessage.includes('Only users can') ||
    errorMessage.includes('guest')
  );
}

/**
 * Check if the error indicates insufficient permissions (user is authenticated but lacks permission)
 */
export function requiresHigherPermission(error: unknown): boolean {
  if (!isAuthorizationError(error)) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    errorMessage.includes('Only admin') ||
    errorMessage.includes('Can only view your own profile')
  );
}
