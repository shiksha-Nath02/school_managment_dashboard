import api from './api';

export const getFormData = (classId, date) => api.get(`/teacher/class-tasks/form-data/${classId}?date=${date}`);
export const saveClassTasks = (classId, date, tasksData) => api.post('/teacher/class-tasks', { classId, date, tasksData });
export const getStudentClassTasks = (date) => api.get(`/student/class-tasks?date=${date}`);
export const getStudentWeekTasks = (startDate) => api.get(`/student/class-tasks/week?startDate=${startDate}`);
