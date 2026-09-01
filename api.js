const TRACKER_API_BASE_URL = "https://api.17track.net/track/v2.2";
const USER_AGENT = "parcel-mcp/1.1.5";
export async function requestJson(endpoint, apiToken, body, timeoutMs = 10_000) {
    const response = await fetch(`${TRACKER_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "17token": apiToken,
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    const responseText = await response.text();
    let payload;
    try {
        payload = responseText ? JSON.parse(responseText) : undefined;
    }
    catch {
        throw new Error(`17TRACK returned invalid JSON (HTTP ${response.status})`);
    }
    if (!response.ok) {
        const message = typeof payload === "object" && payload !== null && "message" in payload
            ? String(payload.message)
            : responseText || response.statusText;
        throw new Error(`17TRACK request failed (${response.status}): ${message}`);
    }
    if (typeof payload === "object" &&
        payload !== null &&
        "code" in payload &&
        typeof payload.code === "number" &&
        payload.code !== 0) {
        const message = "message" in payload ? String(payload.message) : "unknown error";
        throw new Error(`17TRACK API error (${payload.code}): ${message}`);
    }
    return payload;
}
