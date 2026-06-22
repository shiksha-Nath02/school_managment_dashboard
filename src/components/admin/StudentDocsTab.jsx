import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Eye, Trash2, Loader2, CheckCircle2, AlertCircle, FileText, Image } from 'lucide-react';
import { makeDocService, fileUrl } from '../../services/documentService';
import api from '../../services/api';

const DOC_TYPES = [
  { key: 'student_aadhaar',      label: "Student Aadhaar" },
  { key: 'father_aadhaar',       label: "Father Aadhaar" },
  { key: 'mother_aadhaar',       label: "Mother Aadhaar" },
  { key: 'father_pan',           label: "Father PAN" },
  { key: 'mother_pan',           label: "Mother PAN" },
  { key: 'birth_certificate',    label: "Birth Cert." },
  { key: 'category_certificate', label: "Category Cert." },
];

export default function StudentDocsTab({ role = 'admin' }) {
  const docSvc = makeDocService(role);
  const [classes, setClasses]             = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState({}); // { "studentId-docType": true }
  const [toast, setToast]                 = useState(null);
  const fileInputRefs                     = useRef({});

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const endpoint = role === 'teacher' ? '/teacher/classes' : '/admin/classes';
    api.get(endpoint)
      .then((r) => setClasses(r.data.classes || r.data || []))
      .catch(console.error);
  }, [role]);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await docSvc.getStudentDocs(selectedClass || null);
      setStudents(r.data.students || []);
    } catch {
      showToast('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, showToast, role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const getDoc = (student, docType) =>
    student.documents.find((d) => d.documentType === docType) || null;

  const triggerUpload = (studentId, docType) => {
    const key = `${studentId}-${docType}`;
    if (!fileInputRefs.current[key]) return;
    fileInputRefs.current[key].click();
  };

  const handleFileChange = async (e, studentId, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const key = `${studentId}-${docType}`;
    setUploading((p) => ({ ...p, [key]: true }));
    try {
      const r = await docSvc.uploadDocument(studentId, docType, file);
      setStudents((prev) => prev.map((s) => {
        if (s.id !== studentId) return s;
        const docs = s.documents.filter((d) => d.documentType !== docType);
        return { ...s, documents: [...docs, r.data.document] };
      }));
      showToast('success', 'Document uploaded');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleDelete = async (studentId, docId, docType) => {
    if (!confirm('Delete this document?')) return;
    try {
      await docSvc.deleteDocument(docId);
      setStudents((prev) => prev.map((s) => {
        if (s.id !== studentId) return s;
        return { ...s, documents: s.documents.filter((d) => d.id !== docId) };
      }));
      showToast('success', 'Document deleted');
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const uploadedCount = students.reduce((sum, s) => sum + s.documents.length, 0);
  const totalSlots    = students.length * DOC_TYPES.length;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Stats + filter row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-400">Documents uploaded</p>
            <p className="text-xl font-bold font-display text-gray-900">{uploadedCount} <span className="text-sm font-normal text-gray-400">/ {totalSlots}</span></p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-400">Students</p>
            <p className="text-xl font-bold font-display text-gray-900">{students.length}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-brand-400"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>Class {c.class_name} {c.section}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="font-medium">No students found</p>
            <p className="text-sm mt-1">Select a class or add students first</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-50/70 z-10 min-w-[160px]">Student</th>
                  {DOC_TYPES.map((dt) => (
                    <th key={dt.key} className="px-3 py-3 text-center min-w-[110px]">{dt.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/40">
                    {/* Student info — sticky left column */}
                    <td className="px-4 py-3 sticky left-0 bg-white z-10">
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400 font-mono">#{s.id} · {s.class}</p>
                    </td>

                    {/* Document cells */}
                    {DOC_TYPES.map((dt) => {
                      const doc = getDoc(s, dt.key);
                      const key = `${s.id}-${dt.key}`;
                      const busy = uploading[key];
                      const isPdf = doc?.mimeType === 'application/pdf';

                      return (
                        <td key={dt.key} className="px-3 py-3 text-center">
                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[key] = el; }}
                            onChange={(e) => handleFileChange(e, s.id, dt.key)}
                          />

                          {doc ? (
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View */}
                              <a
                                href={doc.url || fileUrl(doc.filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={doc.fileName}
                                className="flex items-center gap-1 px-2 py-1 bg-brand-50 text-brand-600 border border-brand-200 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
                              >
                                {isPdf ? <FileText className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                                View
                              </a>
                              {/* Re-upload */}
                              <button
                                onClick={() => triggerUpload(s.id, dt.key)}
                                disabled={busy}
                                title="Replace document"
                                className="p-1 text-gray-300 hover:text-brand-500 transition-colors"
                              >
                                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(s.id, doc.id, dt.key)}
                                title="Delete"
                                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerUpload(s.id, dt.key)}
                              disabled={busy}
                              className="flex items-center gap-1 mx-auto px-2.5 py-1 border border-dashed border-gray-300 text-gray-400 rounded-lg text-xs font-medium hover:border-brand-400 hover:text-brand-500 transition-colors disabled:opacity-50"
                            >
                              {busy
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Upload className="w-3 h-3" />}
                              {busy ? 'Uploading…' : 'Upload'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Accepts JPG, PNG, PDF · Max 10 MB per file · Stored securely on S3 (private, time-limited access links)
      </p>
    </div>
  );
}
