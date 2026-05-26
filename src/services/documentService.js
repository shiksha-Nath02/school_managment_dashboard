import api from './api';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const fileUrl = (filePath) => `${BASE}/${filePath}`;

const makeDocService = (role = 'admin') => {
  const prefix = role === 'teacher' ? '/teacher' : '/admin';
  return {
    getStudentDocs: (class_id) =>
      api.get(`${prefix}/student-docs`, { params: class_id ? { class_id } : {} }),

    uploadDocument: (studentId, docType, file) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post(`${prefix}/student-docs/${studentId}/${docType}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    deleteDocument: (docId) => api.delete(`${prefix}/student-docs/${docId}`),
  };
};

const documentService = makeDocService('admin');

export { makeDocService };
export default documentService;
