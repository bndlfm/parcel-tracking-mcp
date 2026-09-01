import test from "node:test";
import assert from "node:assert/strict";
import { createCarrierIndex } from "../carriers.js";

const carriers = createCarrierIndex([
  { key: "210", name_en: "USPS", name_cn: "美国邮政", name_hk: "美國郵政", url: "" },
  { key: "100001", name_en: "FedEx", name_cn: "联邦快递", name_hk: "聯邦快遞", url: "" },
]);

test("carrier index resolves numeric IDs and exact names", () => {
  assert.equal(carriers.resolve(210), 210);
  assert.equal(carriers.resolve(" USPS "), 210);
  assert.equal(carriers.resolve("FedEx"), 100001);
});

test("carrier index resolves close name matches", () => {
  assert.equal(carriers.resolve("USPS"), 210);
});

test("carrier index rejects unknown carriers", () => {
  assert.equal(carriers.resolve("not-a-carrier"), undefined);
  assert.equal(carriers.isValidId(999), false);
});
