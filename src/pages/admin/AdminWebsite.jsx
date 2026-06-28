import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Upload, Trash2, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon,
  Megaphone, FileText, ExternalLink, FolderOpen,
} from 'lucide-react';
import galleryService from '../../services/galleryService';
import circularService from '../../services/circularService';

// Suggested folder names (you can also type any custom folder).
const GALLERY_CATEGORIES = ['campus', 'classroom', 'sports', 'events', 'library', 'activities'];

export default function AdminWebsite() {
  const [tab, setTab] = useState('gallery');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Website Content</h1>
        <p className="text-gray-500 text-sm">Manage the public gallery and notices shown on the school homepage.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'gallery' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <ImageIcon className="w-4 h-4" /> Gallery
        </button>
        <button
          onClick={() => setTab('circulars')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'circulars' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Megaphone className="w-4 h-4" /> Notices / Circulars
        </button>
      </div>

      {tab === 'gallery' ? <GalleryManager showToast={showToast} /> : <CircularManager showToast={showToast} />}
    </div>
  );
}

// ───────────────────────── Gallery ─────────────────────────
function GalleryManager({ showToast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await galleryService.list();
      setImages(r.data.images || []);
    } catch {
      showToast('error', 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetch(); }, [fetch]);

  // Existing folder names (from loaded images) + suggestions, for the datalist.
  const folderOptions = useMemo(() => {
    const set = new Set([...GALLERY_CATEGORIES, ...images.map((g) => g.category)]);
    return [...set].sort();
  }, [images]);

  // Group images by folder for display.
  const groups = useMemo(() => {
    const m = {};
    for (const g of images) (m[g.category] = m[g.category] || []).push(g);
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
  }, [images]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (!category.trim()) { showToast('error', 'Enter a folder name first'); return; }
    setUploading(true);
    try {
      const r = await galleryService.upload(category.trim(), files, caption);
      setImages((prev) => [...(r.data.images || []), ...prev]);
      setCaption('');
      showToast('success', `${(r.data.images || []).length} image(s) uploaded to "${category.trim()}"`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      await galleryService.remove(id);
      setImages((prev) => prev.filter((g) => g.id !== id));
      showToast('success', 'Image deleted');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-2xl p-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Folder name</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="gallery-folders"
            placeholder="e.g. Annual Day 2026"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
          />
          <datalist id="gallery-folders">
            {folderOptions.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Annual Day 2026"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <input type="file" accept="image/jpeg,image/png,image/jpg" multiple className="hidden" ref={fileRef} onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload Images'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
      ) : images.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-16">No gallery images yet.</p>
      ) : (
        <div className="space-y-6">
          {groups.map(([folder, imgs]) => (
            <div key={folder}>
              <div className="flex items-center gap-2 mb-2 text-gray-700">
                <FolderOpen className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-semibold capitalize">{folder}</span>
                <span className="text-xs text-gray-400">({imgs.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imgs.map((g) => (
                  <div key={g.id} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={g.url} alt={g.caption || g.category} className="w-full h-full object-cover" />
                    {g.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <span className="text-white text-[11px] font-medium">{g.caption}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(g.id)}
                      title="Delete"
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Circulars ─────────────────────────
function CircularManager({ showToast }) {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await circularService.list();
      setCirculars(r.data.circulars || []);
    } catch {
      showToast('error', 'Failed to load circulars');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!title.trim()) { showToast('error', 'Enter a title first'); return; }
    setUploading(true);
    try {
      const r = await circularService.upload(title, file, category);
      setCirculars((prev) => [r.data.circular, ...prev]);
      setTitle('');
      setCategory('');
      showToast('success', 'Circular uploaded');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this circular?')) return;
    try {
      await circularService.remove(id);
      setCirculars((prev) => prev.filter((c) => c.id !== id));
      showToast('success', 'Circular deleted');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Vacation Notice"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Category (optional)</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Holiday"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <input type="file" accept="application/pdf" className="hidden" ref={fileRef} onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload PDF'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
      ) : circulars.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-16">No circulars yet.</p>
      ) : (
        <div className="space-y-2">
          {circulars.map((c) => (
            <div key={c.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                {c.category && <span className="text-[11px] text-brand-500 font-medium uppercase tracking-wide">{c.category}</span>}
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-xs font-semibold hover:bg-brand-100"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View
              </a>
              <button onClick={() => handleDelete(c.id)} title="Delete" className="p-1.5 text-gray-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
