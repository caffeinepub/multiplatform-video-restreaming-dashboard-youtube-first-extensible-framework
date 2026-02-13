# Specification

## Summary
**Goal:** Speed up repeated Quick Start setup, add Google Drive/Docs-friendly preset importing and guidance, and surface stream readiness/health checks to reduce common streaming failures.

**Planned changes:**
- Update Quick Start to support faster defaults: one-click random “fireplace” session title suggestion, one-click reuse of the previous title, and auto-fill Video Source URL from the last used value (saved locally after a successful Quick Start start).
- Add Google Drive share-link detection in Video Source URL inputs (Quick Start and Session Video Source panel) and show non-blocking “Required permissions” guidance when a Drive share URL is recognized.
- Add a Quick Start “Preset Import” area that accepts pasted Google Docs text in a strict marker-based format, parses multiple presets (title, video link, ingest URL, stream key), and lets the user select one to auto-fill Quick Start fields; show a friendly message when no valid presets are found.
- Add a “Stream Health / Readiness” panel on the session detail page with a configuration checklist (video source, outputs, and required output fields) and a network sufficiency warning based on browser-available network information (with a fallback message when unavailable).
- Add a best-effort YouTube streaming verification UX in the Stream Health panel with manual verification instructions and a per-session locally stored status (no YouTube API keys/OAuth).
- Update Quick Start inline tips (English) near relevant inputs to help avoid common failures (permissions/link access, ingest URL vs stream key, missing video source/outputs), without adding new required fields.

**User-visible outcome:** Users can start sessions faster with remembered defaults, import streaming presets from Google Docs text to auto-fill fields, see Drive-link permission guidance, and use a session “Stream Health/Readiness” panel (including manual YouTube verification status and network warnings) to reduce setup errors.
