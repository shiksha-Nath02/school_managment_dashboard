import api from './api';

const dashboardService = {
  getAdminDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};

export default dashboardService;
