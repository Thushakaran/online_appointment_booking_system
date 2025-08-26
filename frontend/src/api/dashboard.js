import api from './axios';

export const dashboardAPI = {
    // Get dashboard statistics
    getStats: async () => {
        try {
            console.log('Fetching dashboard stats...');
            const response = await api.get('/api/dashboard/stats');
            console.log('Dashboard stats response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    }
};
