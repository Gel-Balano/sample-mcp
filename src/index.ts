import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "shop-customer-server",
  version: "1.0.0"
});

// Register example resource
server.registerResource(
  "generated-cars-list",
  "cars://",
  {
    title: "Generated Cars List",
    description: "Provides access to generated car information"
  },
  async (uri: URL) => {
    // your data source, for now it is static
    const cars = ["Mustang", "Ferrari", "Lamborghini"];

    return {
      contents: [{
        uri: 'cars://',
        text: JSON.stringify(cars, null, 2)
      }]
    };
  }
)

// Register a simple echo tool
server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "Echoes back the input",
    inputSchema: {
      message: z.string()
    }
  },
  async ({ message }) => ({
    content: [{
      type: "text",
      text: `Echo: ${message}`
    }]
  })
)

// Register a simple prompt
server.registerPrompt(
  "customer-insights",
  {
    title: "Customer Insights & Recommendations",
    description: "Generates personalized insights and recommendations for a specific customer based on their transaction history and preferences",
    argsSchema: {
      customer_id: z.string().regex(/^\d+$/, "Customer ID must be a numeric string"),
      insight_type: z.enum(["spending", "loyalty", "personalization", "retention"]).describe("Type of insight to generate")
    }
  },
  async (args) => {
    const { customer_id, insight_type } = args;
    const promptText = `Please analyze customer ${customer_id} and provide ${insight_type} insights. Consider their purchase history, preferences, and behavior patterns to generate actionable recommendations.`;
    
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptText
          }
        }
      ]
    };
  }
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

console.log("MCP Server is running with STDIO transport...");
