import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import studentService from '../../services/studentService';

export default function AdminAddStudent() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    class_id: '',
    roll_number: '',
    date_of_birth: '',
    address: '',
    admission_date: new Date().toISOString().split('T')[0],
  });

  // Fetch classes for dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await studentService.getClasses();
        setClasses(data.classes);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Student name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email';
    if (!form.class_id) return 'Please select a class';
    if (!form.roll_number) return 'Roll number is required';
    if (form.roll_number < 1) return 'Roll number must be positive';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        class_id: parseInt(form.class_id),
        roll_number: parseInt(form.roll_number),
        password: form.password || undefined, // let backend use default if empty
      };

      const data = await studentService.addStudent(payload);
      setSuccess(`${data.student.user.name} added successfully!`);

      // Reset form
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        class_id: '',
        roll_number: '',
        date_of_birth: '',
        address: '',
        admission_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-surface-bg border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10';

  return (
    <div className="animate-fade-up animate-start">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Add new student</h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details to register a student. A login account will be created automatically.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/students')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          View all students
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm px-5 py-3.5 rounded-xl mb-6 animate-fade-in">
          <CheckCircle size={18} />
          <span className="font-medium">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-600 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-3.5 rounded-xl mb-6 animate-fade-in">
          <AlertCircle size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-brand-500" />
            Personal information
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. rahul@school.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                placeholder="Full address"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5">Academic details</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Class <span className="text-red-400">*</span>
              </label>
              <select
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                className={inputClass}
                disabled={classesLoading}
              >
                <option value="">
                  {classesLoading ? 'Loading classes...' : 'Select class'}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.class_name} - {c.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Roll number <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="roll_number"
                value={form.roll_number}
                onChange={handleChange}
                placeholder="e.g. 14"
                min="1"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admission date</label>
              <input
                type="date"
                name="admission_date"
                value={form.admission_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Login credentials */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-2">Login credentials</h3>
          <p className="text-xs text-gray-400 mb-5">
            If you leave the password empty, the default password will be <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">student123</code>
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
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
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding student...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Add student
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setForm({
                name: '',
                email: '',
                phone: '',
                password: '',
                class_id: '',
                roll_number: '',
                date_of_birth: '',
                address: '',
                admission_date: new Date().toISOString().split('T')[0],
              })
            }
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}
