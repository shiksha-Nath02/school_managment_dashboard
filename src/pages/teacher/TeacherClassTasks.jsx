import { useState, useEffect } from 'react';
import { getAllClasses } from '@/services/timetableService';
import { getFormData, saveClassTasks } from '@/services/classTaskService';
import { PERIODS } from '@/constants';
import { ClipboardList, Save, BookOpen, PenLine, RefreshCw } from 'lucide-react';

const TeacherClassTasks = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses();
        const cls = res.data.classes || [];
        setClasses(cls);
        if (cls.length > 0) setSelectedClass(cls[0].id);
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass || !selectedDate) return;
    const fetchForm = async () => {
      setLoading(true);
      try {
        const res = await getFormData(selectedClass, selectedDate);
        setFormData(res.data.formData || []);
        setDayOfWeek(res.data.dayOfWeek || '');
        setIsUpdate(res.data.isUpdate || false);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setFormData(PERIODS.map(p => ({ period: p.number, subject: '', classwork: '', homework: '' })));
        setDayOfWeek(new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }));
        setIsUpdate(false);
      }
      setLoading(false);
    };
    fetchForm();
  }, [selectedClass, selectedDate]);

  const handleFieldChange = (periodIndex, field, value) => {
    setFormData(prev => prev.map((item, i) =>
      i === periodIndex ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tasksData = formData.filter(item => item.subject && item.subject.trim() !== '');
      await saveClassTasks(selectedClass, selectedDate, tasksData);
      setToast({ type: 'success', message: isUpdate ? 'Updated successfully!' : 'Saved successfully!' });
      setIsUpdate(true);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save. Please try again.' });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const isSunday = new Date(selectedDate).getDay() === 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-outfit flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-[#5B3A8C]" />
          Upload Classwork & Homework
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-dm-sans">
          Fill in today's classwork and homework for each period. The form auto-fills subjects from the timetable.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C]"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                Class {cls.class_name}-{cls.section}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C]"
          />
        </div>
        <div className="flex items-end">
          <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
            isUpdate ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {dayOfWeek} {isUpdate ? '• Already uploaded (editing)' : '• New entry'}
          </span>
        </div>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {isSunday ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 font-dm-sans">Sunday is a holiday — no classwork to upload.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading form...
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {formData.map((item, index) => {
              const periodInfo = PERIODS.find(p => p.number === item.period);
              const hasContent = item.classwork || item.homework;

              return (
                <div
                  key={item.period}
                  className={`bg-white border rounded-xl p-4 transition-all ${
                    hasContent ? 'border-[#5B3A8C]/20 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F0EBF7] flex items-center justify-center">
                      <span className="text-sm font-bold text-[#5B3A8C] font-outfit">{item.period}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800 font-outfit">
                          {item.subject || 'Free Period'}
                        </span>
                        {!item.subject && (
                          <span className="text-xs text-gray-400 italic">(No subject in timetable)</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-dm-sans">
                        {periodInfo?.startTime} – {periodInfo?.endTime}
                      </span>
                    </div>
                  </div>

                  {item.subject && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-[52px]">
                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1 font-dm-sans">
                          <BookOpen className="w-3 h-3" /> Classwork
                        </label>
                        <textarea
                          value={item.classwork}
                          onChange={(e) => handleFieldChange(index, 'classwork', e.target.value)}
                          placeholder="What was taught/done in class..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C] resize-none"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1 font-dm-sans">
                          <PenLine className="w-3 h-3" /> Homework
                        </label>
                        <textarea
                          value={item.homework}
                          onChange={(e) => handleFieldChange(index, 'homework', e.target.value)}
                          placeholder="Homework assigned..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C] resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#5B3A8C] text-white rounded-xl text-sm font-semibold hover:bg-[#4a2f73] transition-colors disabled:opacity-50 shadow-lg shadow-[#5B3A8C]/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isUpdate ? 'Update Classwork/Homework' : 'Save Classwork/Homework'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherClassTasks;
