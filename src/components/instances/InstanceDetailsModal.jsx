import { X, Server, Cpu, HardDrive, Network, Calendar, MapPin, Globe } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function InstanceDetailsModal({ instance, isOpen, onClose }) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen || !instance) return null;

  const getStatusColor = (val) => {
    if (val > 80) return 'text-red-600';
    if (val > 60) return 'text-amber-600';
    return 'text-green-600';
  };

  const getBarColor = (val) => {
    if (val > 80) return 'bg-red-500';
    if (val > 60) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Details for ${instance.name}`} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-navy-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-navy-100 p-2">
              <Server size={20} className="text-navy-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-900">{instance.name}</h3>
              <p className="text-xs text-navy-500">{instance.id}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close details" className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <StatusBadge status={instance.state} size="lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <Server size={14} /> Instance Type
            </div>
            <p className="text-sm font-medium text-navy-900">{instance.type}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <MapPin size={14} /> Region
            </div>
            <p className="text-sm font-medium text-navy-900">{instance.region}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <MapPin size={14} /> Availability Zone
            </div>
            <p className="text-sm font-medium text-navy-900">{instance.az}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <Globe size={14} /> Private IP
            </div>
            <p className="text-sm font-medium text-navy-900">{instance.privateIp}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <Globe size={14} /> Public IP
            </div>
            <p className="text-sm font-medium text-navy-900">{instance.publicIp}</p>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <Calendar size={14} /> Launch Time
            </div>
            <p className="text-sm font-medium text-navy-900">{new Date(instance.launchTime).toLocaleString()}</p>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-navy-900 mb-3">Resource Utilization</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-navy-500"><Cpu size={14} /> CPU</div>
              <span className={`text-sm font-bold ${getStatusColor(instance.cpu)}`}>{instance.cpu}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-navy-200">
              <div className={`h-1.5 rounded-full transition-all ${getBarColor(instance.cpu)}`} style={{ width: `${instance.cpu}%` }} />
            </div>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-navy-500"><HardDrive size={14} /> Disk</div>
              <span className={`text-sm font-bold ${getStatusColor(instance.diskUsage)}`}>{instance.diskUsage}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-navy-200">
              <div className={`h-1.5 rounded-full transition-all ${getBarColor(instance.diskUsage)}`} style={{ width: `${instance.diskUsage}%` }} />
            </div>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-navy-500"><Network size={14} /> Net In</div>
              <span className="text-sm font-bold text-navy-900">{instance.networkIn} MB/s</span>
            </div>
          </div>
          <div className="rounded-lg bg-navy-50 border border-navy-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-navy-500"><Network size={14} /> Net Out</div>
              <span className="text-sm font-bold text-navy-900">{instance.networkOut} MB/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
