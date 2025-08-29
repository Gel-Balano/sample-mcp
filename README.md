# Sample MCP Server - Quick Start Guide

A simple Model Context Protocol (MCP) server implementation for managing shop and customer data.

## Prerequisites

- **Node.js** (v16 or higher)
- **Yarn** package manager

## Quick Start

### 1. Clone/Download the Project
```bash
# If you have the project locally, navigate to it
cd sample-mcp
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Development Mode (Recommended for testing)
```bash
# Run in development mode with hot reload
yarn dev
```

### 4. Build and Run (Production)
```bash
# Build the TypeScript project
yarn build

# Start the compiled server
yarn start
```

### 5. Inspect the MCP Server (Optional)
```bash
# Launch the MCP inspector for debugging
yarn inspect

# Open the inspector UI in your browser
yarn inspect:ui
```

## Project Structure

```
sample-mcp/
├── src/
│   ├── index.ts              # Main server entry point
│   └── helpers/
│       └── dataHelper.ts     # Data processing utilities
├── data/
│   ├── customers.json        # Customer data
│   ├── shops.json           # Shop data
│   └── transactions.json    # Transaction data
├── package.json             # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## What This Server Provides

- **Resources**: Access to generated car information via `cars://` URI
- **Tools**: Echo tool for testing MCP communication
- **Transport**: STDIO transport for MCP client communication

## Usage with MCP Clients

This server runs using STDIO transport, making it compatible with MCP clients like:
- Claude Desktop (with proper configuration)
- Custom MCP client implementations
- The MCP Inspector tool (included in dev dependencies)

## Development Tips

- Use `yarn dev` for active development with automatic restart
- Use `yarn inspect` to debug MCP communication
- The server outputs to console when running
- Modify `src/index.ts` to add new tools and resources

## Troubleshooting

- Ensure Node.js version is 16 or higher
- Run `yarn install` if you encounter dependency issues
- Check console output for any runtime errors