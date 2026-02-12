# DroidStar Settings Reference

## Reference APK
This implementation replicates behaviors observed in DroidStar:
**Reference APK URL:** http://pizzanbeer.net/droidstar/DroidStar-1faf794-android-arm32.apk

**Important:** This project replicates user-facing behavior only. We do NOT decompile, reverse-engineer, or import any code or assets from the APK. All functionality is implemented using standard web technologies (fetch API, localStorage, React Query) based on observable user interactions and documented behaviors.

## Replicated Behaviors

### Server List Sources
DroidStar fetches BrandMeister and AllStar server lists from GitHub raw URLs:
- **BrandMeister servers:** Fetched from a GitHub repository containing a list of BrandMeister server addresses
- **AllStar servers:** Fetched from a GitHub repository containing a list of AllStar node addresses

### Refresh & Caching Strategy
- Server lists are cached locally to enable offline operation
- Lists can be manually refreshed by the user
- Cache includes a last-updated timestamp
- On fetch failure, the app continues using the last cached data or built-in defaults
- TTL (Time To Live) is enforced to prevent stale data
- Cache age is displayed to users so they know when data was last refreshed

### UI Population & Selection
- Fetched server entries populate dropdown/selection UI in the Connect forms
- BrandMeister servers appear in the Digital Voice configuration
- AllStar servers appear in the IAX/DVSwitch configuration
- Selecting a server from the fetched list fills the appropriate connection field
- Manual entry is still supported as a fallback
- Default source URLs are always visible in Settings when no user overrides exist

### Connection Consistency
- Server addresses are normalized (trimmed, consistent formatting) before saving
- Room keys/labels are derived from normalized server addresses
- URL parameter prefills, preset selections, and fetched list selections all produce consistent saved values
- Reloading the app preserves the same server address without reverting to defaults

## Implementation Notes
This implementation does NOT involve decompiling, reverse-engineering, or importing code/assets from the APK. It replicates the user-facing behaviors described above using standard web technologies (fetch API, localStorage, React Query).
