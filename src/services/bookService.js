import api from './api';

const svc = {
  getItems:         ()         => api.get('/admin/books/items').then((r) => r.data),
  addItem:          (data)     => api.post('/admin/books/items', data).then((r) => r.data),
  updateItem:       (id, data) => api.put(`/admin/books/items/${id}`, data).then((r) => r.data),
  deleteItem:       (id)       => api.delete(`/admin/books/items/${id}`).then((r) => r.data),

  getTransactions:  (search)   => api.get('/admin/books/transactions', { params: search ? { search } : {} }).then((r) => r.data),
  sellItem:         (data)     => api.post('/admin/books/transactions', data).then((r) => r.data),
  lookupStudent:    (admission_number) => api.get('/admin/student-lookup', { params: { admission_number } }).then((r) => r.data),
  addPayment:       (id, data) => api.post(`/admin/books/transactions/${id}/payment`, data).then((r) => r.data),
  deleteTransaction:(id)       => api.delete(`/admin/books/transactions/${id}`).then((r) => r.data),
};

export default svc;
