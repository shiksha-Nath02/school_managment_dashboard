import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export default function TeacherProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/teacher/profile')
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load your profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-teacher-500 animate-spin" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm py-10 justify-center">
        <AlertCircle className="w-4 h-4" /> {error || 'No profile data'}
      </div>
    );
  }

  const t = data.teacher || {};
  const u = t.user || {};
  const stats = data.stats || {};
  const classes = data.classes || [];
  const classLabel = classes.length
    ? classes.map((c) => `${c.className} ${c.section}`).join(', ')
    : 'Not assigned';

  const cards = [
    { icon: '📚', val: t.subject || '—', label: 'Subject', bg: 'bg-teacher-50 text-teacher-500' },
    { icon: '👥', val: stats.studentCount ?? 0, label: 'My Students', bg: 'bg-gold-light text-gold' },
    { icon: '📅', val: stats.classCount ?? 0, label: 'My Classes', bg: 'bg-brand-50 text-brand-500' },
    { icon: '✅', val: stats.attendancePct == null ? '—' : `${stats.attendancePct}%`, label: 'My Attendance', bg: 'bg-green-50 text-green-600' },
  ];

  const rows = [
    ['Full Name', u.name],
    ['Login ID', u.username],
    ['Class Teacher', classLabel],
    ['Subject', t.subject],
    ['Designation', t.designation],
    ['Department', t.department],
    ['Qualification', t.qualification],
    ['Contact', u.phone],
    ['Email', u.email],
    ['Blood Group', t.blood_group],
    ['Joining Date', t.joining_date ? fmtDate(t.joining_date) : null],
  ];

  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">My Profile</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200/80 rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-soft transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 ${s.bg}`}>
              {s.icon}
            </div>
            <h3 className="font-display text-2xl font-bold truncate">{s.val}</h3>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200/80 rounded-xl p-7">
        <h3 className="font-display font-bold text-base mb-5">Personal Information</h3>
        <div className="divide-y divide-gray-100">
          {rows.map(([key, val]) => (
            <div key={key} className="flex py-3.5 text-sm">
              <span className="w-44 text-gray-400 flex-shrink-0">{key}</span>
              <span className="font-medium text-gray-800">{val || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
