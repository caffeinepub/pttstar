# Specification

## Summary
**Goal:** Ensure the app’s global background reliably renders dark/black (not white) by fixing theme token CSS variables and adding a safe fallback.

**Planned changes:**
- Update global theme CSS variables in `frontend/src/index.css` so tokens used via `oklch(var(--...))` are stored as raw OKLCH components (avoiding nested `oklch(oklch(...))` and invalid computed colors).
- Add explicit dark fallback background styles to `html`, `body`, and `#root` in `frontend/src/index.css` so the document never renders white even if CSS variables fail.
- Remove or reconcile any conflicting global CSS/theme token definitions that override `frontend/src/index.css` at runtime (e.g., ensure no additional included stylesheet reintroduces light `:root` tokens).

**User-visible outcome:** All main screens (Landing, Connect, PTT, Activity, Settings, About) consistently display a dark/black background on load and after hard refresh, without requiring a theme toggle and without white bands at viewport edges.
