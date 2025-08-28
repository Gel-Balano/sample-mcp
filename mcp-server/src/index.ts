import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { loadData } from './helpers/dataHelper.js';

// Create an MCP server
const server = new McpServer({
  name: "shop-customer-server",
  version: "1.0.0"
});

// Register customers resource
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

// Register shops resource
server.registerResource(
  "shops",
  "shops://",
  {
    title: "Shops Data",
    description: "Provides access to shop information"
  },
  async (uri: URL) => {
    const { shops } = await loadData();

    // For shops://, return all shops
    if (uri.toString() === 'shops://') {
      return {
        contents: [{
          uri: 'shops://',
          text: JSON.stringify(shops, null, 2)
        }]
      };
    }

    // For shops://{id}, return specific shop
    const shopId = uri.toString().replace('shops://', '');
    if (shopId) {
      const shop = shops.find((s: any) => s.id === parseInt(shopId));
      if (!shop) throw new Error(`Shop with ID ${shopId} not found`);

      return {
        contents: [{
          uri: `shops://${shopId}`,
          text: JSON.stringify(shop, null, 2)
        }]
      };
    }

    return {
      contents: [{
        uri: 'shops://',
        text: JSON.stringify(shops, null, 2)
      }]
    };
  }
)

server.registerResource(
  "customers",
  "customers://",
  {
    title: "Customers Data",
    description: "Provides access to customer information"
  },
  async (uri: URL) => {
    const { customers } = await loadData();

    // For customers://, return all customers
    if (uri.toString() === 'customers://') {
      return {
        contents: [{
          uri: 'customers://',
          text: JSON.stringify(customers, null, 2)
        }]
      };
    }

    // For customers://{id}, return specific customer
    const customerId = uri.toString().replace('customers://', '');
    if (customerId) {
      const customer = customers.find((c: any) => c.id === parseInt(customerId));
      if (!customer) throw new Error(`Customer with ID ${customerId} not found`);

      return {
        contents: [{
          uri: `customers://${customerId}`,
          text: JSON.stringify(customer, null, 2)
        }]
      };
    }

    return {
      contents: [{
        uri: 'customers://',
        text: JSON.stringify(customers, null, 2)
      }]
    };
  }
);


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

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

console.log("MCP Server is running with STDIO transport...");
