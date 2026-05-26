import { useState, useEffect, useRef } from 'react';
import {
  X, Upload, Download, CheckCircle2, AlertCircle,
  Loader2, FileText, ChevronRight, RotateCcw,
} from 'lucide-react';

// ── CSV helpers ─────────────────────────────────────────────────────────────

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text, columns) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('File has no data rows');

  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());

  // Map each column key → CSV column index (match by key or label)
  const keyMap = {};
  columns.forEach((col) => {
    const targets = [col.key.toLowerCase(), (col.label || '').toLowerCase()];
    const idx = headers.findIndex((h) => targets.includes(h));
    keyMap[col.key] = idx; // -1 means column missing
  });

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    columns.forEach((col) => {
      const idx = keyMap[col.key];
      row[col.key] = idx >= 0 ? (values[idx] ?? '').replace(/^"|"$/g, '').trim() : '';
    });
    return row;
  });
}

function downloadTemplate(columns, templateName) {
  const header = columns.map((c) => c.label || c.key).join(',');
  const example = columns.map((c) => (c.example ?? '')).join(',');
  const csv = `${header}\n${example}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = templateName || 'template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * CsvUploadModal
 *
 * Props:
 *   open          boolean
 *   onClose       () => void
 *   title         string
 *   columns       { key, label, required?, example? }[]
 *   templateName  string  (filename for the downloaded template)
 *   onUploadRow   async (row) => void  — called once per data row; throw to mark as failed
 */
export default function CsvUploadModal({ open, onClose, title, columns, templateName, onUploadRow }) {
  const [step, setStep] = useState('upload'); // upload | preview | uploading | done
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState([]);
  const fileRef = useRef();

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setStep('upload');
      setRows([]);
      setParseError(null);
      setResults([]);
      setProgress({ done: 0, total: 0 });
    }
  }, [open]);

  if (!open) return null;

  // ── File handling ──
  const processFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setParseError('Please select a .csv file');
      return;
    }
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCsv(e.target.result, columns);
        if (parsed.length === 0) { setParseError('No data rows found'); return; }
        setRows(parsed);
        setStep('preview');
      } catch (err) {
        setParseError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  // ── Upload ──
  const handleUpload = async () => {
    setStep('uploading');
    setProgress({ done: 0, total: rows.length });
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      try {
        await onUploadRow(rows[i]);
        out.push({ row: rows[i], success: true });
      } catch (err) {
        out.push({ row: rows[i], success: false, error: err.response?.data?.message || err.message || 'Failed' });
      }
      setProgress({ done: i + 1, total: rows.length });
    }
    setResults(out);
    setStep('done');
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  const inputCls = 'text-xs font-mono text-gray-600 truncate max-w-[120px]';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-elevated flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 border border-brand-200/60 rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Upload a CSV file to add multiple records at once</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: upload */}
        {step === 'upload' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Template download */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-gray-700">Download template</p>
                <p className="text-xs text-gray-400 mt-0.5">Fill this file and upload it below</p>
              </div>
              <button
                onClick={() => downloadTemplate(columns, templateName)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-500 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Template
              </button>
            </div>

            {/* Column guide */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Expected columns</p>
              <div className="flex flex-wrap gap-2">
                {columns.map((col) => (
                  <span key={col.key} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${col.required ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-gray-200 text-gray-500'}`}>
                    {col.label || col.key}{col.required ? ' *' : ''}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2"><span className="text-brand-500 font-bold">*</span> required</p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-brand-400 bg-brand-50/50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50/60'}`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-3 ${dragging ? 'text-brand-500' : 'text-gray-300'}`} />
              <p className="text-sm font-semibold text-gray-700">Drop your CSV here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => processFile(e.target.files[0])} />
            </div>

            {parseError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parseError}
              </div>
            )}
          </div>
        )}

        {/* Step: preview */}
        {step === 'preview' && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{rows.length} row{rows.length !== 1 ? 's' : ''} ready to upload</p>
              <button onClick={() => setStep('upload')} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <RotateCcw className="w-3 h-3" /> Change file
              </button>
            </div>

            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wide">#</th>
                    {columns.map((col) => (
                      <th key={col.key} className="px-4 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {col.label || col.key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-mono text-gray-400">{i + 1}</td>
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-2.5 ${!row[col.key] && col.required ? 'text-red-400 font-semibold' : 'text-gray-700'}`}>
                          <span className="truncate block max-w-[150px]">{row[col.key] || (col.required ? '⚠ missing' : '—')}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={handleUpload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload {rows.length} row{rows.length !== 1 ? 's' : ''}
              </button>
              <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step: uploading */}
        {step === 'uploading' && (
          <div className="p-10 flex flex-col items-center justify-center gap-5">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <div className="text-center">
              <p className="font-display font-bold text-gray-900 text-lg">{progress.done} / {progress.total}</p>
              <p className="text-sm text-gray-400 mt-1">Uploading rows...</p>
            </div>
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="flex flex-col overflow-hidden">
            {/* Summary */}
            <div className="px-6 py-4 border-b border-gray-100 shrink-0 flex items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-lg">{successCount}</span>
                <span className="text-sm">added</span>
              </div>
              {failCount > 0 && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold text-lg">{failCount}</span>
                  <span className="text-sm">failed</span>
                </div>
              )}
            </div>

            {/* Per-row results */}
            <div className="overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wide">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wide">Row</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wide">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r, i) => {
                    const label = r.row[columns[0]?.key] || `Row ${i + 1}`;
                    return (
                      <tr key={i} className={r.success ? '' : 'bg-red-50/40'}>
                        <td className="px-4 py-2.5 font-mono text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-gray-800">{label}</td>
                        <td className="px-4 py-2.5">
                          {r.success ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Added
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" /> {r.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              {failCount > 0 && (
                <button onClick={() => setStep('upload')} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  <RotateCcw className="w-4 h-4" /> Try again
                </button>
              )}
              <button onClick={onClose} className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
