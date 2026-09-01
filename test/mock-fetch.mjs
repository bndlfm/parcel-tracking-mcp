let calls = 0;
const mode = process.env.PARCEL_MCP_TEST_FETCH ?? "success";

if (mode === "hang") {
  globalThis.fetch = (_url, options = {}) =>
    new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(options.signal.reason), { once: true });
    });
} else {
  globalThis.fetch = async (url, options = {}) => {
    calls += 1;
    if (mode === "reject") {
      throw new Error("unexpected API call");
    }

    const body = JSON.parse(options.body);
    const item = body[0];
    if (!url.endsWith(calls === 1 ? "/register" : "/gettrackinfo")) {
      throw new Error(`unexpected endpoint: ${url}`);
    }
    if (options.method !== "POST" || options.headers["17token"] !== "test-token") {
      throw new Error("unexpected request metadata");
    }
    if (item.number !== "ABC" || item.carrier !== 21051) {
      throw new Error(`unexpected request body: ${JSON.stringify(item)}`);
    }

    if (mode === "error" || (mode === "get-error" && calls === 2)) {
      return new Response(JSON.stringify({ code: 401, message: "invalid token" }), { status: 200 });
    }
    return new Response(JSON.stringify({ code: 0, data: { accepted: true, call: calls } }), { status: 200 });
  };
}
