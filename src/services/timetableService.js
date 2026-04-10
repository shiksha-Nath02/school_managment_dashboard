import api from './api';

export const getAllClasses = () => api.get('/teacher/all-classes');
export const getTimetable = (classId) => api.get(`/teacher/timetable/${classId}`);
export const updateTimetable = (classId, timetable) => api.put(`/teacher/timetable/${classId}`, { timetable });
export const getStudentTimetable = () => api.get('/student/timetable');
