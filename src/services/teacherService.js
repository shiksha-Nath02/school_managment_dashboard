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

  // Superadmin only — toggle whether a teacher may edit students in her own class.
  setTeacherPermissions: async (id, can_edit_students) => {
    const response = await api.put(`/admin/teachers/${id}/permissions`, { can_edit_students });
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

  // All classes (id, class_name, section, class_teacher_id) — used to populate
  // the class-assignment dropdown on the Teachers tab.
  getClasses: async () => {
    const response = await api.get('/admin/classes');
    return response.data;
  },

  // Assign this teacher as class-teacher of a class (one class per teacher —
  // clears any class they already own, steals it from a previous owner).
  // Pass classId = '' or null to unassign.
  assignClass: async (id, classId) => {
    const response = await api.put(`/admin/teachers/${id}/class`, {
      class_id: classId === '' || classId == null ? null : parseInt(classId, 10),
    });
    return response.data;
  },
};

export default teacherService;
