import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load data files
async function loadData() {
  try {
    const shopsData = await readFile(join(__dirname, '..', 'data', 'shops.json'), 'utf-8');
    const customersData = await readFile(join(__dirname, '..', 'data', 'customers.json'), 'utf-8');
    
    return {
      shops: JSON.parse(shopsData),
      customers: JSON.parse(customersData)
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Create an MCP server
const server = new McpServer({
  name: "shop-customer-server",
  version: "1.0.0"
});

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
);

// Register shops resource
server.registerResource(
  "shops",
  "shops",
  {
    title: "Shops Data",
    description: "Provides access to shop information"
  },
  async (uri: URL) => {
    const { shops } = await loadData();
    const shopId = uri.pathname.split('/').pop();
    
    if (shopId) {
      const shop = shops.find((s: any) => s.id === parseInt(shopId));
      if (!shop) throw new Error('Shop not found');
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(shop, null, 2)
        }]
      };
    }
    
    return {
      contents: shops.map((shop: any) => ({
        uri: `shops://${shop.id}`,
        text: JSON.stringify(shop, null, 2)
      }))
    };
  }
);

// Register customers resource
server.registerResource(
  "customers",
  "customers",
  {
    title: "Customers Data",
    description: "Provides access to customer information"
  },
  async (uri: URL) => {
    const { customers } = await loadData();
    const customerId = uri.pathname.split('/').pop();
    
    if (customerId) {
      const customer = customers.find((c: any) => c.id === parseInt(customerId));
      if (!customer) throw new Error('Customer not found');
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(customer, null, 2)
        }]
      };
    }
    
    return {
      contents: customers.map((customer: any) => ({
        uri: `customers://${customer.id}`,
        text: JSON.stringify(customer, null, 2)
      }))
    };
  }
);

// Register shop customers resource
server.registerResource(
  "shop-customers",
  "shop-customers",
  {
    title: "Shop Customers",
    description: "Get customers by their favorite shop"
  },
  async (uri: URL) => {
    const { customers } = await loadData();
    const shopId = uri.pathname.split('/').pop();
    
    if (!shopId) {
      throw new Error('Shop ID is required');
    }
    
    const shopCustomers = customers.filter((c: any) => c.favoriteShopId === parseInt(shopId));
    
    return {
      contents: shopCustomers.map((customer: any) => ({
        uri: `customers://${customer.id}`,
        text: JSON.stringify(customer, null, 2)
      }))
    };
  }
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

console.log("MCP Server is running with STDIO transport...");
