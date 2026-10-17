export default function ChartCard({ title, subtitle, children, className = '', headerRight }) {
  return (
    <div className={`rounded-2xl border border-navy-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-navy-400">{subtitle}</p>}
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      {children}
    </div>
  );
}
