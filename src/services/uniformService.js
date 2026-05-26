import api from './api';

const svc = {
  getItems:         ()         => api.get('/admin/uniform/items').then((r) => r.data),
  addItem:          (data)     => api.post('/admin/uniform/items', data).then((r) => r.data),
  updateItem:       (id, data) => api.put(`/admin/uniform/items/${id}`, data).then((r) => r.data),
  deleteItem:       (id)       => api.delete(`/admin/uniform/items/${id}`).then((r) => r.data),

  getTransactions:  (search)   => api.get('/admin/uniform/transactions', { params: search ? { search } : {} }).then((r) => r.data),
  sellItem:         (data)     => api.post('/admin/uniform/transactions', data).then((r) => r.data),
  addPayment:       (id, data) => api.post(`/admin/uniform/transactions/${id}/payment`, data).then((r) => r.data),
  deleteTransaction:(id)       => api.delete(`/admin/uniform/transactions/${id}`).then((r) => r.data),
};

export default svc;
