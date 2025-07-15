// Test script for HDI API endpoints
// Run this to debug API connectivity issues

import { HDI_API, enableAPIDebugMode } from './api-utils.js';

console.log('🚀 HDI API Test Script Starting...\n');

// Enable debug mode for detailed logging
enableAPIDebugMode();

// Test functions
async function testAPIConnection() {
  console.log('1️⃣ Testing API Connection...');
  try {
    const isConnected = await HDI_API.testConnection();
    if (isConnected) {
      console.log('✅ API connection successful!\n');
    } else {
      console.log('❌ API connection failed\n');
    }
  } catch (error) {
    console.error('❌ Connection test error:', error.message, '\n');
  }
}

async function testVoiceSearch() {
  console.log('2️⃣ Testing Voice Search...');
  const testQueries = [
    "Find 924 Zoe Street",
    "Show me properties on Main Street",
    "What's the value of 1247 Main Street Houston"
  ];

  for (const query of testQueries) {
    try {
      console.log(`   Testing: "${query}"`);
      const startTime = Date.now();
      const results = await HDI_API.voiceSearchProperty(query);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Success (${duration}ms):`, {
        resultCount: Array.isArray(results) ? results.length : 'Not an array',
        firstResult: results?.[0] ? {
          id: results[0].id,
          address: results[0].address || results[0].full_address
        } : 'No results'
      });
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }
  console.log('');
}

async function testAIChat() {
  console.log('3️⃣ Testing AI Chat...');
  const testQuestions = [
    {
      question: "What's the Houston real estate market like?",
      search_web: false
    },
    {
      question: "Tell me about The Woodlands area",
      search_web: true
    }
  ];

  for (const { question, search_web } of testQuestions) {
    try {
      console.log(`   Testing: "${question}" (web search: ${search_web})`);
      const startTime = Date.now();
      const response = await HDI_API.askAIWithContext(question, [], { search_web });
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Success (${duration}ms):`, {
        hasResponse: !!response.response || !!response.answer,
        responsePreview: (response.response || response.answer || '').substring(0, 100) + '...'
      });
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }
  console.log('');
}

async function testPropertyFormat() {
  console.log('4️⃣ Testing Voice Format (requires valid property ID)...');
  
  // First, try to get a property ID from search
  try {
    const searchResults = await HDI_API.voiceSearchProperty("924 Zoe Street");
    if (searchResults && searchResults.length > 0) {
      const propertyId = searchResults[0].id;
      console.log(`   Found property ID: ${propertyId}`);
      
      const startTime = Date.now();
      const formatted = await HDI_API.getVoiceFormattedProperty(propertyId);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Success (${duration}ms):`, {
        hasVoiceSummary: !!formatted.voice_summary,
        summaryPreview: (formatted.voice_summary || formatted.summary || '').substring(0, 100) + '...'
      });
    } else {
      console.log('   ⚠️  No properties found to test formatting');
    }
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
  }
  console.log('');
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive API tests...\n');
  console.log('API Base URL:', process.env.NEXT_PUBLIC_HDI_API_URL || 'https://hdi-api-production.up.railway.app');
  console.log('-----------------------------------\n');

  await testAPIConnection();
  await testVoiceSearch();
  await testAIChat();
  await testPropertyFormat();

  console.log('-----------------------------------');
  console.log('✅ All tests completed!');
  console.log('\nCheck the console for detailed logs.');
  console.log('If searches are getting stuck, look for:');
  console.log('- Timeout errors (server taking too long)');
  console.log('- 500/502/503 errors (server issues)');
  console.log('- Network errors (connection issues)');
  console.log('- Response time > 10 seconds (performance issues)');
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.runAPITests = runAllTests;
  console.log('💡 Run window.runAPITests() in the console to start tests');
} else {
  runAllTests();
}

export { runAllTests };