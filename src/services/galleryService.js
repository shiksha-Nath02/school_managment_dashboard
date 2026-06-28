import api from './api';

// Public list (no auth needed); admin upload/delete (JWT auto-attached by interceptor).
const galleryService = {
  list: (category) =>
    api.get('/public/gallery', { params: category ? { category } : {} }),

  // Upload one or many images into a folder (category). `files` = File | File[].
  upload: (category, files, caption) => {
    const fd = new FormData();
    (Array.isArray(files) ? files : [files]).forEach((f) => fd.append('files', f));
    fd.append('category', category);
    if (caption) fd.append('caption', caption);
    return api.post('/admin/gallery', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove: (id) => api.delete(`/admin/gallery/${id}`),
};

export default galleryService;
