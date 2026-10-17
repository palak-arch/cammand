import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function AlertDetailsModal({ alert, isOpen, onClose, onResolve }) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen || !alert) return null;

  const icons = { critical: AlertCircle, warning: AlertTriangle, info: Info };
  const Icon = icons[alert.severity] || AlertTriangle;
  const iconColor = alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={alert.title} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-navy-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${alert.severity === 'critical' ? 'bg-red-50' : alert.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
              <Icon size={20} className={iconColor} />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">{alert.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close alert details" className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <span className="text-xs text-navy-500 mr-2">Severity</span>
          <StatusBadge status={alert.severity} size="lg" />
        </div>

        <p className="text-sm text-navy-600 mb-4">{alert.message}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <p className="text-xs text-navy-500 mb-0.5">Affected Resource</p>
            <p className="text-sm font-medium text-navy-900">{alert.resource}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <p className="text-xs text-navy-500 mb-0.5">Status</p>
            <StatusBadge status={alert.status} />
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <p className="text-xs text-navy-500 mb-0.5">Created</p>
            <p className="text-sm font-medium text-navy-900">{new Date(alert.created).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <p className="text-xs text-navy-500 mb-0.5">Alert ID</p>
            <p className="text-sm font-medium text-navy-900 font-mono">{alert.id}</p>
          </div>
        </div>

        {alert.resolvedAt && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-700">Resolved at {new Date(alert.resolvedAt).toLocaleString()}</span>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-navy-900 mb-2">Incident Timeline</h4>
          <div className="space-y-2">
            {alert.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-navy-900 mt-1.5" />
                  {idx < alert.timeline.length - 1 && <div className="w-px h-full bg-navy-200" />}
                </div>
                <div className="pb-2">
                  <p className="text-sm text-navy-700">{event.event}</p>
                  <p className="text-xs text-navy-400">{new Date(event.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {alert.status !== 'resolved' && (
          <button
            onClick={() => onResolve?.(alert.id)}
            className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white py-2 text-sm font-medium transition-colors"
          >
            Resolve Alert
          </button>
        )}
      </div>
    </div>
  );
}
