# Specification

## Summary
**Goal:** Add quick connection presets and smoother setup flows for BrandMeister (DMR) and AllStar (IAX/DVSwitch), including fixing BrandMeister directory labels so servers are identifiable.

**Planned changes:**
- Backend: Fix `getBuiltinNetworks()` so returned DMR directory entries include correct non-empty `networkLabel` values (e.g., “BrandMeister Worldwide”) for UI display and filtering.
- Frontend: Add a “Quick Setup” section on Connection Settings (ConnectPage) with two actions: BrandMeister (DMR) and AllStar (IAX/DVSwitch), each switching to the appropriate tab and prefilling defaults.
- Frontend: Improve BrandMeister DMR setup in `DigitalVoiceConnectForm` by defaulting Talkgroup to “91” when BrandMeister is selected (if no saved/filled value) and showing a server dropdown with human-readable labels from the backend list.
- Frontend: Improve AllStar IAX setup in `IaxDvswitchConnectForm` by providing an AllStar-focused preset/state that defaults port to “4569” (if no saved/filled value), clarifies required fields (gateway/server and node number), and uses AllStar-specific labels/help text; ensure saved connections reflect these values.

**User-visible outcome:** Users can quickly start configuring BrandMeister DMR or AllStar IAX/DVSwitch from a Quick Setup area, with sensible defaults applied and clearer server/field labeling; saved connections display the selected values correctly.
