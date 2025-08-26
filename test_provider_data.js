// Test script to verify provider data loading
// Run this in the browser console after logging in as a provider

async function testProviderDataLoading() {
    const token = localStorage.getItem('token');
    const baseURL = 'http://localhost:8081';

    console.log('=== Provider Data Loading Test ===');
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
        console.error('No token found. Please log in first.');
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Get current provider profile
        console.log('\n1. Getting current provider profile...');
        const profileResponse = await fetch(`${baseURL}/api/providers/me`, {
            method: 'GET',
            headers
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ Provider profile data:', profileData);

            // Check if all expected fields are present
            const expectedFields = [
                'id', 'serviceName', 'description', 'profileImage',
                'phoneNumber', 'address', 'city', 'state', 'zipCode',
                'country', 'servicePricing'
            ];

            console.log('\n2. Checking field presence:');
            expectedFields.forEach(field => {
                const value = profileData[field];
                const status = value !== null && value !== undefined ? '✅' : '❌';
                console.log(`${status} ${field}: ${value}`);
            });

            // Test 3: Check if user relationship is loaded
            console.log('\n3. Checking user relationship:');
            if (profileData.user) {
                console.log('✅ User relationship loaded:', profileData.user);
            } else {
                console.log('❌ User relationship missing');
            }

        } else {
            console.error('❌ Failed to get provider profile:', profileResponse.status);
            const errorData = await profileResponse.text();
            console.error('Error details:', errorData);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }

    console.log('\n=== End Provider Data Loading Test ===');
}

// Run the test
testProviderDataLoading();
