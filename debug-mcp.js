const { spawn } = require('child_process');
const path = require('path');

console.log('Testing MCP server directly...');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  cwd: path.join(__dirname, 'mcp-server'),
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Server:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

// Test the resources/list request
setTimeout(() => {
  const listRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'resources/list',
    params: {}
  }) + '\n';
  
  console.log('Sending:', listRequest);
  server.stdin.write(listRequest);
}, 1000);

// Test reading all customers
setTimeout(() => {
  const readRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/read',
    params: {
      uri: 'customers:///'
    }
  }) + '\n';
  
  console.log('Sending:', readRequest);
  server.stdin.write(readRequest);
}, 2000);

// Test reading a specific customer
setTimeout(() => {
  const readCustomerRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'resources/read',
    params: {
      uri: 'customers:///1'
    }
  }) + '\n';
  
  console.log('Sending:', readCustomerRequest);
  server.stdin.write(readCustomerRequest);
}, 3000);

// Test reading all shops
setTimeout(() => {
  const readShopsRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: 'resources/read',
    params: {
      uri: 'shops:///'
    }
  }) + '\n';
  
  console.log('Sending:', readShopsRequest);
  server.stdin.write(readShopsRequest);
}, 4000);

// Test reading shop customers
setTimeout(() => {
  const readShopCustomersRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 5,
    method: 'resources/read',
    params: {
      uri: 'shop-customers:///1'
    }
  }) + '\n';
  
  console.log('Sending:', readShopCustomersRequest);
  server.stdin.write(readShopCustomersRequest);
}, 5000);

setTimeout(() => {
  server.kill();
  console.log('Test completed');
}, 5000);