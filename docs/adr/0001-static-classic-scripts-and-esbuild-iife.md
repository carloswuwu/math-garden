# ADR-0001: Static classic scripts plus deterministic esbuild IIFE

- **Status:** Accepted (Phase 3)
- **Context:** The app must work offline and from `file://` on Windows. ES modules do not load from `file://` due to CORS. A build step is already needed for service-worker generation and content hashing.
- **Decision:** Keep seven order-dependent classic scripts as the authoring format (public `window.*` API), and ship a single esbuild **IIFE** bundle in `dist/`. Builds are deterministic (LF-normalised sources, esbuild version in the hash) and `dist/` is committed; CI rebuilds and fails on drift.
- **Consequences:** `file://` and static hosting both work with no server. The source remains globally coupled until Phase 5 modularization, and every shipped source change requires a rebuild + `dist/` commit.
