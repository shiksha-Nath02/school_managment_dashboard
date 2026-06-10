import { useState, useEffect, useRef } from 'react';
import { getAllClasses } from '@/services/timetableService';
import { getSubjectsForClass, getExamTypes, getMarksForClass, saveMarks } from '@/services/marksService';
import { EXAM_TYPES, SUBJECTS } from '@/constants';
import { ClipboardCheck, Save, Loader2, History, PenLine, ChevronDown, Check, Plus, X } from 'lucide-react';

// ── Single subject combobox: dropdown list + free-text input ─────────────────
function SubjectCombobox({ subjects, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = subjects.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
  const isCustom = query.trim() && !subjects.map(s => s.toLowerCase()).includes(query.trim().toLowerCase());

  const select = (subj) => { onChange(subj); setQuery(subj); setOpen(false); };
  const commit = () => { if (query.trim()) { onChange(query.trim()); setOpen(false); } };

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setOpen(false); }}
        placeholder="Type or pick a subject…"
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 focus:border-[#5B3A8C] w-48 outline-none"
      />
      {open && (filtered.length > 0 || isCustom) && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg w-56">
          <ul className="max-h-52 overflow-y-auto py-1">
            {isCustom && (
              <li>
                <button type="button" onClick={commit}
                  className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-[#F0EBF7] text-[#5B3A8C] font-medium">
                  <Plus className="w-3.5 h-3.5" /> Use &ldquo;{query.trim()}&rdquo;
                </button>
              </li>
            )}
            {filtered.map((subj) => (
              <li key={subj}>
                <button type="button" onClick={() => select(subj)}
                  className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-[#F0EBF7] transition-colors ${subj === value ? 'font-semibold text-[#5B3A8C]' : 'text-gray-700'}`}>
                  {subj === value && <Check className="w-3.5 h-3.5 text-[#5B3A8C] shrink-0" />}
                  {subj !== value && <span className="w-3.5 shrink-0" />}
                  {subj}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Multi-select subject picker with search + custom input ────────────────────
function SubjectMultiSelect({ subjects, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = subjects.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
  const canAdd = query.trim() && !subjects.map(s => s.toLowerCase()).includes(query.trim().toLowerCase());

  const toggle = (subj) => {
    onChange(selected.includes(subj) ? selected.filter((s) => s !== subj) : [...selected, subj]);
  };

  const addCustom = () => {
    const val = query.trim();
    if (!val) return;
    if (!selected.includes(val)) onChange([...selected, val]);
    setQuery('');
  };

  const label = selected.length === 0
    ? 'Select subjects…'
    : selected.length === subjects.length
    ? 'All subjects'
    : selected.join(', ');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans bg-white hover:bg-gray-50 min-w-[180px] max-w-[280px]"
      >
        <span className="flex-1 text-left truncate text-gray-700">{label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg w-64">
          {/* Search / add input */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }}
              placeholder="Search or add subject…"
              className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            {canAdd && (
              <button
                onClick={addCustom}
                title={`Add "${query.trim()}"`}
                className="flex items-center gap-0.5 text-xs text-[#5B3A8C] font-semibold hover:underline shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>

          {/* Subject list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && !canAdd && (
              <li className="px-4 py-2 text-xs text-gray-400">No subjects found</li>
            )}
            {filtered.map((subj) => (
              <li key={subj}>
                <button
                  type="button"
                  onClick={() => toggle(subj)}
                  className="flex items-center gap-2.5 w-full px-4 py-1.5 text-sm text-left hover:bg-[#F0EBF7] transition-colors"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected.includes(subj) ? 'bg-[#5B3A8C] border-[#5B3A8C]' : 'border-gray-300'}`}>
                    {selected.includes(subj) && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className={selected.includes(subj) ? 'font-medium text-[#5B3A8C]' : 'text-gray-700'}>{subj}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer: show selected pills + clear */}
          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2 flex flex-wrap gap-1">
              {selected.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-[#F0EBF7] text-[#5B3A8C] text-xs px-2 py-0.5 rounded-full font-medium">
                  {s}
                  <button onClick={() => toggle(s)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TeacherUploadMarks = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState('ut1');
  const [subjects, setSubjects] = useState([]);
  const [singleSubject, setSingleSubject] = useState('');   // for 'single' mode
  const [selectedSubjects, setSelectedSubjects] = useState([]); // for 'multi' mode
  const [mode, setMode] = useState('single'); // 'single' | 'multi'
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
        setSingleSubject(finalSubjs[0] || '');
        setSelectedSubjects(finalSubjs);
      } catch (err) {
        console.error(err);
        setSubjects(SUBJECTS);
        setSingleSubject(SUBJECTS[0] || '');
        setSelectedSubjects(SUBJECTS);
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

  // Fetch existing marks when class + exam + subjects/mode changes, or after save (refreshKey)
  useEffect(() => {
    if (!selectedClass || !examType) return;
    if (mode === 'single' && !singleSubject) return;
    if (mode === 'multi' && selectedSubjects.length === 0) return;

    const fetchMarks = async () => {
      setLoading(true);
      try {
        const res = await getMarksForClass(selectedClass, examType, null);
        const data = res.data;

        setStudents(data.students || []);
        setIsUpdate(data.isUpdate || false);

        const activeSubjs = mode === 'single'
          ? [singleSubject]
          : mode === 'multi'
          ? selectedSubjects
          : (data.subjects?.length > 0 ? data.subjects : subjects);
        const md = {};
        const mm = { ...maxMarks };

        (data.students || []).forEach(s => {
          md[s.student_id] = {};
          activeSubjs.forEach(subj => {
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
  }, [selectedClass, examType, singleSubject, selectedSubjects, mode, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const subjs = mode === 'single' ? [singleSubject] : selectedSubjects;
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
    setSingleSubject(histSubject);
  };

  const activeSubjects = mode === 'single' ? [singleSubject] : selectedSubjects;

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
            type="button"
            onClick={() => setMode(m => m === 'single' ? 'multi' : 'single')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans hover:bg-gray-50 bg-white"
          >
            <span className={`w-8 h-4 rounded-full flex items-center transition-colors ${mode === 'multi' ? 'bg-[#5B3A8C] justify-end' : 'bg-gray-300 justify-start'}`}>
              <span className="w-3 h-3 bg-white rounded-full mx-0.5 shadow-sm" />
            </span>
            {mode === 'single' ? 'Single Subject' : 'Multi Subject'}
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 font-dm-sans">
            {mode === 'single' ? 'Subject' : 'Subjects'}
          </label>
          {mode === 'single' ? (
            <SubjectCombobox
              subjects={subjects}
              value={singleSubject}
              onChange={setSingleSubject}
            />
          ) : (
            <SubjectMultiSelect
              subjects={subjects}
              selected={selectedSubjects}
              onChange={setSelectedSubjects}
            />
          )}
        </div>
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
        /* ── SINGLE SUBJECT — vertical layout with remark column ── */
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
                const subj = singleSubject;
                const data = marksData[student.student_id]?.[subj] || {};
                return (
                  <tr key={student.student_id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-2.5 text-sm text-gray-500 font-dm-sans">{student.roll_number}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800 font-dm-sans">{student.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="number"
                        value={data.is_absent ? '' : (data.marks_obtained ?? '')}
                        onChange={(e) => handleMarkChange(student.student_id, subj, 'marks_obtained', e.target.value)}
                        disabled={data.is_absent} max={maxMarks[subj] || 100} min={0} placeholder="0"
                        className={`w-20 px-2 py-1.5 border rounded-lg text-sm text-center font-dm-sans focus:ring-2 focus:ring-[#5B3A8C]/20 ${data.is_absent ? 'bg-gray-100 text-gray-400 border-gray-200' : 'border-gray-200'}`}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="checkbox" checked={data.is_absent || false}
                        onChange={(e) => handleMarkChange(student.student_id, subj, 'is_absent', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="text" value={data.remark || ''}
                        onChange={(e) => handleMarkChange(student.student_id, subj, 'remark', e.target.value)}
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
        /* ── MULTI-SUBJECT TABLE (all or multiple selected) ── */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F0EBF7]">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-10 sticky left-0 bg-[#F0EBF7]">Roll</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#5B3A8C] uppercase font-outfit w-36 sticky left-10 bg-[#F0EBF7]">Student</th>
                  {activeSubjects.map(subj => (
                    <th key={subj} className="px-2 py-3 text-center text-xs font-semibold text-[#5B3A8C] uppercase font-outfit min-w-[110px]">
                      {subj}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.student_id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-3 py-2 text-sm text-gray-500 font-dm-sans sticky left-0 bg-inherit">{student.roll_number}</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-800 font-dm-sans sticky left-10 bg-inherit">{student.name}</td>
                    {activeSubjects.map(subj => {
                      const data = marksData[student.student_id]?.[subj] || {};
                      return (
                        <td key={subj} className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input type="number"
                              value={data.is_absent ? '' : (data.marks_obtained ?? '')}
                              onChange={(e) => handleMarkChange(student.student_id, subj, 'marks_obtained', e.target.value)}
                              disabled={data.is_absent} max={maxMarks[subj] || 100} min={0} placeholder="0"
                              className={`w-16 px-1 py-1 border rounded text-sm text-center font-dm-sans ${data.is_absent ? 'bg-gray-100 text-gray-400 border-gray-200' : 'border-gray-200 focus:ring-1 focus:ring-[#5B3A8C]/20'}`}
                            />
                            <input type="checkbox" checked={data.is_absent || false}
                              onChange={(e) => handleMarkChange(student.student_id, subj, 'is_absent', e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-red-500" title="Absent"
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
