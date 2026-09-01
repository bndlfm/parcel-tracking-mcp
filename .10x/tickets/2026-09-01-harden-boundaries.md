Status: done
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
- 2026-09-01: Added API edge-case coverage, bounded timeout configuration, consolidated carrier search, typecheck script, CI, security policy, changelog, and corrected carrier fixtures/docs.

## Blockers

None.

## Evidence

- `npm run typecheck`: passed.
- `npm test`: passed; 24 tests, 0 failures.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm pack --dry-run --json`: package contains only `LICENSE`, `README.md`, `carriers.csv`, `config.js`, `index.js`, and `package.json`.
- `git diff --check`: passed.
- CI workflow content check: passed.
- Offline MCP child-process tests verified normalized request numbers, carrier IDs, endpoints, headers, and both API calls without using a live token.

## Review

Final fresh-eyes review initially returned `CONCERNS` for an invalid README fixture, unbounded oversized timeout, weak outbound-request assertions, missing public carrier-search coverage, and inconsistent unit fixtures. All findings were fixed and reverified. Live 17TRACK behavior remains intentionally untested.

## Retrospective

Review-driven corrections caught documentation and fixture drift that ordinary green tests missed. Public MCP tests now verify both observable results and outbound request semantics, while timeout configuration has an explicit safe upper bound.
