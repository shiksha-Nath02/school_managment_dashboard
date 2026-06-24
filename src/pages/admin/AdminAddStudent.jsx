import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Loader2, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff, Upload,
} from 'lucide-react';
import studentService from '../../services/studentService';
import CsvUploadModal from '../../components/common/CsvUploadModal';

const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CATEGORIES    = ['General', 'OBC', 'SC', 'ST', 'EWS'];

const EMPTY_FORM = {
  // account
  name: '', username: '', email: '', phone: '', password: '',
  // academic
  class_id: '', roll_number: '',
  admission_date: new Date().toISOString().split('T')[0],
  // personal
  date_of_birth: '', blood_group: '', aadhaar_number: '',
  category: '', religion: '', nationality: 'Indian',
  // address
  address: '', city: '', state: '', pincode: '',
  // father
  father_name: '', father_phone: '', father_aadhaar: '',
  // mother
  mother_name: '', mother_phone: '', mother_aadhaar: '',
  // documents
  parents_pan: '', birth_certificate_number: '', ews_certificate_number: '',
};

const CSV_COLUMNS = [
  { key: 'name',           label: 'Name',           required: true,  example: 'Rahul Sharma' },
  { key: 'username',       label: 'Admission No',   required: true,  example: '1524' },
  { key: 'email',          label: 'Email',          required: true,  example: 'rahul@school.com' },
  { key: 'phone',          label: 'Phone',                           example: '9876543210' },
  { key: 'class_name',     label: 'Class',          required: true,  example: '6' },
  { key: 'section',        label: 'Section',        required: true,  example: 'A' },
  { key: 'roll_number',    label: 'Roll Number',    required: true,  example: '12' },
  { key: 'date_of_birth',  label: 'Date of Birth',                   example: '2012-03-15' },
  { key: 'blood_group',    label: 'Blood Group',                     example: 'B+' },
  { key: 'category',       label: 'Category',                        example: 'General' },
  { key: 'religion',       label: 'Religion',                        example: 'Hindu' },
  { key: 'nationality',    label: 'Nationality',                     example: 'Indian' },
  { key: 'aadhaar_number', label: 'Aadhaar No',                      example: '123456789012' },
  { key: 'address',        label: 'Address',                         example: '123 Main St' },
  { key: 'city',           label: 'City',                            example: 'Delhi' },
  { key: 'state',          label: 'State',                           example: 'Delhi' },
  { key: 'pincode',        label: 'Pincode',                         example: '110001' },
  { key: 'father_name',    label: "Father's Name",                   example: 'Suresh Sharma' },
  { key: 'father_phone',   label: "Father's Phone",                  example: '9876543210' },
  { key: 'mother_name',    label: "Mother's Name",                   example: 'Sunita Sharma' },
  { key: 'mother_phone',   label: "Mother's Phone",                  example: '9876543211' },
  { key: 'parents_pan',    label: "Parents' PAN",                    example: 'ABCDE1234F' },
  { key: 'admission_date', label: 'Admission Date',                  example: new Date().toISOString().split('T')[0] },
  { key: 'password',       label: 'Password',                        example: '' },
];

