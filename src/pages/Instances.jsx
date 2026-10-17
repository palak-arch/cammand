import { useMemo, useState } from 'react';
import { RefreshCw, Play, Square, RotateCcw } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import SearchInput from '../components/common/SearchInput';
import ConfirmationModal from '../components/common/ConfirmationModal';
import InstanceDetailsModal from '../components/instances/InstanceDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import useApi from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { instanceService } from '../services/instanceService';
import { instanceTypes, regions } from '../data/mockInstances';

const instanceActions = [
  { key: 'start', label: 'Start', icon: Play, color: 'text-green-600 hover:bg-green-50' },
  { key: 'stop', label: 'Stop', icon: Square, color: 'text-amber-600 hover:bg-amber-50' },
  { key: 'restart', label: 'Restart', icon: RotateCcw, color: 'text-navy-600 hover:bg-navy-100' },
];

export default function Instances() {
  const { success, error: showError } = useToast();
  const { data: instances = [], loading, error, retry, setData: setInstances } = useApi(() => instanceService.getAll(), []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...instances];
    if (search) result = result.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') result = result.filter((i) => i.state === statusFilter);
    if (typeFilter !== 'all') result = result.filter((i) => i.type === typeFilter);
    if (regionFilter !== 'all') result = result.filter((i) => i.region === regionFilter);
    return result;
  }, [instances, search, statusFilter, typeFilter, regionFilter]);

  const executeAction = async () => {
    if (!confirmAction) return;
    const { instance, action } = confirmAction;
    setConfirmAction(null);

    const serviceAction = {
      start: instanceService.start,
      stop: instanceService.stop,
      restart: instanceService.restart,
    }[action];

    try {
      await serviceAction(instance.id);
      setInstances((prev) =>
        prev.map((i) => {
          if (i.id !== instance.id) return i;
          if (action === 'start') return { ...i, state: 'running', cpu: Math.floor(Math.random() * 40) + 10 };
          if (action === 'stop') return { ...i, state: 'stopped', cpu: 0, networkIn: 0, networkOut: 0, memoryUsage: 0 };
          return { ...i, cpu: Math.floor(Math.random() * 40) + 10 };
        })
      );
      success(`Instance ${action}${action === 'restart' ? 'ed' : 'ed'} successfully`);
    } catch (err) {
      showError(err?.message || `Failed to ${action} instance`);
    }
  };

  const openDetails = (instance) => {
    setSelectedInstance(instance);
    setDetailsOpen(true);
  };

  const getStatusColor = (val) => {
    if (val > 80) return 'text-red-600';
    if (val > 60) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div>
      <PageHeader title="EC2 Instances" subtitle="Manage your virtual server instances">
        <button onClick={retry} className="flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-600 hover:bg-navy-50 hover:text-navy-900 transition-colors shadow-sm">
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      </PageHeader>

      {loading ? (
        <LoadingSpinner text="Loading instances..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search instances..." className="w-64" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="pending">Pending</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by instance type" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              <option value="all">All Types</option>
              {instanceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} aria-label="Filter by region" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              <option value="all">All Regions</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No instances found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-navy-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                    <tr className="border-b border-navy-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Instance ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Private IP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">CPU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((instance) => (
                    <tr key={instance.id} className="transition-colors hover:bg-navy-50 cursor-pointer" onClick={() => openDetails(instance)}>
                      <td className="px-4 py-3 text-sm font-medium text-navy-900">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openDetails(instance); }}
                          className="text-left font-medium text-navy-900 hover:underline"
                          aria-label={`View details for ${instance.name}`}
                        >
                          {instance.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-600 font-mono text-xs">{instance.id}</td>
                      <td className="px-4 py-3 text-sm text-navy-600">{instance.type}</td>
                      <td className="px-4 py-3 text-sm text-navy-600">{instance.region}</td>
                      <td className="px-4 py-3 text-sm text-navy-600 font-mono text-xs">{instance.privateIp}</td>
                      <td className="px-4 py-3"><StatusBadge status={instance.state} /></td>
                      <td className="px-4 py-3 text-sm"><span className={`font-medium ${getStatusColor(instance.cpu)}`}>{instance.cpu}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {instanceActions.map((act) => (
                            <button
                              key={act.key}
                              onClick={() => setConfirmAction({ instance, action: act.key })}
                              className={`rounded-lg p-1.5 transition-colors ${act.color}`}
                              title={act.label}
                              aria-label={`${act.label} ${instance.name}`}
                              disabled={
                                (act.key === 'start' && instance.state === 'running') ||
                                (act.key === 'stop' && instance.state === 'stopped')
                              }
                            >
                              <act.icon size={16} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeAction}
        title={`${confirmAction?.action?.charAt(0).toUpperCase() + confirmAction?.action?.slice(1)} Instance`}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.instance?.name}"?`}
        confirmLabel={confirmAction?.action?.charAt(0).toUpperCase() + confirmAction?.action?.slice(1)}
        confirmVariant={confirmAction?.action === 'stop' ? 'danger' : 'primary'}
      />

      <InstanceDetailsModal instance={selectedInstance} isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </div>
  );
}
