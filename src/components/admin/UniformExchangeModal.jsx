import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Loader2, ArrowLeftRight, Undo2, ArrowRight } from 'lucide-react';
import svc from '@/services/uniformService';

const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'upi',           label: 'UPI' },
  { value: 'online',        label: 'Online' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Normalise a sale into a flat list of exchangeable lines. Multi-item sales carry
// their lines in `items`; legacy single-item sales carry the item inline.
const linesOf = (txn) => {
  if (txn.items && txn.items.length > 0) {
    return txn.items.map((li) => ({
      lineId: li.id, itemId: li.itemId, itemName: li.itemName, size: li.size,
      quantity: li.quantity, unitPrice: li.unitPrice, lineTotal: li.lineTotal,
    }));
  }
  if (txn.item) {
    // One line; its total is the whole (pre-discount) bill.
    return [{
      lineId: null, itemId: txn.item.id, itemName: txn.item.itemName, size: txn.item.size,
      quantity: txn.quantity, unitPrice: txn.item.price,
      lineTotal: parseFloat(txn.toBePaid) + parseFloat(txn.discount || 0),
    }];
  }
  return [];
};

// One dialog for both flows:
//   mode="exchange" — swap a line's size and settle the price difference
//   mode="return"   — hand the whole sale back and refund what was paid
export default function UniformExchangeModal({ open, mode, txn, onClose, onDone, showToast }) {
  const [items, setItems]   = useState([]);
  const [saving, setSaving] = useState(false);

  // exchange state
  const [lineId, setLineId]         = useState(null);
  const [newItemId, setNewItemId]   = useState('');
  const [collect, setCollect]       = useState('');           // amount taken now when dearer
  const [refundMode, setRefundMode] = useState('cash');       // 'cash' | 'fees' when cheaper / returning
  const [method, setMethod]         = useState('cash');       // payment method for collect / cash refund

  const toast = useCallback((type, msg) => { if (showToast) showToast(type, msg); }, [showToast]);

  const lines = useMemo(() => (txn ? linesOf(txn) : []), [txn]);
  const currentLine = lines.find((l) => l.lineId === lineId) || lines[0] || null;

  useEffect(() => {
    if (!open) return;
    setNewItemId(''); setCollect(''); setRefundMode('cash'); setMethod('cash');
    setLineId(txn && linesOf(txn)[0] ? linesOf(txn)[0].lineId : null);
    if (mode === 'exchange') {
      svc.getItems().then((d) => setItems(d.items || [])).catch(() => toast('error', 'Failed to load stock'));
    }
  }, [open, mode, txn, toast]);

  // When a new (dearer) size is picked, prefill the amount to collect with the
  // exact difference so staff just confirm; they can still edit for a part-payment.
  useEffect(() => {
    if (!open || mode !== 'exchange' || !txn || !newItemId) return;
    const ln = linesOf(txn).find((l) => l.lineId === lineId) || linesOf(txn)[0];
    const ni = items.find((i) => i.id === parseInt(newItemId, 10));
    if (!ln || !ni) return;
    const nb = parseFloat(txn.toBePaid) - parseFloat(ln.lineTotal) + parseFloat(ni.price) * ln.quantity;
    const ow = Math.max(0, nb - parseFloat(txn.paid || 0));
    setCollect(ow > 0 ? String(ow) : '');
  }, [newItemId, lineId, items, open, mode, txn]);

  if (!open || !txn) return null;

  const paid = parseFloat(txn.paid || 0);

  // ── exchange math ──────────────────────────────────────────────────────────
  const sizeOptions = currentLine ? items.filter((i) => i.itemName === currentLine.itemName) : [];
  const newItem = items.find((i) => i.id === parseInt(newItemId, 10)) || null;
  const newLineTotal = newItem ? parseFloat(newItem.price) * (currentLine?.quantity || 1) : 0;
  const newToBePaid = currentLine && newItem
    ? parseFloat(txn.toBePaid) - parseFloat(currentLine.lineTotal) + newLineTotal
    : parseFloat(txn.toBePaid);
  const owed   = newItem ? Math.max(0, newToBePaid - paid) : 0;  // dearer → collect
  const refund = newItem ? Math.max(0, paid - newToBePaid) : 0;  // cheaper → give back
  const collectNum = Math.min(Math.max(parseFloat(collect) || 0, 0), owed);

  const canAdjustFees = !!txn.studentLinked; // needs a linked student's fee account

  const doExchange = async () => {
    if (!newItem) return toast('error', 'Choose the new size');
    if (newItem.id === currentLine.itemId) return toast('error', 'Pick a different size');
    if (newItem.unitsAvailable < currentLine.quantity) return toast('error', 'New size is out of stock');
    const settlement = {};
    if (owed > 0)   { settlement.mode = 'collect'; settlement.amount = collectNum; settlement.payment_method = method; }
    if (refund > 0) { settlement.mode = refundMode; if (refundMode === 'cash') settlement.payment_method = method; }
    setSaving(true);
    try {
      const d = await svc.exchangeItem(txn.id, { line_id: currentLine.lineId, new_item_id: newItem.id, settlement });
      onDone(d.transaction, d.feeReceipt, 'Exchange recorded');
      onClose();
    } catch (e) { toast('error', e.response?.data?.message || 'Exchange failed'); }
    finally { setSaving(false); }
  };

  const doReturn = async () => {
    const settlement = { mode: refundMode };
    if (refundMode === 'cash') settlement.payment_method = method;
    setSaving(true);
    try {
      const d = await svc.returnTransaction(txn.id, { settlement });
      onDone(d.transaction, d.feeReceipt, 'Return recorded');
      onClose();
    } catch (e) { toast('error', e.response?.data?.message || 'Return failed'); }
    finally { setSaving(false); }
  };

  const isExchange = mode === 'exchange';

  // Refund option toggle (shared by cheaper-exchange and return).
  const RefundChoice = ({ amount }) => (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Refund <span className="font-bold text-gray-900">{fmt(amount)}</span> to the student:</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setRefundMode('cash')}
          className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${refundMode === 'cash' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          Return cash
        </button>
        <button type="button" onClick={() => canAdjustFees && setRefundMode('fees')} disabled={!canAdjustFees}
          className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${refundMode === 'fees' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} disabled:opacity-40 disabled:cursor-not-allowed`}>
          Adjust in fees
        </button>
      </div>
      {!canAdjustFees && <p className="text-xs text-amber-600">Not linked to a student — only a cash refund is possible.</p>}
      {refundMode === 'fees' && canAdjustFees && (
        <p className="text-xs text-emerald-600">{fmt(amount)} will be credited to the student's fee account as advance.</p>
      )}
      {refundMode === 'cash' && (
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
          {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-gray-900 flex items-center gap-2">
            {isExchange ? <ArrowLeftRight className="w-5 h-5 text-brand-500" /> : <Undo2 className="w-5 h-5 text-brand-500" />}
            {isExchange ? 'Exchange Size' : 'Return Sale'}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="font-semibold text-gray-800">{txn.studentName}</p>
            <p className="text-gray-500 text-xs">{txn.admissionNumber || txn.fatherPhone || '—'} · Paid {fmt(paid)}</p>
          </div>

          {isExchange ? (
            <>
              {/* Which line (only if there are several) */}
              {lines.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Which item?</label>
                  <select value={lineId ?? ''} onChange={(e) => { setLineId(e.target.value ? parseInt(e.target.value, 10) : null); setNewItemId(''); }} className={inputCls}>
                    {lines.map((l) => <option key={l.lineId} value={l.lineId ?? ''}>{l.itemName} (Size {l.size}) × {l.quantity}</option>)}
                  </select>
                </div>
              )}

              {currentLine && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                    <p className="text-[11px] text-gray-400 uppercase font-semibold">Current</p>
                    <p className="font-medium text-gray-800">{currentLine.itemName} · Size {currentLine.size}</p>
                    <p className="text-xs text-gray-500">{fmt(currentLine.unitPrice)} × {currentLine.quantity}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">New size</label>
                    <select value={newItemId} onChange={(e) => setNewItemId(e.target.value)} className={inputCls}>
                      <option value="">— Choose —</option>
                      {sizeOptions.map((i) => (
                        <option key={i.id} value={i.id} disabled={i.id === currentLine.itemId || i.unitsAvailable < currentLine.quantity}>
                          {i.size} — {fmt(i.price)} {i.id === currentLine.itemId ? '(current)' : i.unitsAvailable < currentLine.quantity ? '(out)' : `(${i.unitsAvailable})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Settlement */}
              {newItem && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">New bill</span>
                    <span className="font-semibold text-gray-800">{fmt(newToBePaid)}</span>
                  </div>

                  {owed > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Student pays extra: <span className="font-bold text-gray-900">{fmt(owed)}</span></p>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" min="0" max={owed} value={collect} onChange={(e) => setCollect(e.target.value)}
                          placeholder={`e.g. ${owed}`} className={inputCls} />
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
                          {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>
                      {collectNum < owed && <p className="text-xs text-amber-600">{fmt(owed - collectNum)} will stay pending on this sale.</p>}
                    </div>
                  )}

                  {refund > 0 && <RefundChoice amount={refund} />}

                  {owed === 0 && refund === 0 && (
                    <p className="text-sm text-emerald-600 font-medium">Same price — nothing to settle.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* RETURN */
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                {lines.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-gray-700 font-medium">{l.itemName} <span className="text-gray-400">· Size {l.size}</span></span>
                    <span className="text-gray-500">× {l.quantity}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">All items above go back into stock.</p>
              {paid > 0
                ? <div className="bg-brand-50 border border-brand-100 rounded-xl p-4"><RefundChoice amount={paid} /></div>
                : <p className="text-sm text-gray-500">Nothing was paid — no refund needed.</p>}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={isExchange ? doExchange : doReturn}
            disabled={saving || (isExchange && !newItem)}
            className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isExchange ? 'Confirm Exchange' : 'Confirm Return'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
