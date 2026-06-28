import api from './api';

const svc = {
  getEnquiries:   (params) => api.get('/admin/enquiries', { params }).then((r) => r.data),
  updateEnquiry:  (id, data) => api.put(`/admin/enquiries/${id}`, data).then((r) => r.data),
  deleteEnquiry:  (id) => api.delete(`/admin/enquiries/${id}`).then((r) => r.data),
};

export default svc;
