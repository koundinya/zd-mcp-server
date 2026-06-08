# Zendesk MCP Server

[![npm version](https://badge.fury.io/js/zd-mcp-server.svg)](https://www.npmjs.com/package/zd-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCPAmpel](https://img.shields.io/endpoint?url=https://mcpampel.com/badge/koundinya/zd-mcp-server.json)](https://mcpampel.com/repo/koundinya/zd-mcp-server)

A Model Context Protocol (MCP) server that provides AI assistants like Claude with seamless integration to Zendesk Support. Enables natural language interactions with Zendesk tickets, allowing you to search, create, update, and manage support tickets through conversational AI.

## ✨ Features

- 🎫 **Complete Ticket Management**: Create, read, update, and search Zendesk tickets
- 💬 **Comments & Notes**: Add public comments and private internal notes
- 🔍 **Advanced Search**: Search tickets using Zendesk's powerful query syntax
- 🔗 **Incident Management**: Retrieve and manage linked incident tickets
- 🏷️ **Tag Management**: Add and manage ticket tags and metadata
- 🔒 **Secure Authentication**: Uses Zendesk API tokens for secure access
- 🚀 **Easy Installation**: Available via npm, npx, or manual setup

## 🚀 Quick Start

### Option 1: NPM Installation (Recommended)

```bash
npm install -g zd-mcp-server
```

### Option 2: Use with npx (No Installation)

```bash
npx zd-mcp-server
```

### Option 3: Development Setup

```bash
git clone https://github.com/koundinya/zd-mcp-server.git
cd zd-mcp-server
npm install
npm run build
```

## ⚙️ Configuration

### Environment Variables

Set these environment variables in your system or MCP client configuration:

```bash
export ZENDESK_EMAIL="your-email@company.com"
export ZENDESK_TOKEN="your-zendesk-api-token"
export ZENDESK_SUBDOMAIN="your-company"  # from https://your-company.zendesk.com
```

### Claude Desktop Setup

Add to your Claude Desktop configuration file:

**Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "zendesk": {
      "command": "npx",
      "args": ["-y", "zd-mcp-server"],
      "env": {
        "ZENDESK_EMAIL": "your-email@company.com",
        "ZENDESK_TOKEN": "your-zendesk-api-token",
        "ZENDESK_SUBDOMAIN": "your-company"
      }
    }
  }
}
```

**Alternative (if installed globally):**
```json
{
  "mcpServers": {
    "zendesk": {
      "command": "zd-mcp-server",
      "env": {
        "ZENDESK_EMAIL": "your-email@company.com",
        "ZENDESK_TOKEN": "your-zendesk-api-token",
        "ZENDESK_SUBDOMAIN": "your-company"
      }
    }
  }
}
```

### Cursor IDE Setup

Add to `~/.cursor/mcp.json` or `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "zendesk": {
      "command": "npx",
      "args": ["-y", "zd-mcp-server"],
      "env": {
        "ZENDESK_EMAIL": "your-email@company.com",
        "ZENDESK_TOKEN": "your-zendesk-api-token",
        "ZENDESK_SUBDOMAIN": "your-company"
      }
    }
  }
}
```

### Other MCP Clients

For other MCP-compatible clients (Cline, Windsurf, etc.), refer to their documentation for MCP server configuration. The server supports standard MCP protocols.

## 🛠️ Available Tools

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `zendesk_get_ticket` | Retrieve a ticket by ID | "Get ticket #12345" |
| `zendesk_get_ticket_details` | Get detailed ticket with comments | "Show me full details for ticket #67890" |
| `zendesk_search` | Search tickets with query syntax | "Find all urgent tickets from last week" |
| `zendesk_create_ticket` | Create a new ticket | "Create a high priority ticket for login issues" |
| `zendesk_update_ticket` | Update ticket properties | "Set ticket #555 to solved status" |
| `zendesk_add_private_note` | Add internal agent notes | "Add a private note about investigation progress" |
| `zendesk_add_public_note` | Add public customer comments | "Reply to customer with solution steps" |
| `zendesk_get_linked_incidents` | Get incident tickets linked to problems | "Show incidents related to this problem ticket" |

## 💬 Usage Examples

Once configured, you can use natural language with your AI assistant:

### Ticket Management
```
"Show me all high priority tickets assigned to me"
"Create a new ticket: Customer can't access dashboard, priority urgent"
"Update ticket #12345 status to pending and add a note about waiting for customer response"
```

### Search & Discovery
```
"Find all solved tickets from this week tagged with 'billing'"
"Search for open tickets containing 'password reset'"
"Show me tickets created by john@company.com in the last 30 days"
```

### Customer Communication
```
"Add a public comment to ticket #789: 'We've identified the issue and working on a fix'"
"Add a private note: 'Customer confirmed the workaround is effective'"
```

### Advanced Queries
```
"Find all problem tickets that have linked incidents"
"Show me escalated tickets that haven't been updated in 2 days"
"Get details for ticket #456 including all comments and history"
```

## 🔑 Authentication Setup

### 1. Generate API Token

1. Log in to your Zendesk account
2. Go to **Admin Center** → **Apps and integrations** → **APIs** → **Zendesk API**
3. Click **Add API token**
4. Add description: "MCP Server Integration"
5. Click **Create** and copy the token
6. **Important**: Save this token securely - you won't see it again

### 2. Find Your Subdomain

Your Zendesk URL format: `https://YOUR-SUBDOMAIN.zendesk.com`
Use `YOUR-SUBDOMAIN` as the `ZENDESK_SUBDOMAIN` value.

