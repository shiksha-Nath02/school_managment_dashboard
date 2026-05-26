import { useState, useEffect } from 'react';
import { getAllClasses } from '@/services/timetableService';
import { getSubjectsForClass, getExamTypes, getMarksForClass, saveMarks } from '@/services/marksService';
import { EXAM_TYPES, SUBJECTS } from '@/constants';
import { ClipboardCheck, Save, Loader2, ToggleLeft, ToggleRight, History, PenLine } from 'lucide-react';

const TeacherUploadMarks = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState('ut1');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [mode, setMode] = useState('single'); // 'single' | 'all'
  const [maxMarks, setMaxMarks] = useState({});
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadedHistory, setUploadedHistory] = useState([]);

  // Fetch all classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses();
        const cls = res.data.classes || [];
        setClasses(cls);
        // Don't auto-select — wait for teacher to choose a class
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      try {
        const res = await getSubjectsForClass(selectedClass);
        const subjs = res.data.subjects || [];
        const finalSubjs = subjs.length > 0 ? subjs : SUBJECTS;
        setSubjects(finalSubjs);
        if (finalSubjs.length > 0) setSelectedSubject(finalSubjs[0]);
      } catch (err) {
        console.error(err);
        setSubjects(SUBJECTS);
        setSelectedSubject(SUBJECTS[0]);
      }
    };
    fetchSubjects();
  }, [selectedClass]);


  // Fetch previously uploaded history whenever class changes
  useEffect(() => {
    if (!selectedClass) return;
    const fetchHistory = async () => {
      try {
        const res = await getExamTypes(selectedClass);
        setUploadedHistory(res.data.examTypes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [selectedClass]);

  // Fetch existing marks when class + exam + subject/mode changes, or after save (refreshKey)
  useEffect(() => {
    if (!selectedClass || !examType) return;
    if (mode === 'single' && !selectedSubject) return;

    const fetchMarks = async () => {
      setLoading(true);
      try {
        const subject = mode === 'single' ? selectedSubject : null;
        const res = await getMarksForClass(selectedClass, examType, subject);
        const data = res.data;

        setStudents(data.students || []);
        setIsUpdate(data.isUpdate || false);

        const md = {};
        const mm = { ...maxMarks };
        const subjs = mode === 'single'
          ? [selectedSubject]
          : (data.subjects?.length > 0 ? data.subjects : subjects);

        (data.students || []).forEach(s => {
          md[s.student_id] = {};
          subjs.forEach(subj => {
            const existing = s.marks?.[subj];
            md[s.student_id][subj] = {
              marks_obtained: existing?.marks_obtained ?? '',
              is_absent: existing?.is_absent ?? false,
              remark: existing?.remark ?? ''
            };
            if (existing?.max_marks) mm[subj] = existing.max_marks;
          });
        });

        setMarksData(md);
        if (data.maxMarks) {
          Object.entries(data.maxMarks).forEach(([subj, max]) => {
            if (max) mm[subj] = max;
          });
        }
        setMaxMarks(mm);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchMarks();
  }, [selectedClass, examType, selectedSubject, mode, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkChange = (studentId, subject, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: {
          ...prev[studentId]?.[subject],
          [field]: value
        }
      }
    }));
  };

  const handleMaxMarksChange = (subject, value) => {
    setMaxMarks(prev => ({ ...prev, [subject]: parseInt(value) || 0 }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    const subjs = mode === 'single' ? [selectedSubject] : subjects;
    const entries = [];

    Object.entries(marksData).forEach(([studentId, subjMap]) => {
      subjs.forEach(subj => {
        const data = subjMap[subj];
        if (!data) return;
        const mm = maxMarks[subj];
        if (!mm) return;

        entries.push({
          student_id: parseInt(studentId),
          subject: subj,
          max_marks: mm,
          marks_obtained: data.is_absent ? null : (parseFloat(data.marks_obtained) || 0),
          is_absent: data.is_absent,
          remark: data.remark || null
        });
      });
    });

    if (entries.length === 0) {
      showToast('error', 'No marks to save — set max marks first');
      return;
    }

    setSaving(true);
    try {
      const res = await saveMarks({
        class_id: parseInt(selectedClass),
        exam_type: examType,
        marks_data: entries
      });
      showToast('success', res.data.message || 'Marks saved successfully!');
      setIsUpdate(true);
      setUploadedHistory([]); // hide the previously uploaded section on success
      setRefreshKey(k => k + 1); // re-fetch marks to pre-fill with saved values
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save marks');
    }
    setSaving(false);
  };

  // Load a previously uploaded exam+subject combo for editing
  const handleHistoryClick = (histExamType, histSubject) => {
    setExamType(histExamType);
    setMode('single');
    setSelectedSubject(histSubject);
    // The marks useEffect will trigger automatically
  };

  const activeSubjects = mode === 'single' ? [selectedSubject] : subjects;

  const presentCount = Object.values(marksData).reduce((count, subjMap) => {
    const subj = activeSubjects[0];
    if (subj && subjMap[subj] && !subjMap[subj].is_absent) count++;
    return count;
  }, 0);
  const absentCount = students.length - presentCount;

  const selectedClassName = classes.find(c => c.id === parseInt(selectedClass));
  const classLabel = selectedClassName
    ? `Class ${selectedClassName.class_name}-${selectedClassName.section}`
    : '';
  const examLabel = EXAM_TYPES.find(e => e.value === examType)?.label || examType;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-outfit flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-[#5B3A8C]" />
          Upload Marks
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-dm-sans">
          Enter student marks for exams and tests
        </p>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C]"
          >
            <option value="">— Select a class —</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                Class {cls.class_name}-{cls.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C]"
          >
            {EXAM_TYPES.map(et => (
              <option key={et.value} value={et.value}>{et.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">Mode</label>
          <button
            onClick={() => setMode(prev => prev === 'single' ? 'all' : 'single')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans hover:bg-gray-50"
          >
            {mode === 'single'
              ? <ToggleLeft className="w-5 h-5 text-gray-400" />
              : <ToggleRight className="w-5 h-5 text-[#5B3A8C]" />}
            {mode === 'single' ? 'Single Subject' : 'All Subjects'}
          </button>
        </div>

        {mode === 'single' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C]"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Max marks inputs */}
      <div className="flex flex-wrap gap-3 mb-4">
        {activeSubjects.filter(Boolean).map(subj => (
          <div key={subj} className="flex items-center gap-2 bg-[#F0EBF7] px-3 py-2 rounded-lg">
            <span className="text-xs font-medium text-[#5B3A8C] font-dm-sans">{subj}:</span>
            <input
              type="number"
              value={maxMarks[subj] || ''}
              onChange={(e) => handleMaxMarksChange(subj, e.target.value)}
              placeholder="Max"
              className="w-16 px-2 py-1 border border-[#5B3A8C]/20 rounded text-sm text-center font-dm-sans focus:ring-1 focus:ring-[#5B3A8C]/20"
            />
            <span className="text-xs text-gray-400">marks</span>
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between bg-[#F0EBF7] border border-[#5B3A8C]/10 rounded-xl px-5 py-3 mb-4">
        <div className="text-sm text-[#5B3A8C] font-dm-sans">
          {classLabel} • {examLabel}
          {isUpdate && (
            <span className="ml-2 text-amber-600 text-xs font-medium">
              (Editing existing marks)
            </span>
          )}
        </div>
        <div className="flex gap-4 text-xs font-dm-sans">
          <span className="text-gray-600">Total: <strong>{students.length}</strong></span>
          <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
          <span className="text-red-500">Absent: <strong>{absentCount}</strong></span>
        </div>
      </div>

      {/* Marks table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : mode === 'single' ? (
        /* ── SINGLE SUBJECT MODE ── */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F0EBF7]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-12">Roll</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit">Student</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-24">Marks</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-20">Absent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit">Remark</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const data = marksData[student.student_id]?.[selectedSubject] || {};
                return (
                  <tr
                    key={student.student_id}
                    className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-2.5 text-sm text-gray-500 font-dm-sans">{student.roll_number}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800 font-dm-sans">{student.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        value={data.is_absent ? '' : (data.marks_obtained ?? '')}
                        onChange={(e) => handleMarkChange(student.student_id, selectedSubject, 'marks_obtained', e.target.value)}
                        disabled={data.is_absent}
                        max={maxMarks[selectedSubject] || 100}
                        min={0}
                        placeholder="0"
                        className={`w-20 px-2 py-1.5 border rounded-lg text-sm text-center font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 ${
                          data.is_absent
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'border-gray-200'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={data.is_absent || false}
                        onChange={(e) => handleMarkChange(student.student_id, selectedSubject, 'is_absent', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={data.remark || ''}
                        onChange={(e) => handleMarkChange(student.student_id, selectedSubject, 'remark', e.target.value)}
                        placeholder="Optional remark"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-1 focus:ring-[#5B3A8C]/20"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── ALL SUBJECTS MODE ── */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F0EBF7]">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-10 sticky left-0 bg-[#F0EBF7]">Roll</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-36 sticky left-10 bg-[#F0EBF7]">Student</th>
                  {subjects.map(subj => (
                    <th key={subj} className="px-2 py-3 text-center text-xs font-semibold text-[#5B3A8C] uppercase font-outfit min-w-[110px]">
                      {subj}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr
                    key={student.student_id}
                    className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-3 py-2 text-sm text-gray-500 font-dm-sans sticky left-0 bg-inherit">{student.roll_number}</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-800 font-dm-sans sticky left-10 bg-inherit">{student.name}</td>
                    {subjects.map(subj => {
                      const data = marksData[student.student_id]?.[subj] || {};
                      return (
                        <td key={subj} className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={data.is_absent ? '' : (data.marks_obtained ?? '')}
                              onChange={(e) => handleMarkChange(student.student_id, subj, 'marks_obtained', e.target.value)}
                              disabled={data.is_absent}
                              max={maxMarks[subj] || 100}
                              min={0}
                              placeholder="0"
                              className={`w-16 px-1 py-1 border rounded text-sm text-center font-dm-sans ${
                                data.is_absent
                                  ? 'bg-gray-100 text-gray-400 border-gray-200'
                                  : 'border-gray-200 focus:ring-1 focus:ring-[#5B3A8C]/20'
                              }`}
                            />
                            <input
                              type="checkbox"
                              checked={data.is_absent || false}
                              onChange={(e) => handleMarkChange(student.student_id, subj, 'is_absent', e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-red-500"
                              title="Absent"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#5B3A8C] text-white rounded-xl text-sm font-semibold hover:bg-[#4a2f73] transition-colors disabled:opacity-50 shadow-lg shadow-[#5B3A8C]/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : isUpdate ? 'Update Marks' : 'Save Marks'}
        </button>
      </div>

      {/* Previously Uploaded section */}
      {uploadedHistory.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-gray-700 font-outfit mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-[#5B3A8C]" />
            Previously Uploaded
            <span className="text-xs font-normal text-gray-400 ml-1">— click to load for editing</span>
          </h2>
          <div className="space-y-3">
            {uploadedHistory.map(({ exam_type: et, subjects: histSubjects }) => {
              const etLabel = EXAM_TYPES.find(e => e.value === et)?.label || et;
              return (
                <div key={et} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                  <div className="text-xs font-semibold text-gray-400 font-outfit uppercase tracking-wide mb-2">
                    {etLabel}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {histSubjects.map(subj => {
                      const isActive = examType === et && selectedSubject === subj && mode === 'single';
                      return (
                        <button
                          key={subj}
                          onClick={() => handleHistoryClick(et, subj)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-dm-sans border transition-colors ${
                            isActive
                              ? 'bg-[#5B3A8C] text-white border-[#5B3A8C]'
                              : 'bg-[#F0EBF7] text-[#5B3A8C] border-[#5B3A8C]/20 hover:bg-[#5B3A8C]/10'
                          }`}
                        >
                          <PenLine className="w-3 h-3" />
                          {subj}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherUploadMarks;
