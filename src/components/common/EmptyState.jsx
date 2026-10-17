import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', description = 'Try adjusting your search or filters.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Icon size={40} className="text-navy-300" />
      <p className="text-base font-medium text-navy-700">{title}</p>
      <p className="text-sm text-navy-400">{description}</p>
    </div>
  );
}
