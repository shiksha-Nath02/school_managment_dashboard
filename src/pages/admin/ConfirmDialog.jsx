import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Simple centered confirmation modal.
 *
 * Props:
 *   open        — whether it's shown
 *   title       — heading text
 *   message     — body text (string or node)
 *   confirmText — label for the confirm button (default "Confirm")
 *   cancelText  — label for the cancel button (default "Cancel")
 *   danger      — red styling for destructive actions
 *   busy        — show a spinner + disable while the action runs
 *   onConfirm / onCancel
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${danger ? 'bg-red-100' : 'bg-brand-50'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-brand-500'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 font-display">{title}</h3>
            <div className="text-sm text-gray-500 mt-1">{message}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
