# Specification

## Summary
**Goal:** Ensure the entire application renders with a consistent dark/black background (not white) across all routes and viewport areas.

**Planned changes:**
- Apply the app’s existing dark theme background token/class globally to the document root (html/body) so uncovered areas are not white.
- Adjust top-level layout/background styling so the dark background reliably fills the full viewport height across all pages, including short-content screens and with the fixed mobile bottom navigation.

**User-visible outcome:** On initial load and throughout the app, all pages (Landing, Connect, PTT, Activity, Settings, About) display a consistent dark background with no white margins/strips/overscroll areas visible.
