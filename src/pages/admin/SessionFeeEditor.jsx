import { useState, useEffect } from 'react';
import { getSessionById, updateSessionFees } from '@/services/feeService';
import api from '@/services/api';
import { Check, Loader2, ArrowLeft, Save, RefreshCw, Users } from 'lucide-react';

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Per-class fee editor for a single session. Each class is saved to the DB on
 * its own ("Save this class") — so a refresh never loses work, and two teachers
 * can split the classes and see each other's saved work after a Reload.
 *
 * Props:
 *   session   — the session object (needs at least { id, name, start_month, start_year })
 *   onClose   — called when the user clicks Back
 *   onSaved   — optional; called after any class is saved (e.g. to refresh a parent list)
 */
const SessionFeeEditor = ({ session, onClose, onSaved }) => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState({});            // studentId -> { monthly_fee, discount, discount_reason }
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [classTab, setClassTab] = useState(null);
  const [savingClassId, setSavingClassId] = useState(null);
  const [savedClasses, setSavedClasses] = useState(new Set());   // classIds fully persisted (from server)
  const [dirtyClasses, setDirtyClasses] = useState(new Set());   // classIds with unsaved edits
  const [bulkFee, setBulkFee] = useState({ monthly_fee: '', discount: '', discount_reason: '' });
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const buildSavedSet = (classList, studentList, savedRows) => {
    const savedIds = new Set(
      savedRows.filter(sf => parseFloat(sf.monthly_fee) > 0).map(sf => sf.student_id)
    );
    const set = new Set();
    classList.forEach(c => {
      const cs = studentList.filter(s => s.class_id === c.id);
      if (cs.length > 0 && cs.every(s => savedIds.has(s.id))) set.add(c.id);
    });
    return set;
  };

  const applyServerFees = (studentList, savedRows) => {
    const feeMap = {};
    studentList.forEach(s => {
      feeMap[s.id] = { monthly_fee: '', discount: 0, discount_reason: '' };
    });
    savedRows.forEach(sf => {
      feeMap[sf.student_id] = {
        monthly_fee: sf.monthly_fee != null ? String(sf.monthly_fee) : '',
        discount: sf.discount != null ? String(sf.discount) : 0,
        discount_reason: sf.discount_reason || '',
      };
    });
    return feeMap;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [clsRes, stuRes, sessRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/students'),
        getSessionById(session.id),
      ]);
      const classList = clsRes.data.classes || clsRes.data || [];
      const studentList = stuRes.data.students || stuRes.data || [];
      const savedRows = sessRes.data.session?.studentFees || [];

      setClasses(classList);
      setStudents(studentList);
      setFees(applyServerFees(studentList, savedRows));
      setSavedClasses(buildSavedSet(classList, studentList, savedRows));
      setDirtyClasses(new Set());
    } catch (err) {
      console.error('Error loading session fees:', err);
      showToast('error', 'Failed to load session fees');
    }
    setLoading(false);
  };

  // Reload from server — pulls in classes another teacher just saved, without
  // clobbering the class you're actively editing.
  const reloadFromServer = async () => {
    setReloading(true);
    try {
      const [stuRes, sessRes] = await Promise.all([
        api.get('/admin/students'),
        getSessionById(session.id),
      ]);
      const studentList = stuRes.data.students || stuRes.data || [];
      const savedRows = sessRes.data.session?.studentFees || [];
      const serverFees = applyServerFees(studentList, savedRows);

      // Preserve unsaved edits: keep local values for students in dirty classes.
      setFees(prev => {
        const merged = { ...serverFees };
        studentList.forEach(s => {
          if (dirtyClasses.has(s.class_id) && prev[s.id]) merged[s.id] = prev[s.id];
        });
        return merged;
      });
      setStudents(studentList);
      setSavedClasses(buildSavedSet(classes, studentList, savedRows));
      showToast('success', 'Reloaded — saved classes are up to date');
    } catch (err) {
      console.error('Error reloading:', err);
      showToast('error', 'Failed to reload');
    }
    setReloading(false);
  };

  // ----- helpers -----
  const getClassById = (id) => classes.find(c => c.id === id);

  const orderedClasses = (() => {
    const ids = [...new Set(students.map(s => s.class_id))];
    return ids
      .map(id => getClassById(id))
      .filter(Boolean)
      .sort((a, b) =>
        (parseInt(a.class_name) - parseInt(b.class_name)) || a.section.localeCompare(b.section)
      );
  })();

  useEffect(() => {
    if (classTab == null && orderedClasses.length) setClassTab(orderedClasses[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, classes]);

  const classStatus = (classId) => {
    const cs = students.filter(s => s.class_id === classId);
    const done = cs.filter(s => parseFloat(fees[s.id]?.monthly_fee) > 0).length;
    const dirty = dirtyClasses.has(classId);
    const complete = cs.length > 0 && done === cs.length;
    const saved = savedClasses.has(classId) && !dirty;
    return { done, total: cs.length, complete, dirty, saved };
  };

  const handleFeeChange = (studentId, classId, field, value) => {
    setFees(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
    setDirtyClasses(prev => new Set(prev).add(classId));
  };

  const applyFeeToClass = (classId) => {
    if (!(parseFloat(bulkFee.monthly_fee) > 0)) return;
    setFees(prev => {
      const next = { ...prev };
      students.filter(s => s.class_id === classId).forEach(s => {
        next[s.id] = {
          monthly_fee: bulkFee.monthly_fee,
          discount: bulkFee.discount || 0,
          discount_reason: bulkFee.discount_reason || '',
        };
      });
      return next;
    });
    setDirtyClasses(prev => new Set(prev).add(classId));
  };

  const saveClass = async (classId) => {
    const cs = students.filter(s => s.class_id === classId);
    const student_fees = cs
      .filter(s => parseFloat(fees[s.id]?.monthly_fee) > 0)
      .map(s => ({
        student_id: s.id,
        monthly_fee: parseFloat(fees[s.id].monthly_fee),
        discount: parseFloat(fees[s.id].discount) || 0,
        discount_reason: fees[s.id].discount_reason || null,
      }));

    if (student_fees.length === 0) {
      showToast('error', 'Enter at least one fee in this class before saving');
      return;
    }

    const cls = getClassById(classId);
    const label = cls ? `${cls.class_name}-${cls.section}` : 'class';
    setSavingClassId(classId);
    try {
      await updateSessionFees(session.id, { student_fees });
      // Mark persisted; green only shows when every student in the class is filled.
      setDirtyClasses(prev => { const n = new Set(prev); n.delete(classId); return n; });
      const complete = cs.length > 0 && student_fees.length === cs.length;
      setSavedClasses(prev => {
        const n = new Set(prev);
        if (complete) n.add(classId); else n.delete(classId);
        return n;
      });
      showToast('success', `Saved ${label} — ${student_fees.length}/${cs.length} students`);
      if (onSaved) onSaved();
    } catch (err) {
      showToast('error', err.response?.data?.message || `Failed to save ${label}`);
    }
    setSavingClassId(null);
  };

  const totalSaved = savedClasses.size;
  const totalClasses = orderedClasses.length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Back to sessions"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 font-display">
              Edit Fees — {session.name}
            </h2>
            <p className="text-xs text-gray-400">
              {MONTH_NAMES[session.start_month]} {session.start_year}
              {' · '}
              {totalSaved}/{totalClasses} classes saved
            </p>
          </div>
        </div>
        <button
          onClick={reloadFromServer}
          disabled={reloading || loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title="Pull in classes another teacher just saved"
        >
          {reloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Reload
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading fees...
          </div>
        ) : orderedClasses.length === 0 ? (
          <p className="text-sm text-gray-400">No students found.</p>
        ) : (
          <>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Users className="w-4 h-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-blue-700">
                Pick a class, fill in fees, then click <strong>Save this class</strong> — it's written to the
                database right away, so nothing is lost on refresh. Two teachers can each save different classes;
                hit <strong>Reload</strong> to see the other's saved classes. A tab turns
                {' '}<span className="text-green-600 font-medium">green</span> once its whole class is saved.
              </p>
            </div>

            {/* Class tabs */}
            <div className="flex flex-wrap gap-2">
              {orderedClasses.map(c => {
                const st = classStatus(c.id);
                const active = c.id === classTab;
                return (
                  <button
                    key={c.id}
                    onClick={() => setClassTab(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5
                      ${active ? 'ring-2 ring-brand-500/40 ' : ''}
                      ${st.dirty
                        ? 'bg-amber-100 border-amber-300 text-amber-700'
                        : st.saved
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {st.saved && !st.dirty && <Check className="w-3 h-3" />}
                    {c.class_name}-{c.section}
                    <span className="text-[10px] font-medium opacity-70">{st.done}/{st.total}</span>
                    {st.dirty && <span className="text-[10px] font-bold">•unsaved</span>}
                  </button>
                );
              })}
            </div>

            {/* Apply-to-all */}
            <div className="bg-brand-50/60 border border-brand-100 rounded-xl p-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Monthly Fee (₹)</label>
                <input type="number" value={bulkFee.monthly_fee} placeholder="e.g. 2000"
                  onChange={(e) => setBulkFee(prev => ({ ...prev, monthly_fee: e.target.value }))}
                  className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Discount (₹)</label>
                <input type="number" value={bulkFee.discount} placeholder="0"
                  onChange={(e) => setBulkFee(prev => ({ ...prev, discount: e.target.value }))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Reason</label>
                <input type="text" value={bulkFee.discount_reason} placeholder="optional"
                  onChange={(e) => setBulkFee(prev => ({ ...prev, discount_reason: e.target.value }))}
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
              </div>
              <button
                type="button"
                onClick={() => applyFeeToClass(classTab)}
                disabled={!(parseFloat(bulkFee.monthly_fee) > 0)}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-40"
              >
                Apply to all in {getClassById(classTab)?.class_name}-{getClassById(classTab)?.section}
              </button>
            </div>

            {/* Student table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-brand-50 sticky top-0">
                    <tr>
                      {['Adm No', 'Student', 'Monthly Fee (₹)', 'Discount (₹)', 'Reason'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.class_id === classTab).map((student, i) => {
                      const fee = fees[student.id] || {};
                      return (
                        <tr key={student.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-4 py-2 text-sm font-mono text-xs font-semibold text-brand-600">
                            {student.admission_number ?? student.id}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {student.user?.name || `Student ${student.id}`}
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={fee.monthly_fee || ''} placeholder="0"
                              onChange={(e) => handleFeeChange(student.id, classTab, 'monthly_fee', e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={fee.discount || ''} placeholder="0"
                              onChange={(e) => handleFeeChange(student.id, classTab, 'discount', e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="text" value={fee.discount_reason || ''} placeholder="e.g. Sibling"
                              onChange={(e) => handleFeeChange(student.id, classTab, 'discount_reason', e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save this class */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {(() => {
                  const st = classStatus(classTab);
                  if (st.dirty) return 'You have unsaved changes in this class.';
                  if (st.saved) return 'This class is saved.';
                  return 'Not saved yet.';
                })()}
              </p>
              <button
                onClick={() => saveClass(classTab)}
                disabled={savingClassId === classTab}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/20"
              >
                {savingClassId === classTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingClassId === classTab ? 'Saving...' : `Save ${getClassById(classTab)?.class_name}-${getClassById(classTab)?.section}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionFeeEditor;
