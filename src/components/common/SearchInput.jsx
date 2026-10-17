import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-200 bg-white py-2 pl-10 pr-4 text-sm text-navy-900 placeholder-navy-400 outline-none transition-colors focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
      />
    </div>
  );
}
