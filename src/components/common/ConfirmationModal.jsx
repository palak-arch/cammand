import { AlertTriangle, X } from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'primary' }) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const btnClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-navy-900 hover:bg-navy-800 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-xl border border-navy-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-50 p-2">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm text-navy-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-600 hover:bg-navy-50 hover:text-navy-900 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${btnClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
