import { useState, useRef } from 'react';
import { X, Download, Upload, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
    else { cur += ch; }
  }
  out.push(cur);
  return out.map((v) => v.trim().replace(/^"|"$/g, ''));
}

function parseCSV(text, columns) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const keyMap = {};
  columns.forEach((c) => {
    const idx = headers.findIndex((h) => h === c.label.toLowerCase());
    if (idx !== -1) keyMap[idx] = c.key;
  });
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const row = {};
    vals.forEach((v, i) => { if (keyMap[i]) row[keyMap[i]] = v; });
    return row;
  }).filter((row) => Object.values(row).some((v) => v));
}

export default function CsvModal({ open, onClose, title, columns, templateName = 'template.csv', onUploadRow }) {
  const [rows, setRows]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]   = useState(null);
  const fileRef = useRef(null);

  if (!open) return null;

  const downloadTemplate = () => {
    const header  = columns.map((c) => c.label).join(',');
    const example = columns.map((c) => c.example || '').join(',');
    const blob = new Blob([`${header}\n${example}`], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = templateName; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setRows(parseCSV(ev.target.result, columns));
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!rows?.length) return;
    setUploading(true);
    let success = 0;
    const errors = [];
    for (const row of rows) {
      try { await onUploadRow(row); success++; }
      catch (e) { errors.push(e.response?.data?.message || 'Row failed'); }
    }
    setResult({ success, errors });
    setUploading(false);
  };

  const handleClose = () => {
    setRows(null); setResult(null);
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-gray-900">{title}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Template info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500">Download the template, fill it in, then upload it back.</p>
            <p className="text-xs text-gray-400">
              Columns:&nbsp;
              {columns.map((c, i) => (
                <span key={c.key}>
                  {i > 0 && ', '}
                  <span className={c.required ? 'font-semibold text-gray-700' : ''}>{c.label}{c.required ? '*' : ''}</span>
                </span>
              ))}
            </p>
            <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-700">
              <Download className="w-3.5 h-3.5" /> Download Template
            </button>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Upload CSV</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          {/* Row count preview */}
          {rows && !result && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700 font-semibold">{rows.length} row{rows.length !== 1 ? 's' : ''} ready to import</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 font-semibold">{result.success} row{result.success !== 1 ? 's' : ''} imported</p>
              </div>
              {result.errors.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{result.errors.length} row{result.errors.length !== 1 ? 's' : ''} failed</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {result ? (
              <button onClick={handleClose} className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all">
                Done
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpload}
                  disabled={!rows?.length || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Importing…' : 'Import'}
                </button>
                <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
