import api from './api';

const svc = {
  getExpenses:   (category) => api.get('/admin/expenses', { params: { category } }).then((r) => r.data),
  addExpense:    (data)     => api.post('/admin/expenses', data).then((r) => r.data),
  deleteExpense: (id)       => api.delete(`/admin/expenses/${id}`).then((r) => r.data),
};

export default svc;
