import api from './api';

const teacherService = {
  getTeachers: async () => {
    const response = await api.get('/admin/teachers');
    return response.data;
  },

  addTeacher: async (data) => {
    const response = await api.post('/admin/teachers', data);
    return response.data;
  },

  updateTeacher: async (id, data) => {
    const response = await api.put(`/admin/teachers/${id}`, data);
    return response.data;
  },

  removeTeacher: async (id) => {
    const response = await api.delete(`/admin/teachers/${id}`);
    return response.data;
  },

  getTeacherAttendance: async (id, params = {}) => {
    const response = await api.get(`/admin/teachers/${id}/attendance`, { params });
    return response.data;
  },

  getTeacherClasses: async (id) => {
    const response = await api.get(`/admin/teachers/${id}/classes`);
    return response.data;
  },
};

export default teacherService;
