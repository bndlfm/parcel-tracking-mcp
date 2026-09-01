import test from "node:test";
import assert from "node:assert/strict";
import { requestJson } from "../api.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
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

test("requestJson provides an abort signal with the configured timeout", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.ok(options?.signal instanceof AbortSignal);
    assert.equal(options.signal.aborted, false);
    return new Response(JSON.stringify({ code: 0 }), { status: 200 });
  };

  await requestJson("/register", "token", [{ number: "ABC", carrier: 210 }], 1000);
});
