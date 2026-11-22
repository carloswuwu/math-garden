# ADR-0004: Generated service worker with user-confirmed updates

- **Status:** Accepted (Phase 3)
- **Context:** Offline-first requires precaching, but silently activating a new version can disrupt an in-progress lesson/assessment.
- **Decision:** `tools/sw-template.js` generates `dist/sw.js` with a content-hash cache name and the asset list from the build. Install precaches; activate waits (no automatic `skipWaiting`) until the user accepts the update chip. Navigation is network-first with a 3 s timeout, then cache fallback.
- **Consequences:** Updates are explicit and safe; the old cache remains until the user taps the chip. Legacy root deployment still has its own older SW until Pages source is switched.
