import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

interface Shop {
  id: number;
  name: string;
  type: string;
  location: string;
  established: string;
  rating: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  membershipLevel: string;
  totalPurchases: number;
  favoriteShopId: number;
  joinDate: string;
}

async function main() {
  // Create a client with stdio transport
  const transport = new StdioClientTransport();
  const client = new McpClient(transport);

  try {
    // Get server info
    const info = await client.initialize();
    console.log("Connected to MCP server:", info.serverInfo.name, "v" + info.serverInfo.version);

    // Test the echo tool
    console.log("\nTesting echo tool...");
    const echoResult = await client.callTool("echo", { message: "Hello from client!" });
    console.log("Echo response:", echoResult.content[0].text);

    // Get all shops
    console.log("\nFetching all shops...");
    const shopsResult = await client.getResource("shops://");
    const shops = shopsResult.contents.map((c: { text: string }) => JSON.parse(c.text) as Shop);
    console.log(`Found ${shops.length} shops:`);
    shops.forEach((shop: Shop) => {
      console.log(`- ${shop.name} (${shop.type}) - Rating: ${shop.rating}/5`);
    });

    // Get customers for the first shop
    if (shops.length > 0) {
      const firstShop = shops[0];
      console.log(`\nFetching customers for ${firstShop.name}...`);
      
      const customersResult = await client.getResource(`shop-customers://${firstShop.id}`);
      const customers = customersResult.contents.map((c: { text: string }) => JSON.parse(c.text) as Customer);
      
      console.log(`\nCustomers of ${firstShop.name}:`);
      customers.forEach((customer: Customer) => {
        console.log(`- ${customer.name} (${customer.membershipLevel}) - ${customer.totalPurchases} purchases`);
      });

      // Get details of the first customer
      if (customers.length > 0) {
        const firstCustomer = customers[0];
        console.log(`\nFetching details for ${firstCustomer.name}...`);
        
        const customerDetails = await client.getResource(`customers://${firstCustomer.id}`);
        const customer = JSON.parse(customerDetails.contents[0].text) as Customer;
        
        console.log("\nCustomer Details:");
        console.log(`Name: ${customer.name}`);
        console.log(`Email: ${customer.email}`);
        console.log(`Membership Level: ${customer.membershipLevel}`);
        console.log(`Total Purchases: ${customer.totalPurchases}`);
        console.log(`Member Since: ${new Date(customer.joinDate).toLocaleDateString()}`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Clean up
    await client.shutdown();
    process.exit(0);
  }
}

main().catch(console.error);
