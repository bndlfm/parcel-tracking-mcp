# parcel-mcp

A Model Context Protocol (MCP) server for tracking parcel deliveries through the [17TRACK API](https://api.17track.net/).

## Features

- Track parcels from supported carriers
- Search the bundled carrier list with fuzzy matching
- Accept numeric 17TRACK carrier IDs or carrier names
- Stdio transport for MCP clients

## Requirements

- Node.js 20 or newer
- npm
- A 17TRACK API token

## Configuration

Set the token in the environment used to launch the server:

```bash
export PARCEL_17TRACK_API_TOKEN="your-17track-api-token"
```

The token is never read from a repository or package file. Do not put it in `config.json` or commit it to Git. For development or constrained environments, `PARCEL_MCP_TIMEOUT_MS` can override the default 10-second request timeout; it must be a positive integer no greater than 300000.

## Installation and usage

Install globally:

```bash
npm install --global parcel-mcp
parcel-mcp
```

Or run it directly with `npx`:

```bash
PARCEL_17TRACK_API_TOKEN="your-17track-api-token" npx parcel-mcp
```

## MCP client configuration

For an MCP client such as Claude Desktop:

```json
{
  "mcpServers": {
    "parcel": {
      "command": "npx",
      "args": ["parcel-mcp"],
      "env": {
        "PARCEL_17TRACK_API_TOKEN": "your-17track-api-token"
      }
    }
  }
}
```

## Tools

### `search-carrier`

Search carrier names, including fuzzy matches.

- `query` — required search text
- `limit` — optional integer from 1 to 50; defaults to 10

The result includes the numeric carrier ID needed by 17TRACK.

### `tracking-delivery`

Track a parcel. An explicit carrier is required; silent carrier auto-detection is not used.

- `number` — required tracking number
- `carrier` — required numeric 17TRACK carrier ID or carrier name, such as `21051` or `USPS`

Use `search-carrier` first when you only know the carrier name or need to find its 17TRACK ID.

## Development

```bash
npm ci
npm run typecheck
npm test
npm pack --dry-run
```

CI runs type checking, tests, package verification, and the production dependency audit on pushes and pull requests. See [SECURITY.md](SECURITY.md) for vulnerability reporting and [CHANGELOG.md](CHANGELOG.md) for release history.
The package contains only the compiled runtime, carrier data, README, license, and package metadata. Source and tests remain in the repository but are not published.

## API behavior

The server checks HTTP failures and 17TRACK API-level errors, applies a bounded request timeout, and returns failed tracking operations as MCP tool errors. Successful responses preserve the upstream JSON payload.

## License

MIT. See [LICENSE](LICENSE).

## Support

- MCP protocol: <https://modelcontextprotocol.io>
- 17TRACK API: <https://api.17track.net>
- Project issues: <https://github.com/bndlfm/parcel-tracking-mcp/issues>
