import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load data files
export async function loadData() {
    try {
        const dataDir = join(__dirname, '..', '..', 'data');
        const shopsPath = join(dataDir, 'shops.json');
        const customersPath = join(dataDir, 'customers.json');
        const transactionsPath = join(dataDir, 'transactions.json');
        console.log('Loading shops from:', shopsPath);
        console.log('Loading customers from:', customersPath);
        console.log('Loading transactions from:', transactionsPath);
        const [shopsData, customersData, transactionsData] = await Promise.all([
            readFile(shopsPath, 'utf-8'),
            readFile(customersPath, 'utf-8'),
            readFile(transactionsPath, 'utf-8')
        ]);
        return {
            shops: JSON.parse(shopsData),
            customers: JSON.parse(customersData),
            transactions: JSON.parse(transactionsData)
        };
    }
    catch (error) {
        console.error('Error loading data:', error);
        throw new Error(`Failed to load data files: ${error instanceof Error ? error.message : String(error)}`);
    }
}
