import { useState, useEffect } from 'react';
import api from '@/services/api';

const formatDOB = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading your profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-7 text-center text-gray-400 text-sm">
        {error || 'Profile not found.'}
      </div>
    );
  }

  const { personal, stats } = profile;

  const statCards = [
    {
      icon: '🎓',
      val: personal.class || '—',
      label: 'Class & Section',
      bg: 'bg-student-50 text-student-500',
    },
    {
      icon: '📊',
      val: stats.attendance_percentage != null ? `${stats.attendance_percentage}%` : '—',
      label: 'Attendance',
      bg: 'bg-gold-light text-gold',
    },
    {
      icon: '📝',
      val: stats.last_exam_percentage != null ? `${stats.last_exam_percentage}%` : '—',
      label: 'Last Exam',
      bg: 'bg-brand-50 text-brand-500',
    },
    {
      icon: '💰',
      val: `₹${Number(stats.fee_dues || 0).toLocaleString('en-IN')}`,
      label: 'Fee Dues',
      bg: 'bg-green-50 text-green-600',
    },
  ];

  const infoRows = [
    ['Full Name', personal.name || '—'],
    ['Roll Number', personal.roll_number ?? '—'],
    ['Class', personal.class || '—'],
    ['Date of Birth', formatDOB(personal.date_of_birth)],
    ['Parent/Guardian', personal.guardian_name || '—'],
    ['Contact', personal.contact || '—'],
    ['Address', personal.address || '—'],
  ];

  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">My Profile</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200/80 rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-soft transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 ${s.bg}`}>
              {s.icon}
            </div>
            <h3 className="font-display text-2xl font-bold">{s.val}</h3>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info Table */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-7">
        <h3 className="font-display font-bold text-base mb-5">Personal Information</h3>
        <div className="divide-y divide-gray-100">
          {infoRows.map(([key, val]) => (
            <div key={key} className="flex py-3.5 text-sm">
              <span className="w-44 text-gray-400 flex-shrink-0">{key}</span>
              <span className="font-medium text-gray-800">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
