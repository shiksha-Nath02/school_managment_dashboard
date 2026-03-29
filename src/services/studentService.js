import api from './api';

const studentService = {
  addStudent: async (data) => {
    const response = await api.post('/admin/students', data);
    return response.data;
  },

  getStudents: async (params = {}) => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },

  getClasses: async () => {
    const response = await api.get('/admin/classes');
    return response.data;
  },
};

export default studentService;