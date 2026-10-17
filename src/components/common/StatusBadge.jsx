export default function StatusBadge({ status, size = 'sm' }) {
  const config = {
    running: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Running' },
    healthy: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Healthy' },
    success: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Success' },
    active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Active' },
    stopped: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Stopped' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Warning' },
    pending: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Pending' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Critical' },
    resolved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Resolved' },
    acknowledged: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Acknowledged' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Info' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Failed' },
    inactive: { bg: 'bg-navy-100', text: 'text-navy-500', dot: 'bg-navy-400', label: 'Inactive' },
  };

  const c = config[status?.toLowerCase()] || { bg: 'bg-navy-100', text: 'text-navy-500', dot: 'bg-navy-400', label: status };
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${c.bg} ${c.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
