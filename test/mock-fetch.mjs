let calls = 0;
const mode = process.env.PARCEL_MCP_TEST_FETCH ?? "success";

if (mode === "hang") {
  globalThis.fetch = (_url, options = {}) =>
    new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(options.signal.reason), { once: true });
    });
} else {
  globalThis.fetch = async () => {
    calls += 1;
    if (mode === "reject") {
      throw new Error("unexpected API call");
    }
    if (mode === "error" || (mode === "get-error" && calls === 2)) {
      return new Response(JSON.stringify({ code: 401, message: "invalid token" }), { status: 200 });
    }
    return new Response(JSON.stringify({ code: 0, data: { accepted: true, call: calls } }), { status: 200 });
  };
}
