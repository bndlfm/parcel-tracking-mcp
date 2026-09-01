import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { parse as parseCsv } from "csv-parse/sync";
import { loadApiToken } from "./config.js";
import { requestJson } from "./api.js";
import { createCarrierIndex } from "./carriers.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiToken = loadApiToken();
const carriersCsvPath = path.join(__dirname, "carriers.csv");
if (!fs.existsSync(carriersCsvPath)) {
    throw new Error("carriers.csv not found - make sure you placed the file next to the script");
}
const carrierRows = parseCsv(fs.readFileSync(carriersCsvPath), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
});
const carrierIndex = createCarrierIndex(carrierRows);
async function register({ number, carrier }) {
    return requestJson("/register", apiToken, [{ number, carrier }]);
}
async function getDelivery({ number, carrier }) {
    return requestJson("/gettrackinfo", apiToken, [{ number, carrier }]);
}
const server = new McpServer({
    name: "parcel",
    version: "1.1.5",
});
server.tool("search-carrier", "Search carriers by name keyword (supports fuzzy typos)", {
    query: z.string().trim().min(1).describe("Keyword to search carrier names, case-insensitive (typos allowed)"),
    limit: z.number().int().min(1).max(50).optional().describe("Max number of results to return (default 10)"),
}, ({ query, limit = 10 }) => {
    const results = carrierIndex.search(query, limit);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(results, null, 2),
            },
        ],
    };
});
server.tool("tracking-delivery", "Track a parcel delivery via 17TRACK", {
    number: z.string().trim().min(1).describe("The tracking number of the parcel"),
    carrier: z
        .union([z.number().int(), z.string().trim().min(1)])
        .describe("17TRACK carrier ID or carrier name; use search-carrier to find an ID"),
}, async ({ number, carrier }) => {
    const carrierId = carrierIndex.resolve(carrier);
    if (carrierId === undefined) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `The carrier "${carrier}" is not valid. Please use the 'search-carrier' tool to find the correct carrier.`,
                },
            ],
        };
    }
    try {
        await register({ number, carrier: carrierId });
        const data = await getDelivery({ number, carrier: carrierId });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: "Error tracking delivery: " + (error instanceof Error ? error.message : String(error)),
                },
            ],
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
