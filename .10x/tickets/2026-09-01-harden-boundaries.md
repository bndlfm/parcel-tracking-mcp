Status: open
Created: 2026-09-01
Updated: 2026-09-01
Parent: ../specs/2026-09-01-hardening-and-client-contract.md

# Harden configuration, API boundaries, and carrier selection

## Scope

Implement the hardening and client-contract slice defined by the parent spec for the `parcel-mcp` fork.

## Non-goals

- No retry policy.
- No live API tests requiring a real token.
- No unrelated redesign.
- No push to GitHub.

## Acceptance criteria

1. The server loads `PARCEL_17TRACK_API_TOKEN`, rejects missing/placeholder values, and does not disclose secrets.
2. Package metadata excludes config, source, `.DS_Store`, and other development-only artifacts; package dry-run is inspected.
3. A shared API request path enforces timeout, HTTP status checks, JSON parsing, and 17TRACK API-level error handling.
4. Tracking numbers are trimmed and non-blank; carrier-search limits are bounded integers.
5. Tracking failures return MCP content with `isError: true`; successful upstream JSON remains available to the caller.
6. `tracking-delivery` accepts a numeric carrier ID or carrier name, requires an explicit carrier, and resolves names using bundled carrier data.
7. README and package metadata agree with the implemented command, configuration, tool schema, and version.
8. Focused tests are written first and observed failing, then pass after implementation.
9. Full tests, typecheck/build, package dry-run inspection, audit, and `git diff --check` are run and recorded.

## Assumptions

- User-ratified: numeric carrier IDs and carrier names are accepted; a carrier is required; silent auto-detection is not implemented.
- Record-backed: the project uses TypeScript, npm, Node's native `fetch`, and stdio MCP transport.
- Record-backed: the current public repository is `bndlfm/parcel-tracking-mcp`; changes remain local until separately authorized.
- User-ratified: treat `bndlfm/parcel-tracking-mcp` as this project's working upstream/canonical repository; retain `iamfiro/parcel-tracking-mcp` as the original reference remote.

## Journal

- 2026-09-01: Inspected source, package metadata, README, build, package contents, and dependency audit. Created parent spec.
- 2026-09-01: User selected and ratified the explicit-carrier contract.
- 2026-09-01: Created branch `harden-boundaries`.
- 2026-09-01: Added environment-token loading, explicit package allowlist, API request helper, carrier index, input validation, carrier-name support, and MCP error signaling.

## Blockers

None for this slice. Dependency upgrades remain a follow-up because the current audit reports five production findings.

## Evidence

- `node --test test/config.test.mjs`: initially failed because `config.js` was absent; passed after implementation with 2 tests.
- `node --test test/api.test.mjs`: initially failed because `api.js` was absent; passed after implementation with 3 tests.
- `node --test test/carriers.test.mjs`: initially failed because `carriers.js` was absent; passed after implementation with 3 tests.
- `npm test`: passed; 8 tests, 0 failures.
- `node index.js` without `PARCEL_17TRACK_API_TOKEN`: exited 1 with a clear configuration error and no token disclosure.
- `npm pack --dry-run --json`: package contains only `LICENSE`, `README.md`, `carriers.csv`, `config.js`, `index.js`, and `package.json`.
- `git diff --check`: passed.
- `npm audit --omit=dev`: 5 findings remain (3 moderate, 2 high); no automatic upgrade was applied.

## Review

Pending independent review after implementation.

## Retrospective

Pending.
