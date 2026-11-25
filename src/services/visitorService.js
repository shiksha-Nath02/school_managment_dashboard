import api from './api';

const svc = {
  // Admin — JWT auto-attached. Params: { date } or { from, to } or { q }.
  getVisitors:   (params) => api.get('/admin/visitors', { params }).then((r) => r.data),
  createVisitor: (data) => api.post('/admin/visitors', data).then((r) => r.data),
  updateVisitor: (id, data) => api.put(`/admin/visitors/${id}`, data).then((r) => r.data),
  deleteVisitor: (id) => api.delete(`/admin/visitors/${id}`).then((r) => r.data),
};

export default svc;
