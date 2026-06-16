import api from './api';

// Public list (no auth needed); admin upload/delete (JWT auto-attached by interceptor).
const circularService = {
  list: () => api.get('/public/circulars'),

  upload: (title, file, category) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    if (category) fd.append('category', category);
    return api.post('/admin/circulars', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove: (id) => api.delete(`/admin/circulars/${id}`),
};

export default circularService;
