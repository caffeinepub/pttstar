/**
 * Clear Client Session Utility
 * Centralized utility to clear all client-side session and cached state
 * used by authenticated flows (auth, profile, directory, talkgroup, clip config caches)
 */

export function clearClientSession(): void {
  console.log('clearClientSession: Clearing all client-side session data');

  // Clear all localStorage keys used by the app
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Clear auth-related keys
      if (key.startsWith('pttstar_') || 
          key.startsWith('ii-') || 
          key.startsWith('regenerated-auth-') ||
          // Clear server directory cache
          key.startsWith('serverDirectory_') ||
          // Clear connection preferences
          key.startsWith('preferredConnection') ||
          // Clear PTT clip config
          key.startsWith('pttClipHttp_') ||
          // Clear BrandMeister talkgroup cache
          key.startsWith('brandmeisterTalkgroups_') ||
          // Clear any other app-specific keys
          key.includes('pttstar') ||
          key.includes('PTTStar')) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`clearClientSession: Removed localStorage key: ${key}`);
    } catch (err) {
      console.warn(`clearClientSession: Failed to remove key ${key}:`, err);
    }
  });

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('clearClientSession: Cleared sessionStorage');
  } catch (err) {
    console.warn('clearClientSession: Failed to clear sessionStorage:', err);
  }

  console.log(`clearClientSession: Cleared ${keysToRemove.length} localStorage keys and sessionStorage`);
}
