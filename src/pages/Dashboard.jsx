import { Server, Activity, AlertTriangle, CheckCircle, Cpu, HardDrive, Network, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/common/MetricCard';
import HealthIndicator from '../components/common/HealthIndicator';
import ChartCard from '../components/common/ChartCard';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import useApi from '../hooks/useApi';
import { timeAgo } from '../utils/format';
import { monitoringService } from '../services/monitoringService';
import { alertService } from '../services/alertService';
import { activityService } from '../services/activityService';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-navy-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-medium text-navy-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-navy-900">{payload[0].value}%</p>
    </div>
  );
};

const BAR_COLORS = ['#22c55e', '#f59e0b', '#3b82f6'];

const StackedBar = ({ data, total }) => (
  <div className="flex h-3 rounded-full overflow-hidden bg-navy-100">
    {data.map((item, i) => (
      <div key={item.name} style={{ width: `${(item.value / total) * 100}%`, backgroundColor: BAR_COLORS[i] }} />
    ))}
  </div>
);

function formatAction(action) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const activityIcons = {
  LOGIN: 'text-blue-600 bg-blue-50',
  LOGOUT: 'text-navy-500 bg-navy-100',
  START_INSTANCE: 'text-green-600 bg-green-50',
  STOP_INSTANCE: 'text-amber-600 bg-amber-50',
  RESTART_INSTANCE: 'text-blue-600 bg-blue-50',
  RESOLVE_ALERT: 'text-green-600 bg-green-50',
  TRIGGER_ALERT: 'text-red-600 bg-red-50',
  UPDATE_USER_ROLE: 'text-purple-600 bg-purple-50',
};

const severityStyles = {
  critical: { dot: 'bg-red-500 shadow-red-500/30', border: 'border-l-red-500' },
  warning: { dot: 'bg-amber-500 shadow-amber-500/30', border: 'border-l-amber-500' },
  info: { dot: 'bg-blue-500 shadow-blue-500/30', border: 'border-l-blue-500' },
};

