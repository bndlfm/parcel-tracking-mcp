Status: done
Created: 2026-09-01
Updated: 2026-09-01
Parent: ../specs/2026-09-01-hardening-and-client-contract.md
Depends-On: 2026-09-01-harden-boundaries.md

# Verify public MCP contract and remediate dependencies

## Scope

Add end-to-end tests around the client-visible MCP tools, then upgrade the direct MCP SDK dependency to a current safe release and verify the complete dependency audit.

## Non-goals

- No live 17TRACK requests.
- No new tracking semantics.
- No direct push to GitHub from this ticket; release remains explicitly controlled by the user.
- No broad dependency refresh unrelated to the reported audit findings.

## Acceptance criteria

1. Tests initialize the compiled MCP server over stdio and inspect the advertised tool schemas.
2. Tests prove `tracking-delivery` requires a carrier, accepts numeric IDs and carrier names, and rejects invalid inputs at the public boundary.
3. Tests prove upstream API failures become MCP `isError: true` responses and successful JSON is preserved.
4. Tests prove timeout failures reach the MCP caller as errors without hanging the test process.
5. The MCP SDK is upgraded to a current release compatible with the project, and the lockfile is refreshed.
6. `npm audit --omit=dev` has no high-severity findings; any remaining lower-severity findings are recorded with rationale.
7. Full tests, build, package dry-run, audit, and `git diff --check` pass.

## Assumptions

- User-ratified: `bndlfm/parcel-tracking-mcp` is the working canonical repository.
- Record-backed: npm currently reports `@modelcontextprotocol/sdk` latest as `1.30.0`; version `1.25.4` is not published.
- Record-backed: the existing server uses stdio transport and native Node test tooling.

## Journal

- 2026-09-01: First hardening slice pushed to fork `main` at commit `ebe6d7e`.
- 2026-09-01: Fresh-eyes review identified missing MCP-level coverage and five dependency audit findings.
- 2026-09-01: Confirmed npm latest SDK version is 1.30.0.
- 2026-09-01: Added offline stdio MCP contract tests for schemas, numeric/name carriers, validation, success, register/get failures, and timeout behavior.
- 2026-09-01: Upgraded `@modelcontextprotocol/sdk` to exact 1.30.0 and removed its obsolete constructor capabilities field.
- 2026-09-01: Fresh-eyes review found test false-positive and coverage gaps; tightened fetch rejection, added missing public cases, validated timeout configuration, and covered gettrackinfo failure.

## Blockers

None.

## Evidence

- `npm test`: passed; 19 tests, 0 failures.
- `npm run build`: passed.
- `npm audit --omit=dev`: 0 info/low/moderate/high/critical findings.
- `npm pack --dry-run --json`: package contains only `LICENSE`, `README.md`, `carriers.csv`, `config.js`, `index.js`, and `package.json`.
- `git diff --check`: passed.
- MCP stdio tests use an offline child-process fetch shim; no live token or 17TRACK request was used.

## Review

Fresh-eyes review verdict was `CONCERNS`; all reported significant and minor test/coverage findings were addressed and reverified. Residual limit: live 17TRACK behavior remains intentionally untested.

## Retrospective

The first public-boundary tests were too trusting of their fetch shim and initially used a carrier ID absent from the bundled CSV. The review caught both classes of issue. Future MCP tests should assert side effects explicitly and derive fixtures from repository data where possible.
