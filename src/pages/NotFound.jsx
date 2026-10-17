import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-100 px-4 text-center">
      <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-navy-200">
        <Compass size={32} className="text-navy-700" />
      </div>
      <h1 className="text-3xl font-bold text-navy-900">Page not found</h1>
      <p className="max-w-md text-sm text-navy-500">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800"
      >
        Back to home
      </Link>
    </div>
  );
}