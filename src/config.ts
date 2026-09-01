const PLACEHOLDER_TOKENS = new Set([
  "YOUR 17track API KEY",
  "your-17track-api-token",
  "your-17track-api-token-here",
]);

export function loadApiToken(): string {
  const token = process.env.PARCEL_17TRACK_API_TOKEN?.trim();
  if (!token || PLACEHOLDER_TOKENS.has(token)) {
    throw new Error(
      "Missing PARCEL_17TRACK_API_TOKEN. Set it to a valid 17TRACK API token before starting the server.",
    );
  }
  return token;
}
