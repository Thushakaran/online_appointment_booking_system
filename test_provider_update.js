// Test script to debug provider update issue
// Run this in the browser console after logging in as a provider

async function testProviderUpdate() {
    const token = localStorage.getItem('token');
    const baseURL = 'http://localhost:8081';

    console.log('=== Provider Update Debug Test ===');
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
        // Test 1: Check authentication
        console.log('\n1. Testing authentication...');
        const authResponse = await fetch(`${baseURL}/api/providers/auth-test`, {
            method: 'GET',
            headers
        });

        if (authResponse.ok) {
            const authData = await authResponse.text();
            console.log('✅ Authentication working:', authData);
        } else {
            console.error('❌ Authentication failed:', authResponse.status);
            return;
        }

        // Test 2: Get current provider profile
        console.log('\n2. Getting current provider profile...');
        const profileResponse = await fetch(`${baseURL}/api/providers/me`, {
            method: 'GET',
            headers
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ Current provider profile:', profileData);

            // Test 3: Debug profile details
            console.log('\n3. Debugging profile details...');
            const debugResponse = await fetch(`${baseURL}/api/providers/debug-profile`, {
                method: 'GET',
                headers
            });

            if (debugResponse.ok) {
                const debugData = await debugResponse.text();
                console.log('✅ Debug info:', debugData);
            } else {
                console.error('❌ Debug failed:', debugResponse.status);
            }

            // Test 4: Try to update provider (with minimal data)
            console.log('\n4. Testing provider update...');
            const updateData = {
                serviceName: profileData.serviceName || 'Test Service',
                description: profileData.description || 'Test Description',
                phoneNumber: profileData.phoneNumber || '1234567890',
                address: profileData.address || 'Test Address',
                city: profileData.city || 'Test City',
                state: profileData.state || 'Test State',
                zipCode: profileData.zipCode || '12345',
                country: profileData.country || 'Test Country',
                servicePricing: profileData.servicePricing || '100'
            };

            const updateResponse = await fetch(`${baseURL}/api/providers/${profileData.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateData)
            });

            if (updateResponse.ok) {
                const updatedData = await updateResponse.json();
                console.log('✅ Provider update successful:', updatedData);
            } else {
                const errorData = await updateResponse.text();
                console.error('❌ Provider update failed:', updateResponse.status, errorData);
            }

        } else {
            console.error('❌ Failed to get provider profile:', profileResponse.status);
            const errorData = await profileResponse.text();
            console.error('Error details:', errorData);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }

    console.log('\n=== End Provider Update Debug Test ===');
}

// Run the test
testProviderUpdate();
