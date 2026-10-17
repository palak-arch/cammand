import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="rounded-full bg-red-50 p-3">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <p className="text-base font-medium text-navy-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors">
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}
