import { useMemo, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Eye } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import useApi from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { alertService } from '../services/alertService';

export default function Alerts() {
  const { success, error: showError } = useToast();
  const { data, loading, error, retry, setData: setAlerts } = useApi(() => alertService.getAll(), []);
  const alerts = data ?? [];

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleAcknowledge = async (id) => {
    try {
      await alertService.acknowledge(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true, status: 'acknowledged' } : a)));
      success('Alert acknowledged');
    } catch (err) {
      showError(err?.message || 'Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertService.resolve(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved', acknowledged: true, resolvedAt: new Date().toISOString() } : a)));
      setSelectedAlert((prev) => (prev?.id === id ? { ...prev, status: 'resolved', resolvedAt: new Date().toISOString() } : prev));
      success('Alert resolved');
    } catch (err) {
      showError(err?.message || 'Failed to resolve alert');
    }
  };

  const filtered = useMemo(() => alerts.filter((a) => {
    const matchesSearch = search === '' || a.title.toLowerCase().includes(search.toLowerCase()) || a.resource.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  }), [alerts, search, severityFilter, statusFilter]);

  const total = alerts.length;
  const critical = alerts.filter((a) => a.severity === 'critical').length;
  const warnings = alerts.filter((a) => a.severity === 'warning').length;
  const resolved = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div>
      <PageHeader title="Alerts" subtitle="Centralized alert management and incident response" />

      {loading ? (
        <LoadingSpinner text="Loading alerts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard icon={AlertTriangle} label="Total Alerts" value={total} subtext="All alerts" color="blue" />
            <MetricCard icon={AlertCircle} label="Critical" value={critical} subtext="Immediate action" color="red" />
            <MetricCard icon={Info} label="Warnings" value={warnings} subtext="Needs attention" color="yellow" />
            <MetricCard icon={CheckCircle} label="Resolved" value={resolved} subtext="No action needed" color="green" />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search alerts..." className="w-64" />
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} aria-label="Filter by severity" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No alerts found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-navy-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Alert ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Resource</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((alert) => (
                    <tr key={alert.id} className="transition-colors hover:bg-navy-50">
                      <td className="px-4 py-3 font-mono text-xs text-navy-600">{alert.id}</td>
                      <td className="px-4 py-3"><StatusBadge status={alert.severity} /></td>
                      <td className="px-4 py-3 text-sm font-medium text-navy-900">{alert.title}</td>
                      <td className="px-4 py-3 text-sm text-navy-600">{alert.resource}</td>
                      <td className="px-4 py-3"><StatusBadge status={alert.status} /></td>
                      <td className="px-4 py-3 text-sm text-navy-500">{new Date(alert.created).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedAlert(alert)} className="rounded-lg p-1.5 text-navy-600 hover:bg-navy-100 transition-colors" title="View" aria-label={`View alert ${alert.title}`}>
                            <Eye size={16} />
                          </button>
                          {alert.status === 'active' && (
                            <button onClick={() => handleAcknowledge(alert.id)} className="rounded-lg px-2 py-1 text-xs text-navy-600 hover:bg-navy-100 transition-colors font-medium">
                              Acknowledge
                            </button>
                          )}
                          {(alert.status === 'active' || alert.status === 'acknowledged') && (
                            <button onClick={() => handleResolve(alert.id)} className="rounded-lg px-2 py-1 text-xs text-green-600 hover:bg-green-50 transition-colors font-medium">
                              Resolve
                            </button>
                          )}
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

      <AlertDetailsModal alert={selectedAlert} isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} onResolve={handleResolve} />
    </div>
  );
}
