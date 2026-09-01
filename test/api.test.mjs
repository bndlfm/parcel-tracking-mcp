import test from "node:test";
import assert from "node:assert/strict";
import { requestJson } from "../api.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.PARCEL_MCP_TIMEOUT_MS;
});

test("requestJson rejects non-success HTTP responses", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "bad request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(
    requestJson("/register", "token", [{ number: "ABC", carrier: 210 }]),
    /17TRACK request failed \(400\)/,
  );
});

test("requestJson rejects 17TRACK API errors", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: 401, message: "invalid token" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(
    requestJson("/register", "token", [{ number: "ABC", carrier: 210 }]),
    /17TRACK API error \(401\): invalid token/,
  );
});

test("requestJson rejects an invalid timeout configuration", async () => {
  process.env.PARCEL_MCP_TIMEOUT_MS = "not-a-number";

  await assert.rejects(
    requestJson("/register", "token", [{ number: "ABC", carrier: 210 }]),
    /PARCEL_MCP_TIMEOUT_MS must be a positive integer no greater than 300000/,
  );
});

test("requestJson rejects an oversized timeout configuration", async () => {
  process.env.PARCEL_MCP_TIMEOUT_MS = "300001";

  await assert.rejects(
    requestJson("/register", "token", [{ number: "ABC", carrier: 210 }]),
    /no greater than 300000/,
  );
});

test("requestJson rejects an empty successful response", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });

  await assert.rejects(
    requestJson("/register", "token", [{ number: "ABC", carrier: 210 }]),
    /empty response/i,
  );
});

test("requestJson reports invalid JSON from an error response", async () => {
  globalThis.fetch = async () => new Response("upstream unavailable", { status: 503 });

  await assert.rejects(
    requestJson("/register", "token", [{ number: "ABC", carrier: 210 }]),
    /invalid JSON.*503/i,
  );
});

test("requestJson provides an abort signal with the configured timeout", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.ok(options?.signal instanceof AbortSignal);
    assert.equal(options.signal.aborted, false);
    return new Response(JSON.stringify({ code: 0 }), { status: 200 });
  };

  await requestJson("/register", "token", [{ number: "ABC", carrier: 210 }], 1000);
});
