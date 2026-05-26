import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff, Upload } from 'lucide-react';
import teacherService from '../../services/teacherService';
import CsvUploadModal from '../../components/common/CsvUploadModal';

const CSV_COLUMNS = [
  { key: 'name',         label: 'Name',         required: true, example: 'Priya Sharma' },
  { key: 'email',        label: 'Email',        required: true, example: 'priya@school.com' },
  { key: 'phone',        label: 'Phone',                        example: '9876500001' },
  { key: 'subject',      label: 'Subject',                      example: 'Mathematics' },
  { key: 'salary',       label: 'Salary',                       example: '35000' },
  { key: 'joining_date', label: 'Joining Date',                 example: new Date().toISOString().split('T')[0] },
  { key: 'password',     label: 'Password',                     example: '' },
];

export default function AdminAddTeacher() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    subject: '',
    salary: '',
    joining_date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Teacher name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email';
    if (form.salary && isNaN(parseFloat(form.salary))) return 'Salary must be a number';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password || undefined,
        subject: form.subject || undefined,
        salary: form.salary ? parseFloat(form.salary) : undefined,
        joining_date: form.joining_date || undefined,
      };
      const data = await teacherService.addTeacher(payload);
      setSuccess(`${data.teacher.user.name} added successfully!`);
      setForm({ name: '', email: '', phone: '', password: '', subject: '', salary: '', joining_date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-surface-bg border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10';

  const handleCsvRow = async (row) => {
    await teacherService.addTeacher({
      name: row.name,
      email: row.email,
      phone: row.phone || undefined,
      subject: row.subject || undefined,
      salary: row.salary ? parseFloat(row.salary) : undefined,
      joining_date: row.joining_date || undefined,
      password: row.password || undefined,
    });
  };

  return (
    <div className="animate-fade-up animate-start">
      <CsvUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Bulk Add Teachers"
        columns={CSV_COLUMNS}
        templateName="teachers_template.csv"
        onUploadRow={handleCsvRow}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Add new teacher</h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details to register a teacher. A login account will be created automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCsvOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-brand-500 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl transition-all"
          >
            <Upload size={15} /> Upload CSV
          </button>
          <button
            onClick={() => navigate('/admin/teachers')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
            View all teachers
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
        {/* Personal Info */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-brand-500" />
            Personal information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priya Sharma" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. priya@school.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876500001" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5">Professional details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Mathematics" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly salary (₹)</label>
              <input type="number" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. 35000" min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Joining date</label>
              <input type="date" name="joining_date" value={form.joining_date} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-2">Login credentials</h3>
          <p className="text-xs text-gray-400 mb-5">
            Leave password empty to use the default: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">teacher123</code>
          </p>
          <div className="max-w-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password (optional)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave empty for default"
                className={`${inputClass} pr-11`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:-translate-y-0.5 hover:shadow-card transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Adding teacher...</> : <><UserPlus size={18} /> Add teacher</>}
          </button>
          <button
            type="button"
            onClick={() => setForm({ name: '', email: '', phone: '', password: '', subject: '', salary: '', joining_date: new Date().toISOString().split('T')[0] })}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}
