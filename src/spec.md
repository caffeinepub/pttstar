# Specification

## Summary
**Goal:** Redesign the IAX / DVSwitch configuration UI to match DVSwitch-style layout and add persisted codec selection plus a required phone-to-IAX confirmation.

**Planned changes:**
- Reorder and relabel IAX / DVSwitch configuration inputs to: Hostname, Port, Username, Password, Callsign, Node Number (English labels with consistent capitalization).
- Add a required checkbox labeled “Phone to IAX connection” that must be checked before Save is allowed, with an English validation message when not confirmed.
- Add a “Codec Types” selector (tab/segmented control) with options: ulaw, slin, adpcm; ensure a default is selected when none is saved.
- Extend the saved IAX / DVSwitch configuration display to show Phone to IAX connection (Yes/No) and Codec Types, while keeping passwords masked.
- Update frontend settings storage/types to persist the new checkbox state and selected codec, while remaining backward-compatible with previously saved IAX / DVSwitch configurations.

**User-visible outcome:** Users see a DVSwitch-style IAX settings form, must confirm “Phone to IAX connection” to save, can choose a codec type, and can view the saved confirmation/codec values alongside other saved settings.
