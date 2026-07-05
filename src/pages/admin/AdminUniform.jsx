import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, ShoppingCart, Plus, X, Pencil, Trash2, Loader2, CheckCircle2, AlertCircle, IndianRupee, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react';
import svc from '@/services/uniformService';
import CsvModal from '@/components/common/CsvModal';

const ITEM_SUGGESTIONS = ['Shirt', 'Skirt', 'Pants', 'Blazer', 'Tie', 'Belt', 'Socks', 'Shoes', 'Sweater', 'Salwar'];
const SIZE_SUGGESTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'];

const ITEM_CSV_COLS = [
  { key: 'item_name',       label: 'Item Name',   required: true, example: 'Shirt' },
  { key: 'size',            label: 'Size',         required: true, example: 'M' },
  { key: 'price',           label: 'Price',        required: true, example: '250' },
  { key: 'units_available', label: 'Units',                        example: '50' },
];

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const filterCls = 'border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-white';

const fmt    = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
const today  = () => new Date().toISOString().split('T')[0];

export default function AdminUniform() {
  const [tab, setTab] = useState('stock');
  const [csvOpen, setCsvOpen] = useState(false);

  // ── items
  const [items, setItems]           = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemModal, setItemModal]   = useState(null);
  const [itemForm, setItemForm]     = useState({ item_name: '', size: '', price: '', units_available: '' });
  const [itemSaving, setItemSaving] = useState(false);

  // ── transactions
  const [txns, setTxns]             = useState([]);
  const [txnsLoading, setTxnsLoading] = useState(true);
  const [expandedTxn, setExpandedTxn] = useState(null);

  // ── filters
  const [filterDate,      setFilterDate]      = useState('');
  const [filterAdmission, setFilterAdmission] = useState('');
  const [filterPhone,     setFilterPhone]     = useState('');
  const [filterStatus,    setFilterStatus]    = useState('all'); // 'all'|'pending'|'paid'
  const [filterCategory,  setFilterCategory]  = useState('');

  // ── sell modal
  const [sellModal, setSellModal]   = useState(false);
  const [sellForm, setSellForm]     = useState({ student_name: '', father_phone: '', admission_number: '', item_id: '', quantity: 1, discount: '', amount_paying: '' });
  const [sellSaving, setSellSaving] = useState(false);
  const [matched, setMatched]       = useState(null); // null=not checked, false=no match, object=found

  // ── payment modal
  const [payModal, setPayModal]     = useState(null);
  const [payForm, setPayForm]       = useState({ amount: '', payment_date: today(), remarks: '' });
  const [paySaving, setPaySaving]   = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try { const d = await svc.getItems(); setItems(d.items || []); }
    catch { showToast('error', 'Failed to load items'); }
    finally { setItemsLoading(false); }
  }, [showToast]);

  const loadTxns = useCallback(async () => {
    setTxnsLoading(true);
    try { const d = await svc.getTransactions(); setTxns(d.transactions || []); }
    catch { showToast('error', 'Failed to load sales'); }
    finally { setTxnsLoading(false); }
  }, [showToast]);

  useEffect(() => { loadItems(); loadTxns(); }, [loadItems, loadTxns]);

  // ── client-side filtered list
  const filteredTxns = useMemo(() => txns.filter((t) => {
    if (filterDate      && !t.createdAt?.startsWith(filterDate))                                      return false;
    if (filterAdmission && !t.admissionNumber?.toLowerCase().includes(filterAdmission.toLowerCase())) return false;
    if (filterPhone     && !t.fatherPhone?.includes(filterPhone))                                     return false;
    if (filterStatus === 'paid'    && t.left > 0)  return false;
    if (filterStatus === 'pending' && t.left <= 0) return false;
    if (filterCategory  && t.studentCategory !== filterCategory)                                      return false;
    return true;
  }), [txns, filterDate, filterAdmission, filterPhone, filterStatus, filterCategory]);

  // ── CSV export
  const exportCsv = () => {
    const header = ['Student Name', 'Admission No', 'Phone', 'Item', 'Size', 'Qty', 'To Pay', 'Paid', 'Left', 'Date'];
    const rows = filteredTxns.map((t) => [
      `"${t.studentName}"`, t.admissionNumber || '', t.fatherPhone || '',
      `"${t.item?.itemName || ''}"`, t.item?.size || '', t.quantity,
      t.toBePaid, t.paid, t.left, fmtDate(t.createdAt),
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'uniform-sales.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── item modal
  // Add mode holds one item name + many size rows; edit mode edits a single row.
  const emptyVariant = () => ({ size: '', price: '', units_available: '' });
  const openAddItem  = () => { setItemForm({ item_name: '', variants: [emptyVariant()] }); setItemModal('add'); };
  const openEditItem = (item) => { setItemForm({ item_name: item.itemName, size: item.size, price: item.price, units_available: item.unitsAvailable }); setItemModal(item); };

  const setVariant    = (idx, patch) => setItemForm((f) => ({ ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, ...patch } : v) }));
  const addVariantRow = () => setItemForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (idx) => setItemForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const handleSaveItem = async () => {
    setItemSaving(true);
    try {
      if (itemModal === 'add') {
        if (!itemForm.item_name.trim()) { setItemSaving(false); return showToast('error', 'Item name is required'); }
        const variants = itemForm.variants.filter((v) => v.size.trim() || v.price !== '');
        if (!variants.length || variants.some((v) => !v.size.trim() || v.price === '')) {
          setItemSaving(false); return showToast('error', 'Each size needs a size and price');
        }
        const sizes = variants.map((v) => v.size.trim().toLowerCase());
        if (new Set(sizes).size !== sizes.length) { setItemSaving(false); return showToast('error', 'Duplicate size in the list'); }
        const d = await svc.addItem({ item_name: itemForm.item_name.trim(), variants });
        showToast('success', d.message || 'Item added');
      } else {
        if (!itemForm.item_name || !itemForm.size || !itemForm.price) { setItemSaving(false); return showToast('error', 'Name, size, and price are required'); }
        await svc.updateItem(itemModal.id, itemForm); showToast('success', 'Item updated');
      }
      setItemModal(null); loadItems();
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to save'); }
    finally { setItemSaving(false); }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Delete "${item.itemName} - ${item.size}"?`)) return;
    try { await svc.deleteItem(item.id); loadItems(); showToast('success', 'Item deleted'); }
    catch (e) { showToast('error', e.response?.data?.message || 'Cannot delete'); }
  };

  // ── sell modal
  const selectedItem = items.find((i) => i.id === parseInt(sellForm.item_id, 10));
  const gross     = selectedItem ? parseFloat(selectedItem.price) * (parseInt(sellForm.quantity, 10) || 1) : 0;
  const discount  = Math.min(Math.max(parseFloat(sellForm.discount) || 0, 0), gross); // clamp to [0, gross]
  const toPay     = gross - discount;
  const payingNow = parseFloat(sellForm.amount_paying) || 0;
  const leftNow   = Math.max(0, toPay - payingNow);

  // Look up the student by admission number and auto-fill name + father's phone.
  const lookupStudentDetails = async () => {
    const adm = sellForm.admission_number.trim();
    if (!adm) { setMatched(null); return; }
    try {
      const { student } = await svc.lookupStudent(adm);
      if (student) {
        setMatched(student);
        setSellForm((f) => ({
          ...f,
          student_name: student.name || f.student_name,
          father_phone: student.fatherPhone || f.father_phone,
        }));
      } else {
        setMatched(false);
      }
    } catch { setMatched(null); }
  };

  const handleSell = async () => {
    if (!sellForm.student_name || !sellForm.item_id) return showToast('error', 'Student name and item are required');
    setSellSaving(true);
    try {
      const d = await svc.sellItem({ ...sellForm, quantity: parseInt(sellForm.quantity, 10) || 1 });
      setTxns((prev) => [d.transaction, ...prev]);
      setSellModal(false); loadItems(); showToast('success', 'Sale recorded');
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to record sale'); }
    finally { setSellSaving(false); }
  };

  // ── payment modal
  const openPayModal = (txn) => { setPayModal(txn); setPayForm({ amount: '', payment_date: today(), remarks: '' }); };
  const payLeft = payModal ? payModal.left : 0;

  const handleAddPayment = async () => {
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) return showToast('error', 'Enter a valid amount');
    setPaySaving(true);
    try {
      const d = await svc.addPayment(payModal.id, payForm);
      setTxns((prev) => prev.map((t) => t.id === d.transaction.id ? d.transaction : t));
      setPayModal(null); showToast('success', 'Payment recorded');
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed'); }
    finally { setPaySaving(false); }
  };

  const handleDeleteTxn = async (txn) => {
    if (!confirm(`Void sale for ${txn.studentName}? Stock will be restored.`)) return;
    try {
      await svc.deleteTransaction(txn.id);
      setTxns((prev) => prev.filter((t) => t.id !== txn.id));
      loadItems(); showToast('success', 'Sale voided');
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed'); }
  };

  // ── items CSV export
  const exportItemsCsv = () => {
    const header = ['Item Name', 'Size', 'Price', 'Units Available'];
    const rows   = items.map((i) => [i.itemName, i.size, i.price, i.unitsAvailable]);
    const csv    = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob   = new Blob([csv], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'uniform-items.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleItemCsvRow = async (row) => {
    if (!row.item_name || !row.size || !row.price) throw new Error('item_name, size, price required');
    await svc.addItem({ item_name: row.item_name, size: row.size, price: parseFloat(row.price), units_available: parseInt(row.units_available, 10) || 0 });
  };

  // ── stats (on filtered list)
  const totalToBePaid = filteredTxns.reduce((s, t) => s + t.toBePaid, 0);
  const totalPaid     = filteredTxns.reduce((s, t) => s + t.paid,     0);
  const totalLeft     = filteredTxns.reduce((s, t) => s + t.left,     0);

  return (
    <div className="space-y-6">
      <CsvModal
        open={csvOpen}
        onClose={() => { setCsvOpen(false); loadItems(); }}
        title="Import Uniform Items"
        columns={ITEM_CSV_COLS}
        templateName="uniform-items-template.csv"
        onUploadRow={handleItemCsvRow}
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Uniform Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stock, sales, and payment tracking</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[{ key: 'stock', label: 'Stock Items', Icon: Package }, { key: 'sales', label: 'Sales & Payments', Icon: ShoppingCart }].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ────────── STOCK TAB ────────── */}
      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <button onClick={exportItemsCsv} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => setCsvOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
              <Upload className="w-4 h-4" /> Import CSV
            </button>
            <button onClick={openAddItem} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2rem_1fr_6rem_8rem_8rem_6rem] gap-4 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>#</span><span>Item</span><span>Size</span><span>Price</span><span>In Stock</span><span>Actions</span>
            </div>
            {itemsLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">No items yet. Click "Add Item" to get started.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_6rem_8rem_8rem_6rem] gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50">
                    <span className="text-xs font-mono text-gray-400">{idx + 1}</span>
                    <p className="text-sm font-semibold text-gray-900">{item.itemName}</p>
                    <span className="hidden sm:inline text-sm text-gray-600">{item.size}</span>
                    <span className="hidden sm:inline text-sm font-semibold text-gray-800">{fmt(item.price)}</span>
                    <span className={`hidden sm:inline text-sm font-bold ${item.unitsAvailable === 0 ? 'text-red-500' : item.unitsAvailable < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {item.unitsAvailable} units
                    </span>
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEditItem(item)} className="text-gray-400 hover:text-brand-500"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteItem(item)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────── SALES TAB ────────── */}
      {tab === 'sales' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Sales',     value: fmt(totalToBePaid), color: 'text-gray-900' },
              { label: 'Total Collected', value: fmt(totalPaid),     color: 'text-emerald-600' },
              { label: 'Pending',          value: fmt(totalLeft),    color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters row */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={filterCls}
                />
              </div>
              {/* Admission No */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admission No</label>
                <input
                  value={filterAdmission}
                  onChange={(e) => setFilterAdmission(e.target.value)}
                  placeholder="ADM-001"
                  className={`${filterCls} w-36`}
                />
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone Number</label>
                <input
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  placeholder="98765..."
                  className={`${filterCls} w-36`}
                />
              </div>
              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={filterCls}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={filterCls}>
                  <option value="">All</option>
                  {['General', 'OBC', 'SC', 'ST', 'EWS'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Clear filters */}
              {(filterDate || filterAdmission || filterPhone || filterStatus !== 'all' || filterCategory) && (
                <button
                  onClick={() => { setFilterDate(''); setFilterAdmission(''); setFilterPhone(''); setFilterStatus('all'); setFilterCategory(''); }}
                  className="text-xs text-brand-500 font-semibold hover:text-brand-700 self-end pb-2"
                >
                  Clear filters
                </button>
              )}

              {/* Actions pushed right */}
              <div className="ml-auto flex items-end gap-2 self-end">
                <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={() => { setSellForm({ student_name: '', father_phone: '', admission_number: '', item_id: '', quantity: 1, discount: '', amount_paying: '' }); setMatched(null); setSellModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Sell Item
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {(filterDate || filterAdmission || filterPhone || filterStatus !== 'all' || filterCategory) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Showing {filteredTxns.length} of {txns.length} records</span>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-[2rem_1fr_1fr_5rem_6rem_6rem_6rem_7rem_auto] gap-3 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>#</span><span>Student</span><span>Item</span><span>Qty</span><span>To Pay</span><span>Paid</span><span>Left</span><span>Date</span><span>Actions</span>
            </div>

            {txnsLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
            ) : filteredTxns.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                {txns.length === 0 ? 'No sales recorded yet.' : 'No records match the current filters.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTxns.map((txn, idx) => {
                  const isExpanded = expandedTxn === txn.id;
                  const fullyPaid  = txn.left <= 0;
                  return (
                    <div key={txn.id}>
                      <div className="grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2rem_1fr_1fr_5rem_6rem_6rem_6rem_7rem_auto] gap-3 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                        <span className="text-xs font-mono text-gray-400">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{txn.studentName}</p>
                          <p className="text-xs text-gray-400">{txn.admissionNumber || txn.fatherPhone || '—'}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm text-gray-700 font-medium">{txn.item?.itemName}</p>
                          <p className="text-xs text-gray-400">Size {txn.item?.size}</p>
                        </div>
                        <span className="hidden md:inline text-sm text-gray-600">×{txn.quantity}</span>
                        <span className="hidden md:inline text-sm font-semibold text-gray-800">{fmt(txn.toBePaid)}</span>
                        <span className="hidden md:inline text-sm font-semibold text-emerald-600">{fmt(txn.paid)}</span>
                        <span className={`hidden md:inline text-sm font-bold ${fullyPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                          {fullyPaid ? '✓ Paid' : fmt(txn.left)}
                        </span>
                        <span className="hidden md:inline text-xs text-gray-400">{fmtDate(txn.createdAt)}</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          {!fullyPaid && (
                            <button onClick={() => openPayModal(txn)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">
                              <IndianRupee className="w-3 h-3" /> Pay
                            </button>
                          )}
                          <button onClick={() => setExpandedTxn(isExpanded ? null : txn.id)} className="text-gray-400 hover:text-gray-700 p-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDeleteTxn(txn)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      {/* Expanded payment history */}
                      {isExpanded && (
                        <div className="bg-gray-50/60 border-t border-gray-100 px-14 py-3 space-y-1.5">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Payment History</p>
                          {txn.payments.length === 0 ? (
                            <p className="text-xs text-gray-400">No payments recorded.</p>
                          ) : txn.payments.map((p, pi) => (
                            <div key={p.id} className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="w-5 text-gray-400">{pi + 1}.</span>
                              <span className="font-semibold text-emerald-600">{fmt(p.amountPaid)}</span>
                              <span className="text-gray-400">{p.paymentDate}</span>
                              {p.remarks && <span className="text-gray-400 italic">{p.remarks}</span>}
                            </div>
                          ))}
                          <div className="pt-2 border-t border-gray-200 flex gap-6 text-xs font-semibold">
                            {txn.discount > 0 && <span>Discount: <span className="text-amber-600">−{fmt(txn.discount)}</span></span>}
                            <span>To Pay: <span className="text-gray-700">{fmt(txn.toBePaid)}</span></span>
                            <span>Paid: <span className="text-emerald-600">{fmt(txn.paid)}</span></span>
                            <span>Left: <span className={txn.left <= 0 ? 'text-emerald-500' : 'text-red-500'}>{txn.left <= 0 ? 'Fully Paid' : fmt(txn.left)}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────── ADD / EDIT ITEM MODAL ────── */}
      {itemModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl w-full ${itemModal === 'add' ? 'max-w-lg' : 'max-w-sm'} shadow-xl max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">{itemModal === 'add' ? 'Add Uniform Item' : 'Edit Item'}</h3>
              <button onClick={() => setItemModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <datalist id="size-suggestions">{SIZE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>

            {itemModal === 'add' ? (
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name</label>
                  <input value={itemForm.item_name} onChange={(e) => setItemForm((f) => ({ ...f, item_name: e.target.value }))} list="item-suggestions" placeholder="e.g. Skirt" className={inputCls} />
                  <datalist id="item-suggestions">{ITEM_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-0.5">
                    <span>Size</span><span>Price (₹)</span><span>Units</span><span></span>
                  </div>
                  {itemForm.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 items-center">
                      <input value={v.size} onChange={(e) => setVariant(idx, { size: e.target.value })} list="size-suggestions" placeholder="M" className={inputCls} />
                      <input type="number" min="0" value={v.price} onChange={(e) => setVariant(idx, { price: e.target.value })} placeholder="350" className={inputCls} />
                      <input type="number" min="0" value={v.units_available} onChange={(e) => setVariant(idx, { units_available: e.target.value })} placeholder="20" className={inputCls} />
                      <button
                        onClick={() => removeVariant(idx)}
                        disabled={itemForm.variants.length === 1}
                        className="text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300 flex justify-center"
                        title="Remove size"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addVariantRow} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-1">
                    <Plus className="w-4 h-4" /> Add another size
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name</label>
                  <input value={itemForm.item_name} onChange={(e) => setItemForm((f) => ({ ...f, item_name: e.target.value }))} list="item-suggestions" placeholder="e.g. Skirt" className={inputCls} />
                  <datalist id="item-suggestions">{ITEM_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Size</label>
                  <input value={itemForm.size} onChange={(e) => setItemForm((f) => ({ ...f, size: e.target.value }))} list="size-suggestions" placeholder="e.g. M" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹)</label>
                    <input type="number" min="0" value={itemForm.price} onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))} placeholder="350" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Units in Stock</label>
                    <input type="number" min="0" value={itemForm.units_available} onChange={(e) => setItemForm((f) => ({ ...f, units_available: e.target.value }))} placeholder="20" className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <button onClick={handleSaveItem} disabled={itemSaving} className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {itemSaving && <Loader2 className="w-4 h-4 animate-spin" />} {itemModal === 'add' ? `Add ${itemForm.variants.length} Size${itemForm.variants.length === 1 ? '' : 's'}` : 'Save Changes'}
              </button>
              <button onClick={() => setItemModal(null)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ────── SELL ITEM MODAL ────── */}
      {sellModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">Sell Uniform Item</h3>
              <button onClick={() => setSellModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Name *</label>
                  <input value={sellForm.student_name} onChange={(e) => setSellForm((f) => ({ ...f, student_name: e.target.value }))} placeholder="Full name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Father's Phone</label>
                  <input value={sellForm.father_phone} onChange={(e) => setSellForm((f) => ({ ...f, father_phone: e.target.value }))} placeholder="9876543210" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admission Number</label>
                  <input value={sellForm.admission_number}
                    onChange={(e) => { setSellForm((f) => ({ ...f, admission_number: e.target.value })); setMatched(null); }}
                    onBlur={lookupStudentDetails}
                    placeholder="Type admission no, then Tab" className={inputCls} />
                  {matched && <p className="mt-1 text-xs text-emerald-600">✓ {matched.name}{matched.className ? ` · ${matched.className}` : ''}</p>}
                  {matched === false && <p className="mt-1 text-xs text-amber-600">No student matched — sale will be unlinked.</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Item *</label>
                  <select value={sellForm.item_id} onChange={(e) => setSellForm((f) => ({ ...f, item_id: e.target.value, amount_paying: '' }))} className={inputCls}>
                    <option value="">— Choose —</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id} disabled={i.unitsAvailable === 0}>
                        {i.itemName} — Size {i.size} — {fmt(i.price)} {i.unitsAvailable === 0 ? '(Out of stock)' : `(${i.unitsAvailable} left)`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
                  <input type="number" min="1" value={sellForm.quantity} onChange={(e) => setSellForm((f) => ({ ...f, quantity: e.target.value, amount_paying: '' }))} className={inputCls} />
                </div>
              </div>
              {selectedItem && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Item total</span>
                    <span className="font-semibold text-gray-700">{fmt(gross)}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount (₹)</label>
                    <input type="number" min="0" max={gross} value={sellForm.discount} onChange={(e) => setSellForm((f) => ({ ...f, discount: e.target.value, amount_paying: '' }))} placeholder="0" className={inputCls} />
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-brand-100">
                    <span className="text-gray-500 font-medium">Amount to be paid</span>
                    <span className="font-bold text-gray-900 text-base">{fmt(toPay)}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paying Now (₹)</label>
                    <input type="number" min="0" max={toPay} value={sellForm.amount_paying} onChange={(e) => setSellForm((f) => ({ ...f, amount_paying: e.target.value }))} placeholder="0" className={inputCls} />
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-brand-100">
                    <span className="text-gray-500">Left amount</span>
                    <span className={`font-bold text-base ${leftNow === 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(leftNow)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleSell} disabled={sellSaving} className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {sellSaving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Sale
              </button>
              <button onClick={() => setSellModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ────── ADD PAYMENT MODAL ────── */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">Add Payment</h3>
              <button onClick={() => setPayModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-gray-800">{payModal.studentName}</p>
                <p className="text-gray-500">{payModal.item?.itemName} — {payModal.item?.size}</p>
                <div className="flex gap-4 pt-2 text-xs font-semibold">
                  <span>Total: <span className="text-gray-700">{fmt(payModal.toBePaid)}</span></span>
                  <span>Paid: <span className="text-emerald-600">{fmt(payModal.paid)}</span></span>
                  <span>Left: <span className="text-red-500">{fmt(payLeft)}</span></span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₹) *</label>
                <input type="number" min="1" max={payLeft} value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} placeholder={`Max ${fmt(payLeft)}`} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Date</label>
                <input type="date" value={payForm.payment_date} onChange={(e) => setPayForm((f) => ({ ...f, payment_date: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks (optional)</label>
                <input value={payForm.remarks} onChange={(e) => setPayForm((f) => ({ ...f, remarks: e.target.value }))} placeholder="Cash / UPI / note..." className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAddPayment} disabled={paySaving} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {paySaving && <Loader2 className="w-4 h-4 animate-spin" />} Record Payment
              </button>
              <button onClick={() => setPayModal(null)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
