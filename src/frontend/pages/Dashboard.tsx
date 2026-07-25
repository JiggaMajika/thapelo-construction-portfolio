import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { STATUS_HEX, SLA_TEXT, timeRemaining } from '../lib/format';
import { EmptyState, Spinner, StatCard, StatusDot } from '../components/ui';
import { Freshness } from '../components/Freshness';
import type { SlaState, VendorStatus } from '@shared/types';

interface DashboardData {
  stats: {
    total: number;
    green: number;
    amber: number;
    red: number;
    decisionsForYou: number;
    overdue: number;
  };
  needsYou: {
    id: string;
    title: string;
    vendorName: string;
    vendorSlug: string;
    dueAt: string | null;
    slaState: SlaState;
  }[];
  changed: {
    id: string;
    name: string;
    slug: string;
    status: VendorStatus;
    previousStatus: VendorStatus | null;
  }[];
  trend: { week: string; green: number; amber: number; red: number }[];
  sliding: { id: string; name: string; slug: string; scoreChange: number; healthScore: number }[];
  complaintThemes: {
    id: string;
    vendorName: string;
    vendorSlug: string;
    theme: string;
    mentionCount: number;
    sampleQuote: string | null;
  }[];
  pendingPayouts: { id: string; title: string }[];
  hasDemo: boolean;
}

export function Dashboard() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
    refetchInterval: 30_000,
  });

  if (isLoading || !data) return <Spinner />;
  const isSupport = user?.role === 'appsumo_support';
  const isFinance = user?.role === 'appsumo_finance';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Freshness updatedAt={dataUpdatedAt} />
      </div>

      {data.hasDemo && !dismissed && (
        <div className="flex items-center justify-between rounded-md border border-line bg-fill px-4 py-2 text-sm">
          <span>Includes documented public cases for demonstration.</span>
          <button className="text-muted hover:text-ink" onClick={() => setDismissed(true)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Row 1: stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Products monitored">
          <p className="text-3xl font-semibold">{data.stats.total}</p>
        </StatCard>
        <StatCard label="Green / Amber / Red">
          <div className="flex items-end gap-4">
            <Num n={data.stats.green} color={STATUS_HEX.green} label="green" />
            <Num n={data.stats.amber} color={STATUS_HEX.amber} label="amber" />
            <Num n={data.stats.red} color={STATUS_HEX.red} label="red" />
          </div>
        </StatCard>
        <StatCard label="Needs your decision">
          <p className="text-3xl font-semibold">{data.stats.decisionsForYou}</p>
        </StatCard>
        <StatCard label="Overdue items">
          <p
            className={`text-3xl font-semibold ${
              data.stats.overdue > 0 ? 'text-status-red' : ''
            }`}
          >
            {data.stats.overdue}
          </p>
        </StatCard>
      </div>

      {/* Row 2: needs you / changed (finance sees payouts) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NeedsYou items={data.needsYou} />
        {isFinance ? (
          <PendingPayouts items={data.pendingPayouts} />
        ) : (
          <ChangedThisWeek items={data.changed} />
        )}
      </div>

      {/* Row 3: trend (support sees complaint themes instead) */}
      {isSupport ? (
        <ComplaintThemes items={data.complaintThemes} />
      ) : (
        <TrendChart trend={data.trend} />
      )}

      {/* Row 4: sliding watch */}
      <SlidingWatch items={data.sliding} />
    </div>
  );
}

function Num({ n, color, label }: { n: number; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-semibold" style={{ color }}>
        {n}
      </span>
      <span className="text-[10px] uppercase text-muted">{label}</span>
    </div>
  );
}

function NeedsYou({ items }: { items: DashboardData['needsYou'] }) {
  const navigate = useNavigate();
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">Needs you now</h2>
      {!items.length ? (
        <EmptyState
          title="You're clear"
          hint="Items assigned to your team, sorted by urgency, will appear here."
        />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id}>
              <button
                className="flex w-full items-center gap-3 py-2 text-left hover:bg-fill"
                onClick={() => navigate('/board')}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted">{i.vendorName}</p>
                </div>
                <span className={`text-xs ${SLA_TEXT[i.slaState]}`}>
                  {timeRemaining(i.dueAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChangedThisWeek({ items }: { items: DashboardData['changed'] }) {
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">Changed this week</h2>
      {!items.length ? (
        <EmptyState
          title="No status changes"
          hint="When a vendor moves between green, amber and red, it shows here."
        />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((v) => (
            <li key={v.id} className="flex items-center justify-between py-2">
              <Link to={`/vendors/${v.slug}`} className="text-sm font-medium hover:underline">
                {v.name}
              </Link>
              <span className="flex items-center gap-2 text-xs">
                {v.previousStatus && (
                  <>
                    <StatusDot status={v.previousStatus} showWord={false} size={8} />
                    <span className="text-muted">→</span>
                  </>
                )}
                <StatusDot status={v.status} size={8} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PendingPayouts({ items }: { items: DashboardData['pendingPayouts'] }) {
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">Pending payout recommendations</h2>
      {!items.length ? (
        <EmptyState title="Nothing pending" hint="Payout hold recommendations will appear here." />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((p) => (
            <li key={p.id} className="py-2">
              <Link to="/approvals" className="text-sm hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrendChart({ trend }: { trend: DashboardData['trend'] }) {
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">Portfolio trend — last 12 weeks</h2>
      {!trend.length ? (
        <EmptyState title="No history yet" hint="Weekly portfolio snapshots build this chart." />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 10 }} tickFormatter={(w) => w.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="green" stackId="1" stroke={STATUS_HEX.green} fill={STATUS_HEX.green} fillOpacity={0.5} />
            <Area type="monotone" dataKey="amber" stackId="1" stroke={STATUS_HEX.amber} fill={STATUS_HEX.amber} fillOpacity={0.5} />
            <Area type="monotone" dataKey="red" stackId="1" stroke={STATUS_HEX.red} fill={STATUS_HEX.red} fillOpacity={0.5} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ComplaintThemes({ items }: { items: DashboardData['complaintThemes'] }) {
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">Complaint themes this week</h2>
      {!items.length ? (
        <EmptyState title="No themes logged" hint="Grouped buyer feedback appears here weekly." />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {t.theme}{' '}
                  <Link to={`/vendors/${t.vendorSlug}`} className="text-xs text-muted hover:underline">
                    · {t.vendorName}
                  </Link>
                </p>
                {t.sampleQuote && (
                  <p className="truncate text-xs italic text-muted">“{t.sampleQuote}”</p>
                )}
              </div>
              <span className="ml-3 rounded-full bg-fill px-2 py-0.5 text-xs font-medium">
                {t.mentionCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SlidingWatch({ items }: { items: DashboardData['sliding'] }) {
  return (
    <div className="rounded-lg border-2 border-gold/40 bg-gold/5 p-4">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-sm font-semibold">Sliding watch — early warning</h2>
      </div>
      <p className="mb-3 text-xs text-muted">
        Still green, but down 15+ points in the last 30 days. Watch these before they turn.
      </p>
      {!items.length ? (
        <p className="text-sm text-muted">No vendors are sliding right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => (
            <Link
              key={v.id}
              to={`/vendors/${v.slug}`}
              className="card flex items-center justify-between p-3 hover:bg-fill"
            >
              <div>
                <p className="text-sm font-medium">{v.name}</p>
                <StatusDot status="green" size={8} />
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{v.healthScore}</p>
                <p className="text-xs font-medium text-status-red">{v.scoreChange} pts</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
