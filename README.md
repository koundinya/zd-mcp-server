# Zendesk MCP Integration Setup Guide

[![smithery badge](https://smithery.ai/badge/@koundinya/zd-mcp-server)](https://smithery.ai/server/@koundinya/zd-mcp-server)

## Installing via Smithery

To install Zendesk Integration Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@koundinya/zd-mcp-server):

```bash
npx -y @smithery/cli install @koundinya/zd-mcp-server --client claude
```

## Repository Setup

1. Clone the repository:
   ```bash
   git clone https://your-repo-url/mcp-experiments.git
   cd mcp-experiments/zd-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in your development environment:
   ```bash
   export ZENDESK_EMAIL="your-email@example.com"
   export ZENDESK_TOKEN="your-zendesk-api-token"
   export ZENDESK_SUBDOMAIN="your-zendesk-subdomain"
   ```

## Building the Project

1. Build the TypeScript project:
   ```bash
   npm run build
   ```

   This will compile the TypeScript files into JavaScript in the `dist` directory.

2. For development, you can use:
   ```bash
   npm run dev
   ```

## Installing with Claude Desktop App

1. Update the Claude Desktop configuration file (`claude_desktop_config.json`):

   ```json
   {
     "tools": {
       "zendesk": {
         "command": "node",
         "env": {
           "ZENDESK_EMAIL": "internal@z3nmail.com",
           "ZENDESK_TOKEN": "your-zendesk-api-token",
           "ZENDESK_SUBDOMAIN": "your-zendesk-subdomain"
         },
         "args": [
           "/path/to/mcp-experiments/zd-mcp-server/dist/index.js"
         ]
       }
     }
   }
   ```

2. Replace the environment variables with your actual Zendesk credentials.

3. Update the path to match the location of your built index.js file.

4. Restart the Claude Desktop application for the changes to take effect.

## Available Zendesk Tools

The MCP Zendesk integration provides the following functions:

1. `zendesk_get_ticket` - Retrieves a ticket by ID
2. `zendesk_get_ticket_details` - Gets ticket details including comments
3. `zendesk_search` - Searches tickets with Zendesk query syntax
4. `zendesk_create_ticket` - Creates a new ticket
5. `zendesk_update_ticket` - Updates ticket properties
6. `zendesk_add_private_note` - Adds an internal note to a ticket
7. `zendesk_add_public_note` - Adds a public comment to a ticket
8. `zendesk_get_linked_incidents` - Retrieves all incident tickets linked to a particular ticket

## Authentication Setup

1. Generate an API token in your Zendesk Admin Center:
   - Go to Admin Center > Apps and Integrations > APIs > Zendesk API
   - Add an API token and copy it

2. Use your email address and the API token in your MCP configuration

## Troubleshooting

- If you encounter authorization errors, verify your API token is valid
- Ensure your Zendesk subdomain is correct
- Check that the environment variables are properly set
- Restart the MCP server after making changes