### 3. Required Permissions

Ensure your Zendesk user account has:
- **Agent** role (minimum)
- **Ticket access** permissions
- **API access** enabled

## 🔧 Development

### Project Structure
```
zd-mcp-server/
├── src/
│   ├── index.ts          # Server entry point
│   └── tools/
│       └── index.ts      # Zendesk tool implementations
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Building from Source
```bash
git clone https://github.com/koundinya/zd-mcp-server.git
cd zd-mcp-server
npm install
npm run build
```

### Running Locally
```bash
# Start the server
npm start

# Development mode with auto-rebuild
npm run dev
```

### Testing
```bash
# Test with MCP Inspector (if available)
npx @modelcontextprotocol/inspector zd-mcp-server

# Or test the built version
npx @modelcontextprotocol/inspector node dist/index.js
```

## 🔍 Troubleshooting

### Common Issues

**❌ "Authentication failed" errors**
- Verify your API token is correct and hasn't expired
- Ensure your email address matches your Zendesk account
- Check that your subdomain is spelled correctly (no `.zendesk.com` suffix)

**❌ "Permission denied" errors**
- Verify your Zendesk user has Agent permissions or higher
- Ensure API access is enabled for your account
- Check if your token has the required scopes

**❌ "Server not found" errors**
- Ensure you've installed the package: `npm install -g zd-mcp-server`
- Try using npx instead: `npx zd-mcp-server`
- Check that your MCP client configuration file syntax is correct

**❌ "Environment variables not set" errors**
- Verify all three environment variables are set: `ZENDESK_EMAIL`, `ZENDESK_TOKEN`, `ZENDESK_SUBDOMAIN`
- Restart your MCP client after setting environment variables
- Check for typos in environment variable names

### Debug Mode

Enable debug logging:
```bash
DEBUG=zd-mcp-server:* zd-mcp-server
```

### Log Files

Check MCP client logs:
- **Claude Desktop**: `~/Library/Logs/Claude/` (macOS) or `%APPDATA%/Claude/logs/` (Windows)
- **Cursor**: Check the output panel for MCP server logs
- **Terminal**: Run server directly to see real-time logs

## 📚 Advanced Usage

### Search Query Syntax

Zendesk search supports powerful query operators:

```bash
# Status-based searches
status:open status:pending status:solved

# Priority searches  
priority:urgent priority:high priority:normal priority:low

# Date-based searches
created>2024-01-01 updated<2024-01-31

# Tag searches
tags:billing tags:technical-issue

# Requester searches
requester:customer@company.com

# Complex combinations
status:open priority:high created>2024-01-01 tags:billing
```

### Batch Operations

While the server doesn't directly support batch operations, you can chain commands:

```
"Search for all urgent tickets, then show me details for the first 3 results"
"Find tickets tagged 'billing', update them to normal priority, and add a note about the billing system maintenance"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Your environment (OS, Node.js version, MCP client)
- Relevant log outputs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: https://github.com/koundinya/zd-mcp-server
- **npm**: https://www.npmjs.com/package/zd-mcp-server
- **Zendesk API Docs**: https://developer.zendesk.com/api-reference/
- **Model Context Protocol**: https://modelcontextprotocol.io/

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/koundinya/zd-mcp-server/issues)
- **Zendesk API**: [Zendesk Developer Documentation](https://developer.zendesk.com/)
- **MCP Protocol**: [MCP Documentation](https://modelcontextprotocol.io/docs/)

---

Made with ❤️ for the MCP and Zendesk communities