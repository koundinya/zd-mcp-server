#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zenDeskTools, createZendeskClient, searchTickets, getTicket, getTicketDetails, getLinkedIncidents } from "./tools/index.js";

// Re-export the functions for library usage
export { createZendeskClient, searchTickets, getTicket, getTicketDetails, getLinkedIncidents } from "./tools/index.js";
export type { ZendeskConfig } from "./tools/index.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf8")
);
const VERSION = packageJson.version;

async function main() {
  const server = new McpServer(
    {
      name: "zendesk-mcp",
      version: VERSION,
    },
    {
      capabilities: {
        logging: {},
      },
    }
  );

  zenDeskTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Send an initial log message to satisfy the logging capability contract
  // and confirm the server is ready.
  await (server as any).server.sendLoggingMessage({
    level: "info",
    data: `Zendesk MCP Server v${VERSION} ready`,
    logger: "zd-mcp-server",
  });

  console.error(`Zendesk MCP Server v${VERSION} running on stdio`);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});