Status: draft
Created: 2026-09-01
Updated: 2026-09-01

# Parcel MCP hardening and client contract

## Context

The repository is a small stdio MCP server around the 17TRACK API. The current implementation has configuration, packaging, API error-handling, input-validation, and documentation drift. The fork has no tests or CI.

## Goal

Make the first production-hardening slice safe, testable, and internally consistent without expanding the tracking feature beyond an explicit carrier-selection contract.

## Proposed decision

- Load the 17TRACK token from `PARCEL_17TRACK_API_TOKEN`.
- Do not package `config.json`, source files, `.DS_Store`, or development-only files.
- Centralize outbound API requests and enforce HTTP status checks, API-level error checks, and a bounded timeout.
- Validate tracking numbers and carrier-search limits at the MCP boundary.
- Return MCP tool errors with `isError: true` for failed tracking operations.
- Update README, package metadata, and release artifacts together.

## Open semantic decision

The tracking tool currently requires a numeric carrier ID despite documentation claiming optional automatic detection. Recommended contract: accept either a numeric carrier ID or a carrier name resolved through the bundled carrier data, while still requiring an explicit carrier. Do not silently auto-detect in this slice.

## Acceptance criteria

1. A missing or placeholder token fails startup with a clear configuration message and no secret disclosure.
2. The npm package dry-run contains only intentional runtime and documentation artifacts and no credential/config file.
3. Outbound requests time out and fail clearly on non-2xx responses or 17TRACK API errors.
4. Tracking input is trimmed and rejects blank values; carrier search limits are bounded integers.
5. Tracking failures are represented as MCP errors; successful responses preserve the upstream JSON payload.
6. Carrier selection behavior exactly matches the ratified contract.
7. README commands, package name, configuration instructions, and tool schemas agree.
8. Focused automated tests cover the new boundary and error behavior; build, tests, packaging checks, and `git diff --check` pass.

## Explicit exclusions

- No retry policy until rate-limit and idempotency behavior is established.
- No live 17TRACK integration tests requiring a real API token.
- No unrelated refactor or UI/client implementation.
- No push to GitHub until the user explicitly requests it.

## Verification plan

- Run focused tests in red before implementation and green after implementation.
- Run the full test suite and TypeScript build.
- Run `npm pack --dry-run --json` and inspect the file list.
- Run `npm audit` and record any residual dependency findings.
- Run `git diff --check`.
