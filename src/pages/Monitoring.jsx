import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import PageHeader from '../components/common/PageHeader';
import ChartCard from '../components/common/ChartCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import useApi from '../hooks/useApi';
import { instanceService } from '../services/instanceService';
import { monitoringService } from '../services/monitoringService';

const timeRanges = [
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
];

function makeHourlyData(baseData, hours) {
  return baseData.slice(0, hours);
}

export default function Monitoring() {
  const [selectedInstance, setSelectedInstance] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  const { data, loading, error, retry } = useApi(async () => {
    const [instances, metrics] = await Promise.all([
      instanceService.getAll(),
      monitoringService.getMetrics(selectedInstance, timeRange),
    ]);
    return { instances, metrics };
  }, [selectedInstance, timeRange]);

  const instances = data?.instances ?? [];
  const metrics = data?.metrics ?? {};

  const hours = timeRange === '1h' ? 2 : timeRange === '6h' ? 6 : timeRange === '7d' ? 24 : 24;
  const cpuData = makeHourlyData(metrics.cpu ?? [], hours);
  const networkInMetrics = metrics.networkIn ?? [];
  const networkOutMetrics = metrics.networkOut ?? [];
  const diskMetrics = metrics.disk ?? [];
  const memoryMetrics = metrics.memory ?? [];

  const healthData = instances.map((i) => {
    let status = 'healthy';
    if (i.cpu > 80 || i.diskUsage > 90) status = 'critical';
    else if (i.cpu > 60 || i.diskUsage > 75) status = 'warning';
    if (i.state !== 'running') status = 'critical';
    return { ...i, healthStatus: status };
  });

  return (
    <div>
      <PageHeader title="Monitoring" subtitle="Real-time infrastructure performance metrics" />

      {loading ? (
        <LoadingSpinner text="Loading metrics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select
              value={selectedInstance}
              onChange={(e) => setSelectedInstance(e.target.value)}
              aria-label="Select instance"
              className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
            >
              <option value="all">All Instances</option>
              {instances.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <div className="flex items-center gap-1 rounded-lg border border-navy-200 bg-white p-0.5 shadow-sm" role="group" aria-label="Time range">
              {timeRanges.map((tr) => (
                <button
                  key={tr.value}
                  onClick={() => setTimeRange(tr.value)}
                  aria-pressed={timeRange === tr.value}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    timeRange === tr.value ? 'bg-navy-900 text-white' : 'text-navy-500 hover:text-navy-900'
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="CPU Utilization" subtitle="Average CPU usage over the selected period">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Network In" subtitle="Inbound network traffic">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={networkInMetrics}>
                  <defs>
                    <linearGradient id="netInGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} unit=" MB" />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} fill="url(#netInGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Network Out" subtitle="Outbound network traffic">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={networkOutMetrics}>
                  <defs>
                    <linearGradient id="netOutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} unit=" MB" />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2} fill="url(#netOutGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Disk & Memory Usage" subtitle="Storage and memory utilization over time">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={diskMetrics.map((d, idx) => ({ ...d, memory: memoryMetrics[idx]?.value || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} dot={false} name="Disk" />
                  <Line type="monotone" dataKey="memory" stroke="#16a34a" strokeWidth={2} dot={false} name="Memory" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-navy-200">
              <h3 className="text-sm font-semibold text-navy-900">Resource Health</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                    <tr className="border-b border-navy-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Resource</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">CPU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Memory</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Disk</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Last Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {healthData.map((resource) => (
                    <tr key={resource.id} className="transition-colors hover:bg-navy-50">
                      <td className="px-4 py-3 text-sm font-medium text-navy-900">{resource.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={resource.healthStatus} /></td>
                      <td className="px-4 py-3 text-sm text-navy-600">{resource.state === 'running' ? `${resource.cpu}%` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-navy-600">{resource.state === 'running' ? `${resource.memoryUsage}%` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-navy-600">{`${resource.diskUsage}%`}</td>
                      <td className="px-4 py-3 text-xs text-navy-500">Just now</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
