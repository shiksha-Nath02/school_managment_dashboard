import { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import svc from '@/services/bookService';

// Must match the backend ENUM on book_payments.payment_method.
export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'upi',           label: 'UPI' },
  { value: 'online',        label: 'Online' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const emptyForm = () => ({ student_name: '', father_phone: '', admission_number: '', item_id: '', quantity: 1, discount: '', amount_paying: '', payment_method: 'cash' });

// Self-contained "Sell Book" dialog. Loads its own stock, records the sale, and
// calls onSold(transaction) on success. Used from the Books tab and the Bulk
// Payment tab so behaviour stays identical.
export default function BookSellModal({ open, onClose, onSold, showToast }) {
  const [items, setItems]       = useState([]);
  const [sellForm, setSellForm] = useState(emptyForm());
  const [sellSaving, setSellSaving] = useState(false);
  const [matched, setMatched]   = useState(null); // null=not checked, false=no match, object=found

  const toast = useCallback((type, msg) => { if (showToast) showToast(type, msg); }, [showToast]);

  const loadItems = useCallback(async () => {
    try { const d = await svc.getItems(); setItems(d.items || []); }
    catch { toast('error', 'Failed to load books'); }
  }, [toast]);

  useEffect(() => {
    if (!open) return;
    setSellForm(emptyForm());
    setMatched(null);
    loadItems();
  }, [open, loadItems]);

  const selectedItem = items.find((i) => i.id === parseInt(sellForm.item_id, 10));
  const gross     = selectedItem ? parseFloat(selectedItem.price) * (parseInt(sellForm.quantity, 10) || 1) : 0;
  const discount  = Math.min(Math.max(parseFloat(sellForm.discount) || 0, 0), gross);
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
    if (!sellForm.student_name || !sellForm.item_id) return toast('error', 'Student name and book are required');
    setSellSaving(true);
    try {
      const d = await svc.sellItem({ ...sellForm, quantity: parseInt(sellForm.quantity, 10) || 1 });
      if (onSold) onSold(d.transaction);
      toast('success', 'Sale recorded');
      onClose();
    } catch (e) { toast('error', e.response?.data?.message || 'Failed to record sale'); }
    finally { setSellSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-gray-900">Sell Book</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Book *</label>
              <select value={sellForm.item_id} onChange={(e) => setSellForm((f) => ({ ...f, item_id: e.target.value, amount_paying: '' }))} className={inputCls}>
                <option value="">— Choose —</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id} disabled={i.unitsAvailable === 0}>
                    {i.bookName}{i.className ? ` (${i.className})` : ''} — {fmt(i.price)} {i.unitsAvailable === 0 ? '(Out of stock)' : `(${i.unitsAvailable} left)`}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paying Now (₹)</label>
                  <input type="number" min="0" max={toPay} value={sellForm.amount_paying} onChange={(e) => setSellForm((f) => ({ ...f, amount_paying: e.target.value }))} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
                  <select value={sellForm.payment_method} onChange={(e) => setSellForm((f) => ({ ...f, payment_method: e.target.value }))} className={inputCls}>
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
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
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
