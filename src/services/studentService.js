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

  updateStudent: async (id, data) => {
    const response = await api.put(`/admin/students/${id}`, data);
    return response.data;
  },

  removeStudent: async (id) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  getStudentAttendance: async (id, params = {}) => {
    const response = await api.get(`/admin/students/${id}/attendance`, { params });
    return response.data;
  },

  getStudentMarks: async (id) => {
    const response = await api.get(`/admin/students/${id}/marks`);
    return response.data;
  },

  getStudentFees: async (id) => {
    const response = await api.get(`/admin/students/${id}/fees`);
    return response.data;
  },

  getStudentInventory: async (id) => {
    const response = await api.get(`/admin/students/${id}/inventory`);
    return response.data;
  },
};

export default studentService;