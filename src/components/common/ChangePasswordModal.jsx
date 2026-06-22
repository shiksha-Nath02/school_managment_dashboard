import { useState } from 'react';
import { X, KeyRound, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';

export default function ChangePasswordModal({ open, onClose, btnClass = 'bg-brand-500 hover:bg-brand-600' }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const reset = () => {
    setForm({ current: '', next: '', confirm: '' });
    setShow({ current: false, next: false, confirm: false });
    setError('');
    setSuccess(false);
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.current || !form.next || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.next.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (form.current === form.next) {
      setError('New password must be different from the current one.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(form.current, form.next);
      setSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
      setSaving(false);
    }
  };

  const field = (label, key, placeholder) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show[key] ? 'text' : 'password'}
          value={form[key]}
          placeholder={placeholder}
          autoComplete={key === 'current' ? 'current-password' : 'new-password'}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((prev) => ({ ...prev, [key]: !prev[key] }))}
          aria-label={show[key] ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {show[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 font-display flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gray-500" />
            Change Password
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-sm font-medium text-gray-700">Password changed successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('Current Password', 'current', 'Enter current password')}
            {field('New Password', 'next', 'At least 6 characters')}
            {field('Confirm New Password', 'confirm', 'Re-enter new password')}

            {error && (
              <div className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${btnClass}`}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving…' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
