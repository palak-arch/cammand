import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 size={size} className="animate-spin text-navy-700" />
      <p className="text-sm text-navy-500">{text}</p>
    </div>
  );
}
