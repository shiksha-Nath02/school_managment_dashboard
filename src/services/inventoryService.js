import api from './api';

const inventoryService = {
  getItems: async (category) => {
    const response = await api.get('/admin/inventory', { params: category ? { category } : {} });
    return response.data;
  },

  addItem: async (data) => {
    const response = await api.post('/admin/inventory', data);
    return response.data;
  },

  updateItem: async (id, data) => {
    const response = await api.put(`/admin/inventory/${id}`, data);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/admin/inventory/${id}`);
    return response.data;
  },

  stockIn: async (id, data) => {
    const response = await api.post(`/admin/inventory/${id}/stock-in`, data);
    return response.data;
  },

  stockOut: async (id, data) => {
    const response = await api.post(`/admin/inventory/${id}/stock-out`, data);
    return response.data;
  },

  getItemTransactions: async (id) => {
    const response = await api.get(`/admin/inventory/${id}/transactions`);
    return response.data;
  },

  getReport: async () => {
    const response = await api.get('/admin/inventory/report');
    return response.data;
  },
};

export default inventoryService;
