import { useState, useEffect, useCallback } from 'react';
import {
  Plus, ArrowDownToLine, ArrowUpFromLine, Loader2, Trash2,
  AlertCircle, CheckCircle2, X, History, Package, Upload,
} from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import studentService from '../../services/studentService';
import CsvUploadModal from '../../components/common/CsvUploadModal';

const CSV_COLUMNS = [
  { key: 'item_name',    label: 'Item Name',    required: true, example: 'A4 Notebook' },
  { key: 'quantity',     label: 'Quantity',                     example: '50' },
  { key: 'price',        label: 'Price',                        example: '35.00' },
  { key: 'description',  label: 'Description',                  example: '200 pages, ruled' },
];

const CATEGORY_META = {
  uniform:    { label: 'Uniform',     icon: '👔', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  books:      { label: 'Books',       icon: '📖', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  stationary: { label: 'Stationery',  icon: '✏️', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  pantry:     { label: 'Pantry',      icon: '🍽️', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
};

const EMPTY_ITEM_FORM = { item_name: '', quantity: '', price: '', description: '' };
const EMPTY_STOCK_FORM = { quantity: '', unit_price: '', reference_note: '', date: new Date().toISOString().split('T')[0], type: 'sale', student_id: '' };

export default function AdminInventory({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.stationary;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ITEM_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const [stockModal, setStockModal] = useState(null); // { item, mode: 'in'|'out' }
  const [stockForm, setStockForm] = useState(EMPTY_STOCK_FORM);
  const [stockLoading, setStockLoading] = useState(false);

  const [txnModal, setTxnModal] = useState(null); // { item, transactions }
  const [txnLoading, setTxnLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [students, setStudents] = useState([]);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getItems(category);
      setItems(data.items || []);
    } catch {
      showToast('error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [category, showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Add item ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.item_name.trim()) { showToast('error', 'Item name is required'); return; }
    setAddLoading(true);
    try {
      await inventoryService.addItem({ ...addForm, category, quantity: parseInt(addForm.quantity) || 0, price: parseFloat(addForm.price) || null });
      showToast('success', 'Item added');
      setAddModal(false);
      setAddForm(EMPTY_ITEM_FORM);
      fetchItems();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to add item');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Stock movement ──
  const openStock = (item, mode) => {
    setStockModal({ item, mode });
    setStockForm(EMPTY_STOCK_FORM);
    if (mode === 'out' && students.length === 0) {
      studentService.getStudents().then((d) => setStudents(d.students || [])).catch(() => {});
    }
  };

  const handleStock = async (e) => {
    e.preventDefault();
    if (!stockForm.quantity || parseInt(stockForm.quantity) <= 0) { showToast('error', 'Enter a valid quantity'); return; }
    setStockLoading(true);
    try {
      const payload = {
        quantity: parseInt(stockForm.quantity),
        unit_price: stockForm.unit_price ? parseFloat(stockForm.unit_price) : undefined,
        reference_note: stockForm.reference_note || undefined,
        date: stockForm.date,
      };
      if (stockModal.mode === 'in') {
        await inventoryService.stockIn(stockModal.item.id, payload);
      } else {
        await inventoryService.stockOut(stockModal.item.id, {
          ...payload,
          type: stockForm.type || 'sale',
          student_id: stockForm.student_id || undefined,
        });
      }
      showToast('success', `Stock ${stockModal.mode === 'in' ? 'added' : 'reduced'} successfully`);
      setStockModal(null);
      fetchItems();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update stock');
    } finally {
      setStockLoading(false);
    }
  };

  // ── Transactions ──
  const openTransactions = async (item) => {
    setTxnModal({ item, transactions: [] });
    setTxnLoading(true);
    try {
      const data = await inventoryService.getItemTransactions(item.id);
      setTxnModal({ item, transactions: data.transactions || [] });
    } catch {
      showToast('error', 'Failed to load history');
      setTxnModal(null);
    } finally {
      setTxnLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await inventoryService.deleteItem(deleteConfirm.id);
      showToast('success', 'Item deleted');
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete item');
      setDeleteConfirm(null);
    }
  };

  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.quantity), 0);
  const lowStock = items.filter((i) => i.quantity <= 5).length;

  const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400';

  const handleCsvRow = async (row) => {
    await inventoryService.addItem({
      item_name: row.item_name,
      category,
      quantity: row.quantity ? parseInt(row.quantity) : 0,
      price: row.price ? parseFloat(row.price) : null,
      description: row.description || null,
    });
  };

  return (
    <div className="space-y-6">
      <CsvUploadModal
        open={csvOpen}
        onClose={() => { setCsvOpen(false); fetchItems(); }}
        title={`Bulk Add ${meta.label} Items`}
        columns={CSV_COLUMNS}
        templateName={`${category}_template.csv`}
        onUploadRow={handleCsvRow}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${meta.bg} ${meta.border} border rounded-2xl flex items-center justify-center text-2xl`}>
            {meta.icon}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">{meta.label} Inventory</h1>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} items · Total value ₹{totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCsvOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-brand-500 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl transition-all"
          >
            <Upload size={15} /> Upload CSV
          </button>
          <button
            onClick={() => { setAddModal(true); setAddForm(EMPTY_ITEM_FORM); }}
            className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus size={16} /> Add item
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Items</p>
            <p className="text-2xl font-bold font-display text-gray-900">{items.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Stock</p>
            <p className="text-2xl font-bold font-display text-gray-900">{items.reduce((s, i) => s + i.quantity, 0)}</p>
          </div>
          <div className={`border rounded-2xl p-5 ${lowStock > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${lowStock > 0 ? 'text-red-400' : 'text-gray-400'}`}>Low Stock (≤5)</p>
            <p className={`text-2xl font-bold font-display ${lowStock > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStock}</p>
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No items in {meta.label.toLowerCase()} inventory</p>
            <button onClick={() => setAddModal(true)} className="mt-3 text-sm text-brand-500 hover:text-brand-600 font-semibold">
              Add first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const value = parseFloat(item.price || 0) * item.quantity;
                  const isLow = item.quantity <= 5;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-gray-900">{item.item_name}</p>
                        {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-600 tabular-nums">
                        {item.price ? `₹${parseFloat(item.price).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-900 tabular-nums">
                        {value > 0 ? `₹${value.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openStock(item, 'in')}
                            title="Stock In"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 text-xs font-semibold hover:bg-emerald-50 transition-all"
                          >
                            <ArrowDownToLine className="w-3 h-3" /> In
                          </button>
                          <button
                            onClick={() => openStock(item, 'out')}
                            title="Stock Out"
                            disabled={item.quantity === 0}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200 text-orange-600 text-xs font-semibold hover:bg-orange-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ArrowUpFromLine className="w-3 h-3" /> Out
                          </button>
                          <button
                            onClick={() => openTransactions(item)}
                            title="View history"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all"
                          >
                            <History className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            title="Delete item"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 text-xs font-semibold hover:border-red-200 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD ITEM MODAL ── */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">Add {meta.label} Item</h3>
              <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item name <span className="text-red-400">*</span></label>
                <input type="text" value={addForm.item_name} onChange={(e) => setAddForm((f) => ({ ...f, item_name: e.target.value }))} placeholder="e.g. A4 Notebook" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial stock</label>
                  <input type="number" min="0" value={addForm.quantity} onChange={(e) => setAddForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit price (₹)</label>
                  <input type="number" min="0" step="0.01" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <input type="text" value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional details" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all">
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add item
                </button>
                <button type="button" onClick={() => setAddModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STOCK MODAL ── */}
      {stockModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-gray-900">
                  {stockModal.mode === 'in' ? 'Stock In — Purchase' : 'Stock Out — Sale / Distribute'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{stockModal.item.item_name} · Current stock: {stockModal.item.quantity}</p>
              </div>
              <button onClick={() => setStockModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleStock} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity <span className="text-red-400">*</span></label>
                  <input type="number" min="1" value={stockForm.quantity} onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit price (₹)</label>
                  <input type="number" min="0" step="0.01" value={stockForm.unit_price} onChange={(e) => setStockForm((f) => ({ ...f, unit_price: e.target.value }))} placeholder="Optional" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                <input type="date" value={stockForm.date} onChange={(e) => setStockForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
              </div>
              {stockModal.mode === 'out' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                    <select value={stockForm.type} onChange={(e) => setStockForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                      <option value="sale">Sale (paid)</option>
                      <option value="distribute">Distribute (free)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign to student (optional)</label>
                    <select value={stockForm.student_id} onChange={(e) => setStockForm((f) => ({ ...f, student_id: e.target.value }))} className={inputCls}>
                      <option value="">— No student —</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.name} — Class {s.class?.class_name}{s.class?.section} Roll #{s.roll_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note</label>
                <input type="text" value={stockForm.reference_note} onChange={(e) => setStockForm((f) => ({ ...f, reference_note: e.target.value }))}
                  placeholder={stockModal.mode === 'in' ? 'e.g. Purchased from Sharma Store' : 'e.g. Sold to Ravi Kumar, Class 6A'}
                  className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={stockLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 ${stockModal.mode === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                  {stockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stockModal.mode === 'in' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                  {stockModal.mode === 'in' ? 'Confirm Purchase' : 'Confirm Sale'}
                </button>
                <button type="button" onClick={() => setStockModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS MODAL ── */}
      {txnModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-elevated max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-display font-bold text-gray-900">Transaction History</h3>
                <p className="text-xs text-gray-400 mt-0.5">{txnModal.item.item_name}</p>
              </div>
              <button onClick={() => setTxnModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {txnLoading ? (
                <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
              ) : txnModal.transactions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No transactions recorded yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {txnModal.transactions.map((t) => {
                      const typeCls = t.type === 'purchase'
                        ? 'bg-emerald-100 text-emerald-700'
                        : t.type === 'sale'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700';
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 text-gray-600 tabular-nums">{t.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeCls}`}>{t.type}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{t.quantity}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                            {t.total_amount ? `₹${parseFloat(t.total_amount).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-6 py-3 text-gray-500 text-xs max-w-[160px] truncate">{t.reference_note || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900">Delete item?</h3>
                <p className="text-sm text-gray-400">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 mb-5 font-semibold">{deleteConfirm.item_name}</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
