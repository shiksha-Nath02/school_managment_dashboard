import api from './api';

// School-wide holidays (non-working days). Sundays are off by default and are
// NOT stored — only explicit, admin-declared holidays live here.
export const getHolidays = (params = {}) => api.get('/admin/holidays', { params });
export const addHoliday = (data) => api.post('/admin/holidays', data);
export const deleteHoliday = (id) => api.delete(`/admin/holidays/${id}`);

export default { getHolidays, addHoliday, deleteHoliday };
