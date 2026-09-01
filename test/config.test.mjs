import test from "node:test";
import assert from "node:assert/strict";
import { loadApiToken } from "../config.js";

test("loadApiToken rejects a missing token", () => {
  const original = process.env.PARCEL_17TRACK_API_TOKEN;
  delete process.env.PARCEL_17TRACK_API_TOKEN;

  assert.throws(() => loadApiToken(), /PARCEL_17TRACK_API_TOKEN/);

  if (original === undefined) delete process.env.PARCEL_17TRACK_API_TOKEN;
  else process.env.PARCEL_17TRACK_API_TOKEN = original;
});

test("loadApiToken rejects documented placeholder tokens", () => {
  const original = process.env.PARCEL_17TRACK_API_TOKEN;
  process.env.PARCEL_17TRACK_API_TOKEN = "your-17track-api-token";

  assert.throws(() => loadApiToken(), /PARCEL_17TRACK_API_TOKEN/);

  if (original === undefined) delete process.env.PARCEL_17TRACK_API_TOKEN;
  else process.env.PARCEL_17TRACK_API_TOKEN = original;
});

test("loadApiToken accepts and trims a configured token", () => {
  const original = process.env.PARCEL_17TRACK_API_TOKEN;
  process.env.PARCEL_17TRACK_API_TOKEN = "  test-token  ";

  assert.equal(loadApiToken(), "test-token");

  if (original === undefined) delete process.env.PARCEL_17TRACK_API_TOKEN;
  else process.env.PARCEL_17TRACK_API_TOKEN = original;
});
