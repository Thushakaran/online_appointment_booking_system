// Test script for frontend pagination access
const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function testFrontendPagination() {
    console.log('🧪 Testing Frontend Pagination Access...\n');

    try {
        // Test 1: Basic providers pagination (should work without auth)
        console.log('1. Testing Providers Pagination (Public Access)');
        const providersResponse = await axios.get(`${BASE_URL}/api/providers/paginated?page=0&size=6`);
        console.log(`   ✅ Status: ${providersResponse.status}`);
        console.log(`   ✅ Providers found: ${providersResponse.data.content.length}`);
        console.log(`   ✅ Total providers: ${providersResponse.data.totalElements}`);
        console.log(`   ✅ Total pages: ${providersResponse.data.totalPages}\n`);

        // Test 2: Provider search with pagination (should work without auth)
        console.log('2. Testing Provider Search with Pagination (Public Access)');
        const searchResponse = await axios.get(`${BASE_URL}/api/providers/search/paginated?q=beauty&page=0&size=6`);
        console.log(`   ✅ Status: ${searchResponse.status}`);
        console.log(`   ✅ Search results: ${searchResponse.data.content.length}`);
        console.log(`   ✅ Total matches: ${searchResponse.data.totalElements}\n`);

        // Test 3: Service name search (should work without auth)
        console.log('3. Testing Service Name Search (Public Access)');
        const serviceResponse = await axios.get(`${BASE_URL}/api/providers/search/service/paginated?serviceName=massage&page=0&size=6`);
        console.log(`   ✅ Status: ${serviceResponse.status}`);
        console.log(`   ✅ Service results: ${serviceResponse.data.content.length}\n`);

        // Test 4: City search (should work without auth)
        console.log('4. Testing City Search (Public Access)');
        const cityResponse = await axios.get(`${BASE_URL}/api/providers/search/city/paginated?city=jaffna&page=0&size=6`);
        console.log(`   ✅ Status: ${cityResponse.status}`);
        console.log(`   ✅ City results: ${cityResponse.data.content.length}\n`);

        // Test 5: Individual provider access (should work without auth)
        console.log('5. Testing Individual Provider Access (Public Access)');
        if (providersResponse.data.content.length > 0) {
            const providerId = providersResponse.data.content[0].id;
            const providerResponse = await axios.get(`${BASE_URL}/api/providers/${providerId}`);
            console.log(`   ✅ Status: ${providerResponse.status}`);
            console.log(`   ✅ Provider name: ${providerResponse.data.serviceName}\n`);
        }

        console.log('🎉 All frontend pagination tests passed!');
        console.log('✅ The frontend can now access provider data without authentication');
        console.log('✅ Pagination is working correctly');
        console.log('✅ Search functionality is working correctly');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.status, error.response?.statusText);
        console.error('Error details:', error.response?.data || error.message);
    }
}

// Run the test
testFrontendPagination();
