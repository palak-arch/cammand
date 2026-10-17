export const inputClass =
  'w-full rounded-lg border border-navy-200 bg-navy-50 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder-navy-400 focus:border-navy-400 focus:ring-1 focus:ring-navy-400';

export const selectClass =
  'w-full rounded-lg border border-navy-200 bg-navy-50 px-3 py-2 text-sm text-navy-900 outline-none transition-colors focus:border-navy-400 focus:ring-1 focus:ring-navy-400';

/** Inline `<select>` used next to search inputs in filter rows. */
export const filterSelectClass =
  'rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition-colors focus:border-navy-400 focus:ring-1 focus:ring-navy-400';

export function Field({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm text-navy-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Toggle({ id, enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-navy-900">{label}</p>
        {description && <p className="text-xs text-navy-500">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-navy-900' : 'bg-navy-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}