export default function AdminAddStudent() {
  const navigate = useNavigate();
  const [classes, setClasses]               = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [loading, setLoading]               = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [success, setSuccess]               = useState(null);
  const [error, setError]                   = useState(null);
  const [csvOpen, setCsvOpen]               = useState(false);
  const [form, setForm]                     = useState(EMPTY_FORM);

  useEffect(() => {
    studentService.getClasses()
      .then((d) => setClasses(d.classes || []))
      .catch(console.error)
      .finally(() => setClassesLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim())     return 'Student name is required';
    if (!form.username.trim()) return 'Admission number (login ID) is required';
    if (!form.email.trim())   return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email';
    if (!form.class_id)       return 'Please select a class';
    if (!form.roll_number)    return 'Roll number is required';
    if (form.roll_number < 1) return 'Roll number must be positive';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        class_id:    parseInt(form.class_id),
        roll_number: parseInt(form.roll_number),
        password:    form.password || undefined,
      };
      const data = await studentService.addStudent(payload);
      setSuccess(`${data.student.user.name} added successfully! (Adm No: ${data.student.id})`);
      setForm({ ...EMPTY_FORM, admission_date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvRow = async (row) => {
    const cls = classes.find(
      (c) => String(c.class_name) === String(row.class_name).trim() &&
             c.section.toLowerCase() === (row.section || '').trim().toLowerCase()
    );
    if (!cls) throw new Error(`Class ${row.class_name}-${row.section} not found`);
    await studentService.addStudent({
      name: row.name, username: row.username, email: row.email,
      phone: row.phone || undefined,
      password: row.password || undefined,
      class_id: cls.id,
      roll_number: parseInt(row.roll_number),
      date_of_birth: row.date_of_birth || undefined,
      blood_group: row.blood_group || undefined,
      category: row.category || undefined,
      religion: row.religion || undefined,
      nationality: row.nationality || undefined,
      aadhaar_number: row.aadhaar_number || undefined,
      address: row.address || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      pincode: row.pincode || undefined,
      father_name: row.father_name || undefined,
      father_phone: row.father_phone || undefined,
      mother_name: row.mother_name || undefined,
      mother_phone: row.mother_phone || undefined,
      parents_pan: row.parents_pan || undefined,
      admission_date: row.admission_date || undefined,
    });
  };

  const inputCls = 'w-full px-4 py-3 bg-surface-bg border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="animate-fade-up animate-start">
      <CsvUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Bulk Add Students"
        columns={CSV_COLUMNS}
        templateName="students_template.csv"
        onUploadRow={handleCsvRow}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Add new student</h1>
          <p className="text-sm text-gray-400 mt-1">Fill in the details to register a student. A login account will be created automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCsvOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-500 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl transition-all">
            <Upload size={15} /> Upload CSV
          </button>
          <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={16} /> View all students
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm px-5 py-3.5 rounded-xl mb-6">
          <CheckCircle size={18} />
          <span className="font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-600 text-xs">Dismiss</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-3.5 rounded-xl mb-6">
          <AlertCircle size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Academic details ── */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5 text-gray-900">Academic details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Admission number <span className="text-red-400">*</span></label>
              <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="e.g. 1524 — student's login ID" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Class <span className="text-red-400">*</span></label>
              <select name="class_id" value={form.class_id} onChange={handleChange} className={inputCls} disabled={classesLoading}>
                <option value="">{classesLoading ? 'Loading…' : 'Select class'}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name} - {c.section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Roll number <span className="text-red-400">*</span></label>
              <input type="number" name="roll_number" value={form.roll_number} onChange={handleChange} placeholder="e.g. 14" min="1" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Admission date</label>
              <input type="date" name="admission_date" value={form.admission_date} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Personal information ── */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5 flex items-center gap-2 text-gray-900">
            <UserPlus size={18} className="text-brand-500" /> Personal information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full name <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email <span className="text-red-400">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. rahul@school.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date of birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Aadhaar number</label>
              <input type="text" name="aadhaar_number" value={form.aadhaar_number} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Blood group</label>
              <select name="blood_group" value={form.blood_group} onChange={handleChange} className={inputCls}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Religion</label>
              <input type="text" name="religion" value={form.religion} onChange={handleChange} placeholder="e.g. Hindu" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nationality</label>
              <input type="text" name="nationality" value={form.nationality} onChange={handleChange} placeholder="Indian" className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Address ── */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5 text-gray-900">Address</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Street address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House no, street, locality…" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Delhi" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="e.g. Delhi" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="e.g. 110001" maxLength={10} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Parents' details ── */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5 text-gray-900">Parents' details</h3>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Father */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Father</p>
              <div>
                <label className={labelCls}>Father's name</label>
                <input type="text" name="father_name" value={form.father_name} onChange={handleChange} placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Father's phone</label>
                <input type="text" name="father_phone" value={form.father_phone} onChange={handleChange} placeholder="9876543210" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Father's Aadhaar</label>
                <input type="text" name="father_aadhaar" value={form.father_aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} className={inputCls} />
              </div>
            </div>
            {/* Mother */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Mother</p>
              <div>
                <label className={labelCls}>Mother's name</label>
                <input type="text" name="mother_name" value={form.mother_name} onChange={handleChange} placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mother's phone</label>
                <input type="text" name="mother_phone" value={form.mother_phone} onChange={handleChange} placeholder="9876543210" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mother's Aadhaar</label>
                <input type="text" name="mother_aadhaar" value={form.mother_aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} className={inputCls} />
              </div>
            </div>
            {/* Shared */}
            <div className="md:col-span-2">
              <label className={labelCls}>Parents' PAN number</label>
              <input type="text" name="parents_pan" value={form.parents_pan} onChange={handleChange} placeholder="e.g. ABCDE1234F" maxLength={10} className={`${inputCls} max-w-xs`} />
            </div>
          </div>
        </div>

        {/* ── Document numbers ── */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-1 text-gray-900">Document / certificate numbers</h3>
          <p className="text-xs text-gray-400 mb-5">File uploads (Aadhaar scan, certificates) will be available after S3 integration.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Birth certificate number</label>
              <input type="text" name="birth_certificate_number" value={form.birth_certificate_number} onChange={handleChange} placeholder="Certificate number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>EWS / Category certificate number</label>
              <input type="text" name="ews_certificate_number" value={form.ews_certificate_number} onChange={handleChange} placeholder="Certificate number" className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Login credentials ── */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-2 text-gray-900">Login credentials</h3>
          <p className="text-xs text-gray-400 mb-5">
            Leave password empty to use the default: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">student123</code>
          </p>
          <div className="max-w-sm">
            <label className={labelCls}>Password (optional)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave empty for default"
                className={`${inputCls} pr-11`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="bg-brand-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:-translate-y-0.5 hover:shadow-card transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Adding student…</> : <><UserPlus size={18} /> Add student</>}
          </button>
          <button type="button" onClick={() => setForm({ ...EMPTY_FORM, admission_date: new Date().toISOString().split('T')[0] })} className="text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}
