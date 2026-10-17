import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const configs = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    ring: 'ring-green-200',
    pulse: 'bg-green-500',
    label: 'Healthy',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-200',
    pulse: 'bg-amber-500',
    label: 'Warning',
  },
  critical: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-200',
    pulse: 'bg-red-500',
    label: 'Critical',
  },
};

export default function HealthIndicator({ status = 'healthy', label, lastUpdated }) {
  const c = configs[status] || configs.healthy;
  const Icon = c.icon;

  return (
    <div className={`flex items-center gap-3.5 rounded-xl border ring-1 ${c.bg} ${c.border} ${c.ring} px-5 py-3.5`}>
      <div className="relative">
        <Icon size={28} className={c.color} />
        {status === 'healthy' && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${c.pulse}`} />
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.pulse}`} />
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-navy-900">{label || c.label}</p>
        <p className="text-xs text-navy-500 mt-0.5">Operational &mdash; Last updated: {lastUpdated || 'Just now'}</p>
      </div>
    </div>
  );
}
