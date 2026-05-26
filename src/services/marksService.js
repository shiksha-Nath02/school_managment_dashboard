import api from './api';

// Teacher
export const getSubjectsForClass = (classId) => api.get(`/teacher/marks/subjects/${classId}`);
export const getExamTypes = (classId) => api.get(`/teacher/marks/exam-types/${classId}`);
export const getMarksForClass = (classId, examType, subject) =>
  api.get(`/teacher/marks/${classId}?exam_type=${examType}${subject ? `&subject=${subject}` : ''}`);
export const saveMarks = (data) => api.post('/teacher/marks', data);

// Student
export const getOwnResults = (examType) =>
  api.get(`/student/results${examType && examType !== 'all' ? `?exam_type=${examType}` : ''}`);
