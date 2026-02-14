# Specification

## Summary
**Goal:** Unblock production publishing by fixing the post–Internet Identity login authorization issue for user profiles, improving frontend recovery from Unauthorized errors, and promoting the verified preview build to production with required documentation.

**Planned changes:**
- Fix backend authorization/identity handling so authenticated users can call `getCallerUserProfile` and complete first-time profile setup / `saveCallerUserProfile` without hitting `Unauthorized: Only users can view profiles`, while preserving existing restrictions on viewing other users’ profiles.
- Update the frontend authenticated/profile-load flow to handle backend Unauthorized errors with a clear error state and recovery actions (at minimum: Retry and Clear Session), avoiding getting stuck on “Connecting to backend”.
- Publish the verified preview build to production using the existing runbook, including completing the verification checklist and adding/updating the required promotion and deployment markdown records under `frontend/docs/promotions` and `frontend/docs/deployments`.

**User-visible outcome:** After logging in with Internet Identity, users can reliably load or set up their profile and continue user-only features without Unauthorized errors; if an Unauthorized error occurs, the app shows actionable recovery options instead of remaining stuck; production is updated and documented per the runbook.
