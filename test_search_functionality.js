// Test script for search functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function testSearchFunctionality() {
    console.log('🧪 Testing Search Functionality...\n');

    try {
        // Test 1: Get all providers
        console.log('1. Testing GET /api/providers');
        const allProviders = await axios.get(`${BASE_URL}/api/providers`);
        console.log(`   ✅ Found ${allProviders.data.length} providers\n`);

        // Test 2: Search by general term
        console.log('2. Testing general search');
        const searchResults = await axios.get(`${BASE_URL}/api/providers/search?q=haircut`);
        console.log(`   ✅ Found ${searchResults.data.length} providers for "haircut"\n`);

        // Test 3: Search by service name
        console.log('3. Testing service name search');
        const serviceResults = await axios.get(`${BASE_URL}/api/providers/search/service?serviceName=massage`);
        console.log(`   ✅ Found ${serviceResults.data.length} providers for service "massage"\n`);

        // Test 4: Search by city
        console.log('4. Testing city search');
        const cityResults = await axios.get(`${BASE_URL}/api/providers/search/city?city=jaffna`);
        console.log(`   ✅ Found ${cityResults.data.length} providers in "jaffna"\n`);

        // Test 5: Search by description
        console.log('5. Testing description search');
        const descResults = await axios.get(`${BASE_URL}/api/providers/search/description?description=beauty`);
        console.log(`   ✅ Found ${descResults.data.length} providers with "beauty" in description\n`);

        console.log('🎉 All search tests completed successfully!');

        // Show sample provider data if available
        if (allProviders.data.length > 0) {
            console.log('\n📋 Sample Provider Data:');
            const sample = allProviders.data[0];
            console.log(`   - Username: ${sample.user?.username || 'N/A'}`);
            console.log(`   - Service: ${sample.serviceName || 'N/A'}`);
            console.log(`   - City: ${sample.city || 'N/A'}`);
            console.log(`   - Description: ${sample.description?.substring(0, 50) || 'N/A'}...`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the backend server is running on port 8081');
            console.log('   Run: cd backend && ./mvnw spring-boot:run');
        }
    }
}

// Run the test
testSearchFunctionality();
