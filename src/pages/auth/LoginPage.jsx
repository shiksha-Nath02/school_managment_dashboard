import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/common/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, loading, error: authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!userId.trim() || !password.trim()) {
      setLocalError('Please enter your username and password');
      return;
    }

    try {
      // Single login for all roles — the server returns the role and we
      // redirect accordingly. Username = admission number / teacher ID.
      const user = await login(userId.trim(), password);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      // error is set in AuthContext
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-52 -right-52 w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-52 -left-52 w-[500px] h-[500px] rounded-full bg-teacher-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8 animate-fade-in"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Login card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-10 shadow-elevated animate-fade-up animate-start">
          {/* Header */}
          <div className="mb-1">
            <Logo size="small" />
          </div>
          <h2 className="font-display text-2xl font-bold mt-6 mb-1.5">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-7">Sign in to your portal</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {displayError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg animate-fade-in">
                {displayError}
              </div>
            )}

            {/* Username (admission number for students, teacher ID for teachers) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Admission number / Teacher ID"
                autoComplete="username"
                className="w-full px-4 py-3 bg-surface-bg border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-surface-bg border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                Remember me
              </label>
              <a href="#" className="text-brand-500 font-medium hover:text-brand-600 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-card disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer bg-brand-500 hover:bg-brand-600"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-300 mt-6">
            Contact your administrator for account access
          </p>
        </div>
      </div>
    </div>
  );
}
