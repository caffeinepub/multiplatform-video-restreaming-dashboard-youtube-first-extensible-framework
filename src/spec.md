# Specification

## Summary
**Goal:** Add video media source selection, Streamlabs-like layer composition, and a guided Quick Start flow to start streams with minimal steps.

**Planned changes:**
- Add per-session support for configuring a non-sensitive video media source reference (e.g., URL + basic metadata) and show/edit it on the session detail page.
- Add a per-session ordered layer stack (scene/overlay list) with basic editable properties; provide a layers panel to add/remove/reorder layers and toggle visibility, persisting changes across reloads.
- Add a Quick Start workflow from the sessions list to guide users through required inputs (session title, video source, at least one output target) and then start the stream (or via a final confirmation step), with clear inline validation/errors.
- Update backend state handling so existing persisted sessions safely gain new fields (video source, layers) with sensible defaults and remain loadable/editable after upgrade.

**User-visible outcome:** Users can pick a video source for a stream, manage an ordered overlay/layer stack for a session, and use a Quick Start flow to create/configure and start a stream while being blocked (with English explanations) if required prerequisites are missing.
