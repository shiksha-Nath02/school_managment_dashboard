import api from './api';

const svc = {
  // Non-teaching staff CRUD
  getStaff:    ()         => api.get('/admin/staff').then((r) => r.data),
  addStaff:    (data)     => api.post('/admin/staff', data).then((r) => r.data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data).then((r) => r.data),
  deleteStaff: (id)       => api.delete(`/admin/staff/${id}`).then((r) => r.data),

  // Salary helpers
  getSalaryPayees:  ()       => api.get('/admin/salary-payees').then((r) => r.data),
  getSalaryHistory: (params) => api.get('/admin/salary-history', { params }).then((r) => r.data),
};

export default svc;
