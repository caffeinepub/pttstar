# Specification

## Summary
**Goal:** Make the post-login transition feel seamless by preventing redirects from competing with first-time profile onboarding, adding a clear post-login loading state, and ensuring redirects don’t pollute browser history.

**Planned changes:**
- Update post-login redirect logic to avoid navigating to `/connect` while first-time onboarding is active (authenticated + caller profile is null), and only evaluate redirect after the profile is confirmed present.
- Add a dedicated, non-error interstitial/loading state shown after successful Internet Identity login while required post-login data (e.g., caller profile) is still loading and redirect decisions are being prepared.
- Change the one-time redirect to `/connect` (with `preset=brandmeister-dmr`) to use history replacement so the Back button doesn’t return users to a transient post-login state.

**User-visible outcome:** After logging in, users see a smooth “finishing sign-in” state while data loads; first-time users complete profile setup without being redirected away; returning users redirect as before, and Back navigation no longer bounces through an intermediate transition.
