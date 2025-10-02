const { algoliasearch } = require('algoliasearch');

// Load environment variables from .env file if it exists
require('dotenv').config();

const ALGOLIA_APP_ID = process.env.VITE_ALGOLIA_APP_ID || 'RMUQSU88LT';
const ALGOLIA_ADMIN_KEY = process.env.VITE_ALGOLIA_ADMIN_KEY || '3477b49adc9b4c57f96a6c1b59c96639';
const ALGOLIA_INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME || 'portfolio_content';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

// Test the connection by listing indices
async function testConnection() {
  try {
    console.log('Testing Algolia connection...');
    
    // List indices to test connection
    const result = await client.listIndices();
    console.log('Connection successful! Available indices:');
    console.log(result.items.map(item => item.name));
    
    // Test search with empty query
    const searchResult = await client.search([{
      indexName: ALGOLIA_INDEX_NAME,
      query: ''
    }]);
    
    console.log(`Search test completed. Found ${searchResult.results[0].nbHits} records in index '${ALGOLIA_INDEX_NAME}'`);
    
  } catch (error) {
    console.error('Error testing Algolia connection:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.VITE_ALGOLIA_ADMIN_KEY) {
    console.error('Error: VITE_ALGOLIA_ADMIN_KEY environment variable is required');
    console.error('Please set your Algolia Admin API Key');
    process.exit(1);
  }
  
  testConnection();
}

module.exports = { testConnection };