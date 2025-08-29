# Sample MCP Server - Quick Start Guide

A simple [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server implementation for managing shop and customer data.

## About MCP

The Model Context Protocol (MCP) is an open protocol that enables secure connections between host applications and external data sources and tools. Learn more:

- 📖 [Official MCP Documentation](https://modelcontextprotocol.io/)
- 🛠️ [MCP typescipt SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- 📋 [MCP Specification](https://spec.modelcontextprotocol.io/)
- 🏗️ [Building MCP Servers](https://modelcontextprotocol.io/docs/building-servers)

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

### Custom Resource Template Example

You can extend this server by adding custom resource templates for new URI schemes using `server.registerResource`. Here's an example of how to define a new resource template:

```typescript
// User profile resource with dynamic userId parameter
server.registerResource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  {
    title: "User Profile",
    description: "User profile information"
  },
  async (uri, { userId }) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify({
        userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`,
        profile: {
          joinDate: "2024-01-15",
          lastLogin: new Date().toISOString(),
          preferences: {
            theme: "dark",
            notifications: true
          }
        }
      }, null, 2)
    }]
  })
);
```

**Usage Example:**
- `users://123/profile` - Access user profile for user ID 123

## Usage with MCP Clients

This server runs using STDIO transport, making it compatible with MCP clients like:
- Claude Desktop (with proper configuration)
- Custom MCP client implementations
- The MCP Inspector tool (included in dev dependencies)
- AI IDEs (Windsurf, Roo Code, etc.)

### MCP Client Configuration

To use this server with Claude Desktop, add it to your MCP settings. For detailed setup instructions, see:
- 📄 [Claude Desktop MCP Guide](https://modelcontextprotocol.io/clients/claude-desktop)
- ⚙️ [MCP Client Configuration](https://modelcontextprotocol.io/quickstart/client)

### AI IDE Integration (Windsurf, Roo Code)

To integrate this MCP server with AI IDEs like Windsurf or Roo Code:

#### 1. Build the Server
```bash
yarn build
```

#### 2. Configure in AI IDE
Add the following configuration to your AI IDE's MCP settings:

```json
{
  "mcpServers": {
    "shop-customer-server": {
      "command": "node",
      "args": ["/absolute/path/to/sample-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

**For Windsurf:**
- Open Settings → Extensions → MCP Configuration
- Add the server configuration above
- Restart Windsurf

**For Roo Code:**
- Navigate to `.roo/mcp.json` in your project
- Add the server configuration
- Reload the AI context

#### 3. Verify Connection
- Check the AI IDE's MCP status panel
- Test the `echo` tool with a simple message
- Access the `cars://` resource to verify data flow

### Additional MCP Resources

- 📚 [MCP Examples Repository](https://github.com/modelcontextprotocol/servers)
- 💬 [MCP Community Discord](https://discord.gg/modelcontextprotocol)
- 🐛 [Report Issues](https://github.com/modelcontextprotocol/specification/issues)

## Development Tips

- Use `yarn dev` for active development with automatic restart
- Use `yarn inspect` to debug MCP communication
- The server outputs to console when running
- Modify `src/index.ts` to add new tools and resources

## Implementing MCP in Next.js Applications

To integrate MCP functionality into a Next.js application, you can create API routes that communicate with MCP servers:

### 1. Install MCP Client Dependencies
```bash
npm install @modelcontextprotocol/sdk
# or
yarn add @modelcontextprotocol/sdk
```

### 2. Create MCP Client API Route
Create `pages/api/mcp/[...params].ts` (Pages Router) or `app/api/mcp/[...params]/route.ts` (App Router):

```typescript
// app/api/mcp/route.ts (App Router example)
import { NextRequest, NextResponse } from 'next/server';
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function POST(request: NextRequest) {
  try {
    const { tool, args } = await request.json();
    
    // Create transport to your MCP server
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['/path/to/sample-mcp/dist/index.js']
    });
    
    // Create client and connect
    const client = new McpClient({
      name: 'nextjs-mcp-client',
      version: '1.0.0'
    });
    
    await client.connect(transport);
    
    // Call the tool
    const result = await client.callTool(tool, args);
    
    await client.close();
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Create React Hook for MCP
Create `hooks/useMCP.ts`:

```typescript
import { useState } from 'react';

export function useMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callTool = async (tool: string, args: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, args })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callTool, loading, error };
}
```

### 4. Use MCP in React Components
```typescript
// components/MCPExample.tsx
import { useMCP } from '../hooks/useMCP';

export default function MCPExample() {
  const { callTool, loading, error } = useMCP();
  const [result, setResult] = useState(null);

  const handleEcho = async () => {
    try {
      const response = await callTool('echo', { message: 'Hello MCP!' });
      setResult(response);
    } catch (err) {
      console.error('MCP call failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleEcho} disabled={loading}>
        {loading ? 'Calling MCP...' : 'Test Echo Tool'}
      </button>
      
      {error && <p className="error">Error: {error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### 5. Environment Configuration
Add to your `.env.local`:
```env
MCP_SERVER_PATH=/absolute/path/to/sample-mcp/dist/index.js
MCP_SERVER_TIMEOUT=30000
```

### Best Practices for Next.js + MCP
- **Connection Management**: Use connection pooling for production
- **Error Handling**: Implement proper timeout and retry logic
- **Security**: Validate all inputs before passing to MCP server
- **Performance**: Consider caching MCP responses when appropriate
- **Development**: Use the MCP Inspector alongside Next.js dev server

## Troubleshooting

- Ensure Node.js version is 16 or higher
- Run `yarn install` if you encounter dependency issues
- Check console output for any runtime errors