export default function Dashboard() {
  const { data, loading, error, retry } = useApi(async () => {
    const [dashboard, alerts, activities] = await Promise.all([
      monitoringService.getDashboard(),
      alertService.getAll(),
      activityService.getAll(),
    ]);
    return { dashboard, alerts, activities };
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  const { dashboard = {}, alerts = [], activities = [] } = data ?? {};
  const { dashboardSummary = {}, cpu: cpuMetrics = [], resourceStatus = [], systemHealth = {} } = dashboard;

  const recentAlerts = alerts.filter((a) => a.status === 'active').slice(0, 3);
  const recentActivities = activities.slice(0, 6);
  const openAlerts = alerts.filter((a) => a.status !== 'resolved');
  const lastCpu = cpuMetrics.length ? cpuMetrics[cpuMetrics.length - 1].value : 0;
  const prevCpu = cpuMetrics.length > 1 ? cpuMetrics[cpuMetrics.length - 2].value : lastCpu;
  const cpuTrend = lastCpu - prevCpu;
  const totalInstances = dashboardSummary.totalInstances || resourceStatus.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="space-y-8">
      {/* The single page-level heading (h1) — every page owns exactly one via PageHeader. */}
      <PageHeader title="Dashboard" subtitle="Centralized infrastructure monitoring and cloud operations across all regions.">
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 ring-1 ring-green-200 px-2.5 py-1 text-xs font-medium text-green-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-green-500" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          Systems Operational
        </span>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <MetricCard icon={Server} label="Total Instances" value={dashboardSummary.totalInstances ?? 0} subtext="Across all regions" trend={5} trendUp color="blue" />
        <MetricCard icon={Activity} label="Running" value={dashboardSummary.runningInstances ?? 0} subtext="Active now" trend={12} trendUp color="green" />
        <MetricCard icon={Server} label="Stopped" value={dashboardSummary.stoppedInstances ?? 0} subtext="Require attention" trend={8} trendUp={false} color="yellow" />
        <MetricCard icon={AlertTriangle} label="Active Alerts" value={openAlerts.length} subtext="Needs action" trend={25} trendUp={false} color="red" />
        <MetricCard icon={CheckCircle} label="Health" value={dashboardSummary.overallHealth ?? '—'} subtext={`Uptime ${systemHealth.uptime ?? '—'}`} color="green" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CPU Chart */}
        <ChartCard
          title="CPU Utilization"
          subtitle="Average across all instances"
          className="lg:col-span-2"
          headerRight={
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {cpuTrend >= 0 ? (
                <span className="flex items-center gap-1 text-green-600"><ArrowUpRight size={14} />{cpuTrend}%</span>
              ) : (
                <span className="flex items-center gap-1 text-red-600"><ArrowDownRight size={14} />{Math.abs(cpuTrend)}%</span>
              )}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cpuMetrics}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cpuLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6b7280" />
                  <stop offset="50%" stopColor="#111827" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#cpuLine)"
                strokeWidth={2.5}
                fill="url(#cpuGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#111827', fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Health + System */}
        <div className="space-y-4">
          <ChartCard title="Infrastructure Health">
            <HealthIndicator status="healthy" label="All Systems Operational" lastUpdated="Just now" />
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { icon: Cpu, value: `${lastCpu}%`, label: 'CPU', color: 'text-navy-700', bg: 'bg-navy-100' },
                { icon: HardDrive, value: '55%', label: 'Disk', color: 'text-amber-600', bg: 'bg-amber-50' },
                { icon: Network, value: '2.4', label: 'Network', color: 'text-green-600', bg: 'bg-green-50' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-navy-50 border border-navy-200 p-3 text-center transition-colors hover:bg-navy-100">
                  <div className={`inline-flex rounded-lg p-1.5 ${item.bg} mb-2`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <p className="text-lg font-bold text-navy-900">{item.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-navy-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Resource Status">
            <div className="space-y-4">
              <StackedBar data={resourceStatus} total={totalInstances || 1} />
              <div className="grid grid-cols-3 gap-2">
                {resourceStatus.map((item, i) => (
                  <div key={item.name} className="rounded-xl bg-navy-50 border border-navy-200 p-3 text-center">
                    <p className="text-lg font-bold text-navy-900">{item.value}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAR_COLORS[i] }} />
                      <span className="text-[11px] font-medium text-navy-500">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Alerts */}
        <div className="rounded-2xl border border-navy-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">Recent Alerts</h3>
              <p className="text-xs text-navy-500 mt-0.5">Requires immediate attention</p>
            </div>
            <span className="inline-flex items-center justify-center min-w-6 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
              {recentAlerts.length}
            </span>
          </div>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-navy-500 text-center py-6">No active alerts</p>
            ) : (
                recentAlerts.map((alert) => {
                const sev = severityStyles[alert.severity] || severityStyles.info;
                return (
                  <div key={alert.id} className={`rounded-xl border border-navy-200 border-l-4 ${sev.border} bg-white p-4 transition-all hover:shadow-md`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2 w-2 rounded-full shrink-0 shadow-lg ${sev.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-navy-900 truncate">{alert.title}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            alert.severity === 'critical' ? 'bg-red-50 text-red-600' :
                            alert.severity === 'warning' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-navy-500 line-clamp-1 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-3 text-[11px] text-navy-500">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-1 h-1 rounded-full bg-navy-300" />
                            {alert.resource}
                          </span>
                          <span>{new Date(alert.created).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-navy-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">Recent Activity</h3>
              <p className="text-xs text-navy-500 mt-0.5">Latest cloud operations</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-4.75 top-4 bottom-4 w-px bg-navy-200" />
            <div className="space-y-1">
              {recentActivities.map((activity) => {
                const iconClass = activityIcons[activity.action] || 'text-navy-500 bg-navy-100';

                return (
                  <div key={activity.id} className="relative flex items-start gap-3 py-2.5 px-1">
                    <div className={`relative z-10 rounded-lg p-1.5 shrink-0 ring-4 ring-white ${iconClass}`}>
                      <span className="block w-2 h-2 rounded-full bg-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy-700">
                        <span className="font-semibold text-navy-900">{activity.user}</span>
                        {' '}{formatAction(activity.action).toLowerCase()}{' '}
                        <span className="font-medium text-navy-700">{activity.resource}</span>
                      </p>
                      <p className="text-[11px] text-navy-500 mt-0.5">{timeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
