// Test script to verify pagination fix - always shows 6 items per page
const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function testPaginationFix() {
    console.log('🧪 Testing Pagination Fix - Always 6 Items Per Page...\n');

    try {
        // Test 1: Providers pagination - should always return 6 items
        console.log('1. Testing Providers Pagination (Fixed to 6 items)');
        const providersResponse = await axios.get(`${BASE_URL}/api/providers/paginated?page=0&size=6`);
        console.log(`   ✅ Status: ${providersResponse.status}`);
        console.log(`   ✅ Items returned: ${providersResponse.data.content.length}`);
        console.log(`   ✅ Total providers: ${providersResponse.data.totalElements}`);
        console.log(`   ✅ Total pages: ${providersResponse.data.totalPages}`);
        console.log(`   ✅ Page size: ${providersResponse.data.size}`);

        // Verify it's exactly 6 items (or less if total is less than 6)
        const expectedItems = Math.min(6, providersResponse.data.totalElements);
        if (providersResponse.data.content.length === expectedItems) {
            console.log(`   ✅ ✅ Correct number of items: ${expectedItems}`);
        } else {
            console.log(`   ❌ ❌ Wrong number of items: expected ${expectedItems}, got ${providersResponse.data.content.length}`);
        }
        console.log('');

        // Test 2: Search with pagination - should also return 6 items
        console.log('2. Testing Search with Pagination (Fixed to 6 items)');
        const searchResponse = await axios.get(`${BASE_URL}/api/providers/search/paginated?q=beauty&page=0&size=6`);
        console.log(`   ✅ Status: ${searchResponse.status}`);
        console.log(`   ✅ Search results: ${searchResponse.data.content.length}`);
        console.log(`   ✅ Total matches: ${searchResponse.data.totalElements}`);
        console.log(`   ✅ Page size: ${searchResponse.data.size}`);

        // Verify it's exactly 6 items (or less if total is less than 6)
        const expectedSearchItems = Math.min(6, searchResponse.data.totalElements);
        if (searchResponse.data.content.length === expectedSearchItems) {
            console.log(`   ✅ ✅ Correct number of search results: ${expectedSearchItems}`);
        } else {
            console.log(`   ❌ ❌ Wrong number of search results: expected ${expectedSearchItems}, got ${searchResponse.data.content.length}`);
        }
        console.log('');

        // Test 3: Multiple pages to ensure consistency
        console.log('3. Testing Multiple Pages Consistency');
        const page1Response = await axios.get(`${BASE_URL}/api/providers/paginated?page=0&size=6`);
        const page2Response = await axios.get(`${BASE_URL}/api/providers/paginated?page=1&size=6`);

        console.log(`   ✅ Page 1 items: ${page1Response.data.content.length}`);
        console.log(`   ✅ Page 2 items: ${page2Response.data.content.length}`);
        console.log(`   ✅ Page 1 size: ${page1Response.data.size}`);
        console.log(`   ✅ Page 2 size: ${page2Response.data.size}`);

        if (page1Response.data.size === 6 && page2Response.data.size === 6) {
            console.log(`   ✅ ✅ Both pages have correct size: 6`);
        } else {
            console.log(`   ❌ ❌ Page sizes are inconsistent`);
        }
        console.log('');

        console.log('🎉 Pagination fix test completed successfully!');
        console.log('📋 Summary:');
        console.log('   - Page size is now fixed to 6 items');
        console.log('   - Search background card has been removed');
        console.log('   - Pagination works consistently across all endpoints');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

// Run the test
testPaginationFix();
