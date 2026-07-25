import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { EmptyState, Spinner } from '../components/ui';
import { timeAgo } from '../lib/format';

interface Row {
  id: string;
  action: string;
  parentType: string | null;
  detail: string | null;
  userName: string | null;
  createdAt: string;
}

export function Activity() {
  const { data, isLoading } = useQuery({
    queryKey: ['global-activity'],
    queryFn: () => api.get<Row[]>('/activity'),
  });
  if (isLoading) return <Spinner />;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Activity log</h1>
      {!data?.length ? (
        <EmptyState title="No activity yet" hint="Every create, update and decision is recorded here." />
      ) : (
        <div className="card divide-y divide-line text-sm">
          {data.map((a) => (
            <div key={a.id} className="flex items-baseline gap-3 px-4 py-2">
              <span className="w-28 shrink-0 text-xs text-muted">{timeAgo(a.createdAt)}</span>
              <span className="flex-1">
                <span className="font-medium">{a.userName || 'System'}</span>{' '}
                <span className="text-muted">{a.action.replace(/_/g, ' ')}</span>
                {a.parentType && <span className="text-muted"> · {a.parentType}</span>}
                {a.detail && <span> — {a.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
