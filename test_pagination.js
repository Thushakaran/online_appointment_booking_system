// Test script for pagination functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function testPagination() {
    console.log('🧪 Testing Pagination Functionality...\n');

    try {
        // Test 1: Users pagination
        console.log('1. Testing Users Pagination');
        const usersPage1 = await axios.get(`${BASE_URL}/api/users/paginated?page=0&size=5`);
        console.log(`   ✅ Page 1: ${usersPage1.data.content.length} users`);
        console.log(`   ✅ Total: ${usersPage1.data.totalElements} users`);
        console.log(`   ✅ Pages: ${usersPage1.data.totalPages}`);
        console.log(`   ✅ Has Next: ${usersPage1.data.hasNext}`);
        console.log(`   ✅ Has Previous: ${usersPage1.data.hasPrevious}\n`);

        // Test 2: Providers pagination
        console.log('2. Testing Providers Pagination');
        const providersPage1 = await axios.get(`${BASE_URL}/api/providers/paginated?page=0&size=3`);
        console.log(`   ✅ Page 1: ${providersPage1.data.content.length} providers`);
        console.log(`   ✅ Total: ${providersPage1.data.totalElements} providers`);
        console.log(`   ✅ Pages: ${providersPage1.data.totalPages}`);
        console.log(`   ✅ Has Next: ${providersPage1.data.hasNext}`);
        console.log(`   ✅ Has Previous: ${providersPage1.data.hasPrevious}\n`);

        // Test 3: Appointments pagination
        console.log('3. Testing Appointments Pagination');
        const appointmentsPage1 = await axios.get(`${BASE_URL}/api/appointments/paginated?page=0&size=5`);
        console.log(`   ✅ Page 1: ${appointmentsPage1.data.content.length} appointments`);
        console.log(`   ✅ Total: ${appointmentsPage1.data.totalElements} appointments`);
        console.log(`   ✅ Pages: ${appointmentsPage1.data.totalPages}`);
        console.log(`   ✅ Has Next: ${appointmentsPage1.data.hasNext}`);
        console.log(`   ✅ Has Previous: ${appointmentsPage1.data.hasPrevious}\n`);

        // Test 4: Provider search with pagination
        console.log('4. Testing Provider Search with Pagination');
        const searchResults = await axios.get(`${BASE_URL}/api/providers/search/paginated?q=haircut&page=0&size=2`);
        console.log(`   ✅ Search results: ${searchResults.data.content.length} providers`);
        console.log(`   ✅ Total matches: ${searchResults.data.totalElements}`);
        console.log(`   ✅ Total pages: ${searchResults.data.totalPages}\n`);

        // Test 5: Service name search with pagination
        console.log('5. Testing Service Name Search with Pagination');
        const serviceResults = await axios.get(`${BASE_URL}/api/providers/search/service/paginated?serviceName=massage&page=0&size=2`);
        console.log(`   ✅ Service search: ${serviceResults.data.content.length} providers`);
        console.log(`   ✅ Total matches: ${serviceResults.data.totalElements}`);
        console.log(`   ✅ Total pages: ${serviceResults.data.totalPages}\n`);

        // Test 6: City search with pagination
        console.log('6. Testing City Search with Pagination');
        const cityResults = await axios.get(`${BASE_URL}/api/providers/search/city/paginated?city=jaffna&page=0&size=2`);
        console.log(`   ✅ City search: ${cityResults.data.content.length} providers`);
        console.log(`   ✅ Total matches: ${cityResults.data.totalElements}`);
        console.log(`   ✅ Total pages: ${cityResults.data.totalPages}\n`);

        // Test 7: Description search with pagination
        console.log('7. Testing Description Search with Pagination');
        const descResults = await axios.get(`${BASE_URL}/api/providers/search/description/paginated?description=beauty&page=0&size=2`);
        console.log(`   ✅ Description search: ${descResults.data.content.length} providers`);
        console.log(`   ✅ Total matches: ${descResults.data.totalElements}`);
        console.log(`   ✅ Total pages: ${descResults.data.totalPages}\n`);

        // Test 8: Multiple pages
        if (providersPage1.data.totalPages > 1) {
            console.log('8. Testing Multiple Pages');
            const providersPage2 = await axios.get(`${BASE_URL}/api/providers/paginated?page=1&size=3`);
            console.log(`   ✅ Page 2: ${providersPage2.data.content.length} providers`);
            console.log(`   ✅ Has Next: ${providersPage2.data.hasNext}`);
            console.log(`   ✅ Has Previous: ${providersPage2.data.hasPrevious}\n`);
        }

        console.log('🎉 All pagination tests completed successfully!');

        // Show sample data structure
        console.log('\n📋 Sample Pagination Response Structure:');
        console.log('   - content: Array of items for current page');
        console.log('   - page: Current page number (0-based)');
        console.log('   - size: Number of items per page');
        console.log('   - totalElements: Total number of items');
        console.log('   - totalPages: Total number of pages');
        console.log('   - hasNext: Whether there is a next page');
        console.log('   - hasPrevious: Whether there is a previous page');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the backend server is running on port 8081');
            console.log('   Run: cd backend && ./mvnw spring-boot:run');
        }
    }
}

// Run the test
testPagination();
