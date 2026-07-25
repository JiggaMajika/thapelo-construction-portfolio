import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge, Spinner, StatusDot } from '../components/ui';
import { shortDate, timeAgo } from '../lib/format';
import type { BadgeLevel, VendorStatus } from '@shared/types';

interface VendorRow {
  id: string;
  name: string;
  slug: string;
  companyName: string | null;
  status: VendorStatus;
  healthScore: number;
  scoreChange: number;
  isSliding: boolean;
  openIssues: number;
  badgeLevel: BadgeLevel;
  monitoringGroup: string;
  lastVendorUpdateAt: string | null;
  isArchived: boolean;
}

type Filter = 'all' | 'green' | 'amber' | 'red' | 'sliding' | 'issues';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'green', label: 'Green' },
  { key: 'amber', label: 'Amber' },
  { key: 'red', label: 'Red' },
  { key: 'sliding', label: 'Sliding' },
  { key: 'issues', label: 'Has open issues' },
];

export function Vendors() {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get<VendorRow[]>('/vendors'),
  });

  const rows = useMemo(() => {
    let r = (data ?? []).filter((v) => !v.isArchived);
    if (filter === 'sliding') r = r.filter((v) => v.isSliding);
    else if (filter === 'issues') r = r.filter((v) => v.openIssues > 0);
    else if (filter !== 'all') r = r.filter((v) => v.status === filter);
    const s = q.trim().toLowerCase();
    if (s)
      r = r.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          (v.companyName || '').toLowerCase().includes(s),
      );
    return r;
  }, [data, filter, q]);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Vendors</h1>
        <input
          className="input max-w-xs"
          placeholder="Search name or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`pill border ${
              filter === f.key
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-muted hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Score</th>
              <th className="px-4 py-2 font-medium">Change</th>
              <th className="px-4 py-2 font-medium">Last update</th>
              <th className="px-4 py-2 font-medium">Open issues</th>
              <th className="px-4 py-2 font-medium">Badge</th>
              <th className="px-4 py-2 font-medium">Group</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-b border-line last:border-0 hover:bg-fill">
                <td className="px-4 py-2.5">
                  <Link to={`/vendors/${v.slug}`} className="font-medium hover:underline">
                    {v.name}
                  </Link>
                  {v.isSliding && (
                    <span className="ml-2 pill bg-gold/20 text-[#8a6a04]">sliding</span>
                  )}
                  {v.companyName && (
                    <p className="text-xs text-muted">{v.companyName}</p>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <StatusDot status={v.status} />
                </td>
                <td className="px-4 py-2.5 font-semibold">{v.healthScore}</td>
                <td className="px-4 py-2.5">
                  <ScoreChange change={v.scoreChange} />
                </td>
                <td className="px-4 py-2.5 text-muted">{timeAgo(v.lastVendorUpdateAt)}</td>
                <td className="px-4 py-2.5">
                  {v.openIssues > 0 ? (
                    <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-medium">
                      {v.openIssues}
                    </span>
                  ) : (
                    <span className="text-muted">0</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Badge level={v.badgeLevel} />
                </td>
                <td className="px-4 py-2.5 text-muted">{v.monitoringGroup}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">
                  No vendors match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreChange({ change }: { change: number }) {
  if (change === 0) return <span className="text-muted">—</span>;
  const up = change > 0;
  return (
    <span className={up ? 'text-status-green' : 'text-status-red'}>
      {up ? '▲' : '▼'} {Math.abs(change)}
    </span>
  );
}
