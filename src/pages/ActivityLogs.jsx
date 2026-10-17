import { useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import useApi from '../hooks/useApi';
import { activityService } from '../services/activityService';

const ITEMS_PER_PAGE = 10;

const actionOptions = ['ALL', 'LOGIN', 'LOGOUT', 'START_INSTANCE', 'STOP_INSTANCE', 'RESTART_INSTANCE', 'RESOLVE_ALERT', 'UPDATE_USER_ROLE', 'TRIGGER_ALERT', 'SCALE_UP', 'CREATE_SNAPSHOT', 'MODIFY_INSTANCE', 'BACKUP_COMPLETE', 'DEPLOY_APPLICATION', 'UPDATE_SECURITY_GROUP', 'VIEW_LOGS'];
const userOptions = ['ALL', 'Admin User', 'Operator User', 'Viewer User', 'System', 'Sarah Chen', 'Mike Johnson'];

export default function ActivityLogs() {
  const { data, loading, error, retry } = useApi(() => activityService.getAll(), []);
  const activities = data ?? [];

  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to the first page whenever the filters change (in the handler, not an effect).
  const applySearch = (value) => { setSearch(value); setCurrentPage(1); };
  const applyUserFilter = (value) => { setUserFilter(value); setCurrentPage(1); };
  const applyActionFilter = (value) => { setActionFilter(value); setCurrentPage(1); };

  const filtered = useMemo(() => activities.filter((a) => {
    const matchesSearch = search === '' || a.user.toLowerCase().includes(search.toLowerCase()) || a.action.toLowerCase().includes(search.toLowerCase()) || a.resource.toLowerCase().includes(search.toLowerCase());
    const matchesUser = userFilter === 'ALL' || a.user === userFilter;
    const matchesAction = actionFilter === 'ALL' || a.action === actionFilter;
    return matchesSearch && matchesUser && matchesAction;
  }), [activities, search, userFilter, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div>
      <PageHeader title="Activity Logs" subtitle="Audit trail of all cloud operations and user actions" />

      {loading ? (
        <LoadingSpinner text="Loading activity logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SearchInput value={search} onChange={applySearch} placeholder="Search activities..." className="w-64" />
            <select value={userFilter} onChange={(e) => applyUserFilter(e.target.value)} aria-label="Filter by user" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              {userOptions.map((u) => <option key={u} value={u}>{u === 'ALL' ? 'All Users' : u}</option>)}
            </select>
            <select value={actionFilter} onChange={(e) => applyActionFilter(e.target.value)} aria-label="Filter by action" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              {actionOptions.map((a) => <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          {paginated.length === 0 ? (
            <EmptyState title="No activities found" description="Try adjusting your search or filters." />
          ) : (
            <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Resource</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Result</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {paginated.map((activity) => (
                      <tr key={activity.id} className="transition-colors hover:bg-navy-50">
                        <td className="px-4 py-3 text-sm text-navy-600">{new Date(activity.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-medium text-navy-900">{activity.user}</td>
                        <td className="px-4 py-3 text-sm text-navy-600">
                          <span className="rounded-md bg-navy-100 px-2 py-0.5 text-xs font-mono">{activity.action}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-600">{activity.resource}</td>
                        <td className="px-4 py-3"><StatusBadge status={activity.result} /></td>
                        <td className="px-4 py-3  text-navy-500 font-mono text-xs">{activity.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4">
                <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
