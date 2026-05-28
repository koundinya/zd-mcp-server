import type * as ZendeskTypes from "node-zendesk";
import zendesk from "node-zendesk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Custom headers sent with every request to Zendesk so that the MCP server
// can be identified in API logs and audit trails.
// `@types/node-zendesk` does not yet declare `customHeaders` on ClientOptions;
// we extend the type locally until upstream types are updated.
interface ZendeskClientOptions extends ZendeskTypes.ClientOptions {
  customHeaders?: Record<string, string>;
}

export const ZENDESK_CLIENT_HEADERS: Record<string, string> = {
  "X-ZD-MCP-Server": "zd-mcp-server",
};

// Types for exported functions
export interface ZendeskConfig {
  email: string;
  token: string;
  subdomain: string;
}

// Create Zendesk client
export function createZendeskClient(config: ZendeskConfig) {
  const options: ZendeskClientOptions = {
    username: config.email,
    token: config.token,
    remoteUri: `https://${config.subdomain}.zendesk.com/api/v2`,
    customHeaders: ZENDESK_CLIENT_HEADERS,
  };
  return zendesk.createClient(options as ZendeskTypes.ClientOptions);
}

// Exported read-only tool functions
export async function getTicket(client: any, ticketId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    client.tickets.show(ticketId, (error: Error | undefined, req: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

export async function searchTickets(client: any, query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.search.query(query, (error: Error | undefined, req: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

export async function getTicketDetails(client: any, ticketId: number): Promise<any> {
  const ticketResult = await getTicket(client, ticketId);
  
  const commentsResult = await new Promise((resolve, reject) => {
    client.tickets.getComments(ticketId, (error: Error | undefined, req: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  return {
    ticket: ticketResult,
    comments: commentsResult
  };
}

export async function getLinkedIncidents(client: any, ticketId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    client.tickets.listIncidents(ticketId, (error: Error | undefined, req: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

// Environment-based client for backward compatibility

if (!process.env.ZENDESK_EMAIL || !process.env.ZENDESK_TOKEN || !process.env.ZENDESK_SUBDOMAIN) {
  throw new Error('Missing required environment variables: ZENDESK_EMAIL, ZENDESK_TOKEN, ZENDESK_SUBDOMAIN');
}

const client = createZendeskClient({
  email: process.env.ZENDESK_EMAIL,
  token: process.env.ZENDESK_TOKEN,
  subdomain: process.env.ZENDESK_SUBDOMAIN,
});

// Helper to send log messages via the underlying low-level Server instance.
// McpServer wraps Server as `server.server`; sendLoggingMessage lives there.
async function log(
  server: McpServer,
  level: "debug" | "info" | "warning" | "error",
  message: string
) {
  try {
    await (server as any).server.sendLoggingMessage({ level, data: message, logger: "zd-mcp-server" });
  } catch {
    // Client may not have a logging handler connected yet; swallow silently.
  }
}

export function zenDeskTools(server: McpServer) {
  server.tool(
    "zendesk_get_ticket",
    "Get a Zendesk ticket by ID",
    {
      ticket_id: z.string().describe("The ID of the ticket to retrieve"),
    },
    async ({ ticket_id }) => {
      await log(server, "info", `zendesk_get_ticket: fetching ticket ${ticket_id}`);
      try {
        const result = await getTicket(client, parseInt(ticket_id, 10));
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_get_ticket: failed for ticket ${ticket_id} — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_update_ticket",
    "Update a Zendesk ticket's properties",
    {
      ticket_id: z.string().describe("The ID of the ticket to update"),
      subject: z.string().optional().describe("The new subject of the ticket"),
      status: z.enum(['new', 'open', 'pending', 'hold', 'solved', 'closed']).optional().describe("The new status of the ticket"),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().describe("The new priority of the ticket"),
      type: z.enum(['problem', 'incident', 'question', 'task']).optional().describe("The new type of the ticket"),
      assignee_id: z.string().optional().describe("The ID of the agent to assign the ticket to"),
      tags: z.array(z.string()).optional().describe("Tags to set on the ticket (replaces existing tags)")
    },
    async ({ ticket_id, subject, status, priority, type, assignee_id, tags }) => {
      await log(server, "info", `zendesk_update_ticket: updating ticket ${ticket_id}`);
      try {
        const ticketData: any = {
          ticket: {}
        };

        // Only add properties that are provided
        if (subject) ticketData.ticket.subject = subject;
        if (status) ticketData.ticket.status = status;
        if (priority) ticketData.ticket.priority = priority;
        if (type) ticketData.ticket.type = type;
        if (assignee_id) ticketData.ticket.assignee_id = parseInt(assignee_id, 10);
        if (tags) ticketData.ticket.tags = tags;

        const result = await new Promise((resolve, reject) => {
          (client as any).tickets.update(parseInt(ticket_id, 10), ticketData, (error: Error | undefined, req: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_update_ticket: failed for ticket ${ticket_id} — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_create_ticket",
    "Create a new Zendesk ticket",
    {
      subject: z.string().describe("The subject of the ticket"),
      description: z.string().describe("The initial description or comment for the ticket"),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().describe("The priority of the ticket"),
      status: z.enum(['new', 'open', 'pending', 'hold', 'solved', 'closed']).optional().describe("The status of the ticket"),
      type: z.enum(['problem', 'incident', 'question', 'task']).optional().describe("The type of the ticket"),
      tags: z.array(z.string()).optional().describe("Tags to add to the ticket")
    },
    async ({ subject, description, priority, status, type, tags }) => {
      await log(server, "info", `zendesk_create_ticket: creating ticket with subject "${subject}"`);
      try {
        const ticketData: any = {
          ticket: {
            subject,
            comment: { body: description },
          }
        };

        if (priority) ticketData.ticket.priority = priority;
        if (status) ticketData.ticket.status = status;
        if (type) ticketData.ticket.type = type;
        if (tags) ticketData.ticket.tags = tags;

        const result = await new Promise((resolve, reject) => {
          (client as any).tickets.create(ticketData, (error: Error | undefined, req: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_create_ticket: failed — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_add_private_note",
    "Add a private internal note to a Zendesk ticket",
    {
      ticket_id: z.string().describe("The ID of the ticket to add a note to"),
      note: z.string().describe("The content of the private note")
    },
    async ({ ticket_id, note }) => {
      await log(server, "info", `zendesk_add_private_note: adding note to ticket ${ticket_id}`);
      try {
        const result = await new Promise((resolve, reject) => {
          (client as any).tickets.update(parseInt(ticket_id, 10), {
            ticket: {
              comment: {
                body: note,
                public: false
              }
            }
          }, (error: Error | undefined, req: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_add_private_note: failed for ticket ${ticket_id} — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_add_public_note",
    "Add a public comment to a Zendesk ticket",
    {
      ticket_id: z.string().describe("The ID of the ticket to add a comment to"),
      comment: z.string().describe("The content of the public comment")
    },
    async ({ ticket_id, comment }) => {
      await log(server, "info", `zendesk_add_public_note: adding comment to ticket ${ticket_id}`);
      try {
        const result = await new Promise((resolve, reject) => {
          (client as any).tickets.update(parseInt(ticket_id, 10), {
            ticket: {
              comment: {
                body: comment,
                public: true
              }
            }
          }, (error: Error | undefined, req: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_add_public_note: failed for ticket ${ticket_id} — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_search",
    "Search for Zendesk tickets based on a query",
    {
      query: z.string().describe("Search query (e.g., 'status:open', 'priority:urgent', 'tags:need_help')"),
    },
    async ({ query }) => {
      await log(server, "info", `zendesk_search: query "${query}"`);
      try {
        const result = await searchTickets(client, query);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_search: failed — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_get_ticket_details",
    "Get detailed information about a Zendesk ticket including comments",
    {
      ticket_id: z.string().describe("The ID of the ticket to retrieve details for"),
    },
    async ({ ticket_id }) => {
      await log(server, "info", `zendesk_get_ticket_details: fetching details for ticket ${ticket_id}`);
      try {
        const result = await getTicketDetails(client, parseInt(ticket_id, 10));
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_get_ticket_details: failed for ticket ${ticket_id} — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "zendesk_get_linked_incidents",
    "Fetch all incident tickets linked to a particular ticket",
    {
      ticket_id: z.string().describe("The ID of the ticket to retrieve linked incidents for"),
    },
    async ({ ticket_id }) => {
      await log(server, "info", `zendesk_get_linked_incidents: fetching incidents for ticket ${ticket_id}`);
      try {
        const result = await getLinkedIncidents(client, parseInt(ticket_id, 10));
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        await log(server, "error", `zendesk_get_linked_incidents: failed for ticket ${ticket_id} — ${error.message}`);
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message || 'Unknown error occurred'}`
          }],
          isError: true
        };
      }
    }
  );
}