import { useState, useEffect } from 'react';
import { getSessions, getActiveSession, createSession, updateSessionFees, promoteStudents } from '@/services/feeService';
import { Settings2, Plus, ChevronDown, ChevronUp, Users, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const AdminSessionSetup = () => {
  const [sessions, setSessions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Create form state
  const [form, setForm] = useState({
    name: '',
    start_month: 4,
    start_year: new Date().getFullYear(),
    excluded_months: [],
    fine_enabled: false,
    fine_per_day: 5,
    grace_period_days: 10,
    fee_mode: 'default', // 'default' | 'copy' | 'individual'
    default_monthly_fee: '',
    copy_from_session_id: '',
    fee_increase_percent: 0
  });

  // Students for individual fee setup
  const [students, setStudents] = useState([]);
  const [studentFees, setStudentFees] = useState({});
  const [classes, setClasses] = useState([]);

  // Promotion state
  const [promotions, setPromotions] = useState([]);

  // Step tracking
  const [step, setStep] = useState(1); // 1: Basic, 2: Fees, 3: Promotion, 4: Review

  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
    setLoading(false);
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/admin/classes');
      setClasses(res.data.classes || res.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      const studentList = res.data.students || res.data || [];
      setStudents(studentList);
      const feeMap = {};
      studentList.forEach(s => {
        feeMap[s.id] = { monthly_fee: '', discount: 0, discount_reason: '' };
      });
      setStudentFees(feeMap);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const toggleExcludedMonth = (month) => {
    setForm(prev => ({
      ...prev,
      excluded_months: prev.excluded_months.includes(month)
        ? prev.excluded_months.filter(m => m !== month)
        : [...prev.excluded_months, month]
    }));
  };

  const handleStudentFeeChange = (studentId, field, value) => {
    setStudentFees(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        start_month: parseInt(form.start_month),
        start_year: parseInt(form.start_year),
        excluded_months: form.excluded_months,
        fine_enabled: form.fine_enabled,
        fine_per_day: form.fine_enabled ? parseFloat(form.fine_per_day) : 0,
        grace_period_days: form.fine_enabled ? parseInt(form.grace_period_days) : 10
      };

      if (form.fee_mode === 'default') {
        payload.default_monthly_fee = parseFloat(form.default_monthly_fee);
      } else if (form.fee_mode === 'copy') {
        payload.copy_from_session_id = parseInt(form.copy_from_session_id);
        payload.fee_increase_percent = parseFloat(form.fee_increase_percent);
      } else if (form.fee_mode === 'individual') {
        payload.student_fees = Object.entries(studentFees)
          .filter(([_, v]) => v.monthly_fee && parseFloat(v.monthly_fee) > 0)
          .map(([studentId, v]) => ({
            student_id: parseInt(studentId),
            monthly_fee: parseFloat(v.monthly_fee),
            discount: parseFloat(v.discount) || 0,
            discount_reason: v.discount_reason || null
          }));
      }

      const res = await createSession(payload);

      if (promotions.length > 0 && res.data.session) {
        await promoteStudents(res.data.session.id, promotions);
      }

      showToast('success', 'Session created successfully!');
      setShowCreateForm(false);
      setStep(1);
      fetchSessions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create session');
    }
    setSaving(false);
  };

  const getClassById = (id) => classes.find(c => c.id === id);
  const getNextClass = (classId) => {
    const cls = getClassById(classId);
    if (!cls) return null;
    const nextClassName = String(parseInt(cls.class_name) + 1);
    return classes.find(c => c.class_name === nextClassName && c.section === cls.section);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-brand-500" />
            Session Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Create academic sessions, set fees, and promote students
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-gray-100 px-6 py-4">
            {['Basic Info', 'Fee Setup', 'Promotion', 'Review'].map((label, i) => (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => setStep(i + 1)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    step === i + 1
                      ? 'bg-brand-500 text-white'
                      : step > i + 1
                        ? 'bg-brand-50 text-brand-500'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  {label}
                </button>
                {i < 3 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>

          <div className="p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-800 font-display">Session Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Session Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. 2026-27"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Month</label>
                    <select
                      value={form.start_month}
                      onChange={(e) => setForm(prev => ({ ...prev, start_month: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    >
                      {MONTH_NAMES.slice(1).map((name, i) => (
                        <option key={i + 1} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Year</label>
                    <input
                      type="number"
                      value={form.start_year}
                      onChange={(e) => setForm(prev => ({ ...prev, start_year: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                {/* Excluded Months */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Vacation Months <span className="text-gray-400 font-normal">(excluded from billing)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MONTH_NAMES.slice(1).map((name, i) => {
                      const month = i + 1;
                      const isExcluded = form.excluded_months.includes(month);
                      return (
                        <button
                          key={month}
                          onClick={() => toggleExcludedMonth(month)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isExcluded
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {name.slice(0, 3)} {isExcluded && '✕'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fine Settings */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 font-display">Late Payment Fine</label>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, fine_enabled: !prev.fine_enabled }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.fine_enabled ? 'bg-brand-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                        style={{ transform: form.fine_enabled ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>
                  {form.fine_enabled && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fine per Day (₹)</label>
                        <input
                          type="number"
                          value={form.fine_per_day}
                          onChange={(e) => setForm(prev => ({ ...prev, fine_per_day: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Grace Period (days)</label>
                        <input
                          type="number"
                          value={form.grace_period_days}
                          onChange={(e) => setForm(prev => ({ ...prev, grace_period_days: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
                  >
                    Next: Fee Setup →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Fee Setup */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-800 font-display">Fee Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'default', label: 'Same for All', desc: 'Set one fee amount for every student' },
                    { key: 'copy', label: 'Copy & Increase', desc: 'Copy from previous session with % increase' },
                    { key: 'individual', label: 'Set Individually', desc: 'Different fee per student' }
                  ].map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => setForm(prev => ({ ...prev, fee_mode: mode.key }))}
                      className={`p-4 rounded-xl text-left border-2 transition-colors ${
                        form.fee_mode === mode.key
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-800 font-display">{mode.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{mode.desc}</div>
                    </button>
                  ))}
                </div>

                {form.fee_mode === 'default' && (
                  <div className="max-w-xs">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Fee (₹) for all students</label>
                    <input
                      type="number"
                      value={form.default_monthly_fee}
                      onChange={(e) => setForm(prev => ({ ...prev, default_monthly_fee: e.target.value }))}
                      placeholder="e.g. 2000"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    />
                  </div>
                )}

                {form.fee_mode === 'copy' && (
                  <div className="grid grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Copy from Session</label>
                      <select
                        value={form.copy_from_session_id}
                        onChange={(e) => setForm(prev => ({ ...prev, copy_from_session_id: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                      >
                        <option value="">Select session...</option>
                        {sessions.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Fee Increase (%)</label>
                      <input
                        type="number"
                        value={form.fee_increase_percent}
                        onChange={(e) => setForm(prev => ({ ...prev, fee_increase_percent: e.target.value }))}
                        placeholder="e.g. 10"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {form.fee_mode === 'individual' && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-brand-50 sticky top-0">
                          <tr>
                            {['Student', 'Class', 'Monthly Fee (₹)', 'Discount (₹)', 'Reason'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student, i) => {
                            const cls = getClassById(student.class_id);
                            const fee = studentFees[student.id] || {};
                            return (
                              <tr key={student.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="px-4 py-2 text-sm text-gray-800">
                                  {student.user?.name || `Student ${student.id}`}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {cls ? `${cls.class_name}-${cls.section}` : '-'}
                                </td>
                                <td className="px-4 py-2">
                                  <input type="number" value={fee.monthly_fee || ''} placeholder="0"
                                    onChange={(e) => handleStudentFeeChange(student.id, 'monthly_fee', e.target.value)}
                                    className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                  <input type="number" value={fee.discount || ''} placeholder="0"
                                    onChange={(e) => handleStudentFeeChange(student.id, 'discount', e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
                                </td>
                                <td className="px-4 py-2">
                                  <input type="text" value={fee.discount_reason || ''} placeholder="e.g. Sibling"
                                    onChange={(e) => handleStudentFeeChange(student.id, 'discount_reason', e.target.value)}
                                    className="w-32 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
                    Next: Promotion →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Promotion */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 font-display">Student Promotion</h2>
                  <button
                    onClick={() => {
                      const auto = students
                        .filter(s => s.status !== 'inactive')
                        .map(s => {
                          const next = getNextClass(s.class_id);
                          return next ? { student_id: s.id, new_class_id: next.id } : null;
                        })
                        .filter(Boolean);
                      setPromotions(auto);
                    }}
                    className="text-sm text-brand-500 font-medium hover:underline"
                  >
                    Auto-promote all →
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Select which students to promote to the next class. Skip if promotions aren't needed yet.
                </p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-brand-50 sticky top-0">
                        <tr>
                          {['Student', 'Current Class', '', 'Promote To'].map((h, i) => (
                            <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.status !== 'inactive').map((student, i) => {
                          const currentClass = getClassById(student.class_id);
                          const promo = promotions.find(p => p.student_id === student.id);
                          return (
                            <tr key={student.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                              <td className="px-4 py-2 text-sm text-gray-800">
                                {student.user?.name || `Student ${student.id}`}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {currentClass ? `${currentClass.class_name}-${currentClass.section}` : '-'}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <ArrowRight className="w-4 h-4 text-gray-300 mx-auto" />
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  value={promo?.new_class_id || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                      setPromotions(prev => [
                                        ...prev.filter(p => p.student_id !== student.id),
                                        { student_id: student.id, new_class_id: parseInt(val) }
                                      ]);
                                    } else {
                                      setPromotions(prev => prev.filter(p => p.student_id !== student.id));
                                    }
                                  }}
                                  className="w-40 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500/20 outline-none"
                                >
                                  <option value="">No change</option>
                                  {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.class_name}-{cls.section}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
                    Next: Review →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-800 font-display">Review & Confirm</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 font-display mb-2">Session</h3>
                    <p className="text-sm"><strong>{form.name}</strong> — {MONTH_NAMES[form.start_month]} {form.start_year}</p>
                    {form.excluded_months.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Vacation: {form.excluded_months.map(m => MONTH_NAMES[m].slice(0, 3)).join(', ')}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 font-display mb-2">Fine</h3>
                    {form.fine_enabled ? (
                      <p className="text-sm">₹{form.fine_per_day}/day after {form.grace_period_days} days grace</p>
                    ) : (
                      <p className="text-sm text-gray-400">Disabled</p>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 font-display mb-2">Fee Mode</h3>
                    <p className="text-sm">
                      {form.fee_mode === 'default' && `Same for all: ₹${form.default_monthly_fee}/month`}
                      {form.fee_mode === 'copy' && `Copied from previous + ${form.fee_increase_percent}% increase`}
                      {form.fee_mode === 'individual' && `Individual fees for ${Object.values(studentFees).filter(f => f.monthly_fee).length} students`}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 font-display mb-2">Promotions</h3>
                    <p className="text-sm">{promotions.length} students will be promoted</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    ← Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowCreateForm(false); setStep(1); }}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/20"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {saving ? 'Creating...' : 'Create Session'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 font-display">All Sessions</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No sessions yet. Click "New Session" to start.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map(session => (
              <div key={session.id} className={`px-6 py-4 flex items-center justify-between ${session.is_active ? 'bg-brand-50/40' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 font-display">{session.name}</span>
                    {session.is_active && (
                      <span className="px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {MONTH_NAMES[session.start_month]} {session.start_year}
                    {session.end_month ? ` — ${MONTH_NAMES[session.end_month]} ${session.end_year}` : ''}
                    {session.excluded_months?.length > 0 && ` · Vacation: ${session.excluded_months.map(m => MONTH_NAMES[m]?.slice(0, 3)).join(', ')}`}
                    {session.fine_enabled && ` · Fine: ₹${session.fine_per_day}/day`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSessionSetup;
