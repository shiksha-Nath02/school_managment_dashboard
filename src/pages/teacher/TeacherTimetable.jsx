import { useState, useEffect } from 'react';
import { getAllClasses, getTimetable, updateTimetable } from '@/services/timetableService';
import { SCHOOL_DAYS, PERIODS, SUBJECTS } from '@/constants';
import { Calendar, Save, Edit3, X } from 'lucide-react';

const TeacherTimetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState({});
  const [isEditing, setIsEditing] = useState(false);
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
    if (!selectedClass) return;
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const res = await getTimetable(selectedClass);
        setTimetable(res.data.timetable || {});
      } catch (err) {
        console.error('Error fetching timetable:', err);
        const empty = {};
        SCHOOL_DAYS.forEach(day => {
          empty[day] = PERIODS.map(p => ({ period: p.number, subject: '' }));
        });
        setTimetable(empty);
      }
      setLoading(false);
    };
    fetchTimetable();
  }, [selectedClass]);

  const handleSubjectChange = (day, periodIndex, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === periodIndex ? { ...slot, subject: value } : slot
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTimetable(selectedClass, timetable);
      setToast({ type: 'success', message: 'Timetable saved successfully!' });
      setIsEditing(false);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save timetable' });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedClassName = classes.find(c => c.id === selectedClass);
  const classLabel = selectedClassName
    ? `Class ${selectedClassName.class_name}-${selectedClassName.section}`
    : '';

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-outfit flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#5B3A8C]" />
            Class Timetable
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-dm-sans">
            View and manage the weekly timetable for any class
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(Number(e.target.value)); setIsEditing(false); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C]"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                Class {cls.class_name}-{cls.section}
              </option>
            ))}
          </select>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#5B3A8C] text-white rounded-lg text-sm font-medium hover:bg-[#4a2f73] transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Timetable
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Loading timetable...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F0EBF7]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase tracking-wider font-outfit w-[140px]">
                    Period
                  </th>
                  {SCHOOL_DAYS.map(day => (
                    <th key={day} className="px-3 py-3 text-center text-xs font-semibold text-[#5B3A8C] uppercase tracking-wider font-outfit">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pIndex) => (
                  <tr key={period.number} className={pIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 border-t border-gray-100">
                      <div className="font-semibold text-sm text-gray-800 font-outfit">Period {period.number}</div>
                      <div className="text-xs text-gray-400 font-dm-sans">{period.startTime} – {period.endTime}</div>
                    </td>
                    {SCHOOL_DAYS.map(day => {
                      const slot = timetable[day]?.[pIndex];
                      return (
                        <td key={day} className="px-2 py-2 border-t border-gray-100 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              list="subjects-list"
                              value={slot?.subject || ''}
                              onChange={(e) => handleSubjectChange(day, pIndex, e.target.value)}
                              placeholder="Subject"
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md text-center focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C] font-dm-sans"
                            />
                          ) : (
                            <span className={`text-sm font-dm-sans ${slot?.subject ? 'text-gray-700 font-medium' : 'text-gray-300 italic'}`}>
                              {slot?.subject || '—'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <datalist id="subjects-list">
            {SUBJECTS.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 font-dm-sans">
        {isEditing
          ? 'Tip: Type a subject name or select from suggestions. Leave blank for free periods.'
          : `Showing timetable for ${classLabel}. Click "Edit Timetable" to make changes.`
        }
      </div>
    </div>
  );
};

export default TeacherTimetable;
