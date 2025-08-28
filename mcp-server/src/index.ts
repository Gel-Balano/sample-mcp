import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadData } from './helpers/dataHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Register shop customers resource template
server.registerResource(
  "shop-customers",  // Resource name
  new ResourceTemplate("shop-customers://{shopId}", { list: undefined }),  // URI template with parameters
  {  // Resource metadata
    title: "Shop Customers",
    description: "Get customers by their favorite shop ID. Replace {shopId} with 1, 2, or 3.",
    mimeType: "application/json"
  },
  async (uri: URL) => {  // Handler function
    const { customers, shops } = await loadData();
    const uriString = uri.toString();
    console.log('Processing shop-customers URI:', uriString);

    // Extract shopId from URI like shop-customers://{shopId}
    const match = uriString.match(/^shop-customers:\/\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid URI format. Expected: shop-customers://{shopId}, got: ${uriString}`);
    }

    const shopId = match[1];
    console.log('Extracted shopId:', shopId);

    if (!shopId) {
      throw new Error('Shop ID is required in the format shop-customers://{shopId}');
    }

    // Handle template URI (when {shopId} is literal)
    if (shopId === '{shopId}') {
      const availableShops = shops.map((s: any) => ({ id: s.id, name: s.name, type: s.type }));
      return {
        contents: [{
          uri: 'shop-customers://{shopId}',
          text: JSON.stringify({
            message: "Please replace {shopId} with an actual shop ID",
            availableShops: availableShops,
            example: "Use shop-customers://1 for FreshMart customers"
          }, null, 2)
        }]
      };
    }

    // Validate that shopId is a valid number
    const shopIdNum = parseInt(shopId, 10);
    if (isNaN(shopIdNum)) {
      const availableShops = shops.map((s: any) => ({ id: s.id, name: s.name }));
      throw new Error(`Invalid shop ID: ${shopId}. Must be a valid number. Available shops: ${JSON.stringify(availableShops)}`);
    }

    console.log('Filtering customers for shopId:', shopIdNum);
    const shopCustomers = customers.filter((c: any) => c.favoriteShopId === shopIdNum);
    console.log('Found customers:', shopCustomers.length);

    if (shopCustomers.length === 0) {
      const availableShops = shops.map((s: any) => ({ id: s.id, name: s.name }));
      throw new Error(`No customers found for shop ID ${shopId}. Valid shop IDs are: ${JSON.stringify(availableShops.map((s: any) => s.id))}`);
    }

    const shop = shops.find((s: any) => s.id === shopIdNum);
    return {
      contents: [{
        uri: `shop-customers://${shopId}`,
        text: JSON.stringify({
          shop: shop,
          customers: shopCustomers
        }, null, 2)
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
);

// Register create customer tool
server.registerTool(
  "create_customer",
  {
    title: "Create Customer",
    description: "Creates a new customer with the provided name and shop ID, generating random data for other fields",
    inputSchema: {
      name: z.string().min(1, "Name is required"),
      shop_id: z.number().int().positive("Shop ID must be a positive integer")
    }
  },
  async ({ name, shop_id }) => {
    try {
      const { shops, customers } = await loadData();

      // Validate shop_id exists
      const shop = shops.find((s: any) => s.id === shop_id);
      if (!shop) {
        throw new Error(`Shop with ID ${shop_id} not found. Available shop IDs: ${shops.map((s: any) => s.id).join(', ')}`);
      }

      // Generate new customer ID
      const newId = customers.length > 0 ? Math.max(...customers.map((c: any) => c.id)) + 1 : 1;

      // Generate random data
      const membershipLevels = ["Gold", "Silver", "Platinum", "Bronze"];
      const randomMembership = membershipLevels[Math.floor(Math.random() * membershipLevels.length)];
      const randomPurchases = Math.floor(Math.random() * 50) + 1; // 1-50 purchases

      // Generate random join date between 2019 and 2024
      const startDate = new Date(2019, 0, 1);
      const endDate = new Date(2024, 11, 31);
      const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
      const randomDate = new Date(randomTime);
      const joinDate = randomDate.toISOString().split('T')[0];

      // Generate email from name
      const email = name.toLowerCase().replace(/\s+/g, '.') + '@example.com';

      // Create new customer object
      const newCustomer = {
        id: newId,
        name: name,
        email: email,
        membershipLevel: randomMembership,
        totalPurchases: randomPurchases,
        favoriteShopId: shop_id,
        joinDate: joinDate
      };

      // Add to customers array
      customers.push(newCustomer);

      // Write back to file
      const dataDir = join(__dirname, '..', 'data');
      const customersPath = join(dataDir, 'customers.json');
      await writeFile(customersPath, JSON.stringify(customers, null, 2), 'utf-8');

      return {
        content: [{
          type: "text",
          text: `Customer created successfully:\n${JSON.stringify(newCustomer, null, 2)}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: "text",
          text: `Error creating customer: ${errorMessage}`
        }]
      };
    }
  }
)

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

console.log("MCP Server is running with STDIO transport...");
