import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const mockFetch = fileURLToPath(new URL("./mock-fetch.mjs", import.meta.url));

function startServer(fetchMode = "success", timeoutMs = undefined) {
  const child = spawn(process.execPath, ["index.js"], {
    env: {
      ...process.env,
      PARCEL_17TRACK_API_TOKEN: "test-token",
      PARCEL_MCP_TEST_FETCH: fetchMode,
      ...(timeoutMs === undefined ? {} : { PARCEL_MCP_TIMEOUT_MS: String(timeoutMs) }),
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --import=${mockFetch}`.trim(),
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let buffer = "";
  let nextId = 1;
  const pending = [];
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      pending.shift()?.(JSON.parse(line));
    }
  });

  return {
    child,
    request(method, params = {}) {
      return new Promise((resolve, reject) => {
        pending.push(resolve);
        child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params })}\n`);
        child.once("error", reject);
      });
    },
  };
}

async function initialize(server) {
  return server.request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "contract-test", version: "1.0" },
  });
}

test("MCP advertises the explicit carrier contract", async () => {
  const server = startServer();
  try {
    const initialized = await initialize(server);
    assert.equal(initialized.result.serverInfo.name, "parcel");

    const listed = await server.request("tools/list");
    const tracking = listed.result.tools.find((tool) => tool.name === "tracking-delivery");
    assert.ok(tracking);
    assert.match(tracking.inputSchema.properties.carrier.description, /carrier ID or carrier name/);
    assert.ok(tracking.inputSchema.required.includes("carrier"));
  } finally {
    server.child.kill();
  }
});

test("MCP returns an error for an unknown carrier without calling the API", async () => {
  const server = startServer("reject");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: " ABC ", carrier: "not-a-carrier" },
    });
    assert.equal(result.result.isError, true);
    assert.match(result.result.content[0].text, /not valid/);
  } finally {
    server.child.kill();
  }
});

test("MCP exposes carrier search through stdio", async () => {
  const server = startServer("reject");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "search-carrier",
      arguments: { query: " USPS " },
    });
    assert.equal(result.result.isError, undefined);
    assert.deepEqual(JSON.parse(result.result.content[0].text), [{ id: 21051, name: "USPS" }]);
  } finally {
    server.child.kill();
  }
});

test("MCP preserves successful API JSON for a carrier name", async () => {
  const server = startServer("success");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: " ABC ", carrier: "USPS" },
    });
    assert.equal(result.result.isError, undefined);
    assert.deepEqual(JSON.parse(result.result.content[0].text), {
      code: 0,
      data: { accepted: true, call: 2 },
    });
  } finally {
    server.child.kill();
  }
});

test("MCP preserves successful API JSON for a numeric carrier ID", async () => {
  const server = startServer("success");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: "ABC", carrier: 21051 },
    });
    assert.equal(result.result.isError, undefined);
    assert.deepEqual(JSON.parse(result.result.content[0].text).data, {
      accepted: true,
      call: 2,
    });
  } finally {
    server.child.kill();
  }
});

test("MCP rejects a missing carrier at the public boundary", async () => {
  const server = startServer("reject");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: "ABC" },
    });
    assert.equal(result.result.isError, true);
    assert.match(result.result.content[0].text, /carrier/i);
  } finally {
    server.child.kill();
  }
});

test("MCP rejects a blank tracking number at the public boundary", async () => {
  const server = startServer("reject");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: "   ", carrier: "USPS" },
    });
    assert.equal(result.result.isError, true);
    assert.match(result.result.content[0].text, /number/i);
  } finally {
    server.child.kill();
  }
});

test("MCP turns API failures into tool errors", async () => {
  const server = startServer("error");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: "ABC", carrier: 21051 },
    });
    assert.equal(result.result.isError, true);
    assert.match(result.result.content[0].text, /17TRACK API error \(401\)/);
  } finally {
    server.child.kill();
  }
});

test("MCP turns gettrackinfo failures into tool errors", async () => {
  const server = startServer("get-error");
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: "ABC", carrier: 21051 },
    });
    assert.equal(result.result.isError, true);
    assert.match(result.result.content[0].text, /17TRACK API error \(401\)/);
  } finally {
    server.child.kill();
  }
});

test("MCP turns a timed-out API request into a tool error", async () => {
  const server = startServer("hang", 25);
  try {
    await initialize(server);
    const result = await server.request("tools/call", {
      name: "tracking-delivery",
      arguments: { number: "ABC", carrier: 21051 },
    });
    assert.equal(result.result.isError, true);
    assert.match(result.result.content[0].text, /timed out|abort/i);
  } finally {
    server.child.kill();
  }
});
