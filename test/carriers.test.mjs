import test from "node:test";
import assert from "node:assert/strict";
import { createCarrierIndex } from "../carriers.js";

const carriers = createCarrierIndex([
  { key: "21051", name_en: "USPS", name_cn: "美国邮政", name_hk: "美國郵政", url: "" },
  { key: "100001", name_en: "FedEx", name_cn: "联邦快递", name_hk: "聯邦快遞", url: "" },
]);

test("carrier index resolves numeric IDs and exact names", () => {
  assert.equal(carriers.resolve(21051), 21051);
  assert.equal(carriers.resolve(" USPS "), 21051);
  assert.equal(carriers.resolve("FedEx"), 100001);
});

test("carrier index searches exact and fuzzy names", () => {
  assert.deepEqual(carriers.search("usps"), [{ id: 21051, name: "USPS" }]);
  assert.deepEqual(carriers.search("FedEx", 1), [{ id: 100001, name: "FedEx" }]);
});

test("carrier index resolves names with surrounding whitespace and case differences", () => {
  assert.equal(carriers.resolve(" usps "), 21051);
});

test("carrier index rejects unknown carriers", () => {
  assert.equal(carriers.resolve("not-a-carrier"), undefined);
  assert.equal(carriers.isValidId(999), false);
});
