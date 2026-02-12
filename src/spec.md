# Specification

## Summary
**Goal:** Let users connect to BrandMeister and AllStar using credentials only, with servers auto-selected (no manual URL/hostname entry in the basic flow).

**Planned changes:**
- Update the backend built-in network entry for “BrandMeister United States” to use address `3102.master.brandmeister.network`.
- On the Connect page, when BrandMeister (DMR) quick setup is chosen, automatically select a built-in BrandMeister master (prefer “BrandMeister United States”) and save a non-empty `bmServerAddress` without user-entered URLs/hostnames; hide freeform server entry behind an Advanced section (or remove it from the basic view).
- On the Connect page, when AllStar (IAX/DVSwitch) quick setup is chosen, automatically set/select the gateway/server to `allstarlink.org` (or an AllStarLink directory entry if available) without user-entered URLs/hostnames; hide freeform gateway/server entry behind an Advanced section (or remove it from the basic view).
- Adjust the post-credential flow so that after required non-URL fields are entered for BrandMeister or AllStar, the app auto-saves the configuration and navigates to `/ptt` without prompting for any URL/hostname.

**User-visible outcome:** Users can choose BrandMeister or AllStar quick setup, enter only their credentials (and any other required non-URL fields), and be taken to PTT with server/gateway automatically set—without typing or pasting any URL/hostname in the default Connect flow.
