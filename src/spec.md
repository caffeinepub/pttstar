# Specification

## Summary
**Goal:** Prevent the post-login crash caused by calling TanStack Router navigation before router context is available.

**Planned changes:**
- Move `FirstSignInGuide` (or its replacement) so it renders within the `<RouterProvider />` tree (i.e., inside routed layout/route components), ensuring navigation hooks like `useNavigate` always have router context.
- Add defensive guards to post-login redirect logic so navigation only runs after auth/profile prerequisites are ready and triggers at most once per session, avoiding repeated redirects and transient-state navigation calls.

**User-visible outcome:** Logging in with Internet Identity no longer crashes with a navigate/null error, and post-login redirects occur reliably (only when eligible) while normal manual navigation across routes continues to work.
