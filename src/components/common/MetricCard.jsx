import { TrendingUp, TrendingDown } from 'lucide-react';

const styles = {
  blue: {
    iconBg: 'bg-navy-100 ring-1 ring-navy-200',
    iconColor: 'text-navy-700',
    cardBorder: 'border-navy-200 hover:border-navy-300',
    glow: 'hover:shadow-[0_0_30px_-5px] hover:shadow-navy-300/30',
  },
  green: {
    iconBg: 'bg-green-50 ring-1 ring-green-200',
    iconColor: 'text-green-600',
    cardBorder: 'border-green-200 hover:border-green-300',
    glow: 'hover:shadow-[0_0_30px_-5px] hover:shadow-green-300/30',
  },
  yellow: {
    iconBg: 'bg-amber-50 ring-1 ring-amber-200',
    iconColor: 'text-amber-600',
    cardBorder: 'border-amber-200 hover:border-amber-300',
    glow: 'hover:shadow-[0_0_30px_-5px] hover:shadow-amber-300/30',
  },
  red: {
    iconBg: 'bg-red-50 ring-1 ring-red-200',
    iconColor: 'text-red-600',
    cardBorder: 'border-red-200 hover:border-red-300',
    glow: 'hover:shadow-[0_0_30px_-5px] hover:shadow-red-300/30',
  },
};

export default function MetricCard({ icon: Icon, label, value, subtext, trend, trendUp, color = 'blue' }) {
  const s = styles[color] || styles.blue;

  return (
    <div className={`relative group rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${s.cardBorder} ${s.glow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`rounded-xl p-2.5 ${s.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} className={s.iconColor} />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-navy-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-navy-900 tracking-tight">{value}</p>
      </div>
      {subtext && (
        <p className="mt-2 text-xs text-navy-400">{subtext}</p>
      )}
    </div>
  );
}
