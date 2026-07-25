import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { isGmc } from '@shared/types';
import type {
  BadgeLevel,
  PromiseSourceType,
  PromiseStatus,
  VendorStatus,
} from '@shared/types';
import {
  Badge,
  EmptyState,
  PromiseBadge,
  SeverityDot,
  Spinner,
  StatusDot,
} from '../components/ui';
import { Modal } from '../components/Modal';
import { CommentThread } from '../components/CommentThread';
import { BOARD_STAGE_LABELS } from '@shared/types';
import { daysSince, shortDate, timeAgo } from '../lib/format';

interface VendorDetail {
  id: string;
  name: string;
  slug: string;
  companyName: string | null;
  founderName: string | null;
  status: VendorStatus;
  healthScore: number;
  badgeLevel: BadgeLevel;
  dealUrl: string | null;
  appUrl: string | null;
  changelogUrl: string | null;
  launchDate: string | null;
  lastVendorUpdateAt: string | null;
  lastVendorReplyAt: string | null;
  isDemoRecord: boolean;
  scoreHistory: { recordedAt: string; healthScore: number }[];
  issues: {
    id: string;
    title: string;
    severity: 'minor' | 'notable' | 'serious';
    boardStage: keyof typeof BOARD_STAGE_LABELS;
  }[];
}

const TABS = ['Overview', 'Promises', 'Issues', 'Buyers', 'History'] as const;
type Tab = (typeof TABS)[number];

export function VendorPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('Overview');
  const [flagOpen, setFlagOpen] = useState(false);

  const { data: v, isLoading } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => api.get<VendorDetail>(`/vendors/${slug}`),
    enabled: !!slug,
  });

  if (isLoading || !v) return <Spinner />;
  const gmc = user ? isGmc(user.role) : false;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{v.name}</h1>
            <StatusDot status={v.status} />
            <span className="text-lg font-semibold">{v.healthScore}</span>
            <Badge level={v.badgeLevel} />
          </div>
          {v.companyName && <p className="text-sm text-muted">{v.companyName}</p>}
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {v.dealUrl && <ExtLink href={v.dealUrl}>Deal page</ExtLink>}
            {v.appUrl && <ExtLink href={v.appUrl}>App</ExtLink>}
            {v.changelogUrl && <ExtLink href={v.changelogUrl}>Changelog</ExtLink>}
          </div>
        </div>
        <button className="btn-secondary" onClick={() => setFlagOpen(true)}>
          🚩 Flag this vendor
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm ${
              tab === t
                ? 'border-ink font-medium text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <Overview v={v} />}
      {tab === 'Promises' && <PromisesTab vendorId={v.id} gmc={gmc} />}
      {tab === 'Issues' && <IssuesTab v={v} />}
      {tab === 'Buyers' && <BuyersTab vendorId={v.id} />}
      {tab === 'History' && <HistoryTab vendorId={v.id} />}

      {tab === 'Overview' && (
        <div className="card p-4">
          <CommentThread parentType="vendor" parentId={v.id} />
        </div>
      )}

      <FlagDialog
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        vendorId={v.id}
        vendorName={v.name}
      />
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-ink underline decoration-line hover:decoration-ink"
    >
      {children} ↗
    </a>
  );
}

function Overview({ v }: { v: VendorDetail }) {
  const chart = v.scoreHistory.slice(-52);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card p-4 lg:col-span-2">
        <h2 className="mb-3 text-sm font-semibold">Score history — 12 months</h2>
        {!chart.length ? (
          <EmptyState title="No history" hint="Weekly snapshots build this chart." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="recordedAt"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => String(d).slice(0, 7)}
                minTickGap={40}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(d) => shortDate(String(d))}
              />
              <Line
                type="monotone"
                dataKey="healthScore"
                stroke="#11141C"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold">Quick facts</h2>
        <dl className="space-y-2 text-sm">
          <Fact label="Launch date" value={shortDate(v.launchDate)} />
          <Fact
            label="Last update"
            value={`${timeAgo(v.lastVendorUpdateAt)}${
              daysSince(v.lastVendorUpdateAt) != null
                ? ` (${daysSince(v.lastVendorUpdateAt)}d)`
                : ''
            }`}
          />
          <Fact
            label="Last reply"
            value={`${timeAgo(v.lastVendorReplyAt)}${
              daysSince(v.lastVendorReplyAt) != null
                ? ` (${daysSince(v.lastVendorReplyAt)}d)`
                : ''
            }`}
          />
          {v.founderName && <Fact label="Founder" value={v.founderName} />}
        </dl>

        <h3 className="mb-2 mt-4 text-sm font-semibold">Latest issues</h3>
        {!v.issues.length ? (
          <p className="text-xs text-muted">No issues logged.</p>
        ) : (
          <ul className="space-y-1.5">
            {v.issues.slice(0, 3).map((i) => (
              <li key={i.id} className="flex items-center gap-2 text-sm">
                <SeverityDot severity={i.severity} />
                <span className="min-w-0 flex-1 truncate">{i.title}</span>
                <span className="text-xs text-muted">
                  {BOARD_STAGE_LABELS[i.boardStage]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

interface Promise {
  id: string;
  promiseText: string;
  sourceType: PromiseSourceType;
  sourceUrl: string | null;
  promisedOn: string | null;
  dueBy: string | null;
  status: PromiseStatus;
}

const SOURCE_LABELS: Record<PromiseSourceType, string> = {
  deal_page: 'Deal page',
  terms: 'Terms',
  qa_comment: 'Q&A comment',
  founder_email: 'Founder email',
  roadmap: 'Roadmap',
};

function PromisesTab({ vendorId, gmc }: { vendorId: string; gmc: boolean }) {
  const [statusFilter, setStatusFilter] = useState<PromiseStatus | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['promises', vendorId],
    queryFn: () => api.get<Promise[]>(`/promises?vendorId=${vendorId}`),
  });

  const rows = (data ?? []).filter(
    (p) => statusFilter === 'all' || p.status === statusFilter,
  );
  const statuses: (PromiseStatus | 'all')[] = [
    'all',
    'promised',
    'in_progress',
    'delivered',
    'overdue',
    'broken',
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`pill border text-xs ${
                statusFilter === s
                  ? 'border-ink bg-ink text-white'
                  : 'border-line text-muted'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {gmc && (
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            Add promise
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="px-4 py-2 font-medium">Promise</th>
              <th className="px-4 py-2 font-medium">Where said</th>
              <th className="px-4 py-2 font-medium">Promised</th>
              <th className="px-4 py-2 font-medium">Due by</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-2.5">{p.promiseText}</td>
                <td className="px-4 py-2.5 text-muted">
                  {p.sourceUrl ? (
                    <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                      {SOURCE_LABELS[p.sourceType]} ↗
                    </a>
                  ) : (
                    SOURCE_LABELS[p.sourceType]
                  )}
                </td>
                <td className="px-4 py-2.5 text-muted">{shortDate(p.promisedOn)}</td>
                <td className="px-4 py-2.5 text-muted">{shortDate(p.dueBy)}</td>
                <td className="px-4 py-2.5">
                  <PromiseBadge status={p.status} />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No promises in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddPromiseDialog open={addOpen} onClose={() => setAddOpen(false)} vendorId={vendorId} />
    </div>
  );
}

function AddPromiseDialog({
  open,
  onClose,
  vendorId,
}: {
  open: boolean;
  onClose: () => void;
  vendorId: string;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [source, setSource] = useState<PromiseSourceType>('deal_page');
  const [sourceUrl, setSourceUrl] = useState('');
  const [promisedOn, setPromisedOn] = useState('');
  const [dueBy, setDueBy] = useState('');
  const [status, setStatus] = useState<PromiseStatus>('promised');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const create = useMutation({
    mutationFn: () =>
      api.post('/promises', {
        vendorId,
        promiseText: text,
        sourceType: source,
        sourceUrl: sourceUrl || null,
        promisedOn: promisedOn || null,
        dueBy: dueBy || null,
        status,
        screenshotUrl: screenshotUrl || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promises', vendorId] });
      setText('');
      setSourceUrl('');
      onClose();
    },
  });

  async function uploadShot(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/uploads/screenshot', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      setScreenshotUrl(url);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add promise" wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) create.mutate();
        }}
      >
        <div>
          <label className="label">Promise text</label>
          <textarea
            className="input min-h-[70px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Where it was said</label>
            <select className="input" value={source} onChange={(e) => setSource(e.target.value as PromiseSourceType)}>
              {Object.entries(SOURCE_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as PromiseStatus)}>
              {['promised', 'in_progress', 'delivered', 'overdue', 'broken'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Source URL</label>
          <input className="input" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Promised on</label>
            <input type="date" className="input" value={promisedOn} onChange={(e) => setPromisedOn(e.target.value)} />
          </div>
          <div>
            <label className="label">Due by (optional)</label>
            <input type="date" className="input" value={dueBy} onChange={(e) => setDueBy(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Screenshot (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="text-xs"
            onChange={(e) => e.target.files?.[0] && uploadShot(e.target.files[0])}
          />
          {screenshotUrl && <p className="mt-1 text-xs text-status-green">Uploaded ✓</p>}
        </div>
        {create.isError && (
          <p className="text-xs text-status-red">
            {(create.error as Error).message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={create.isPending}>
            Save promise
          </button>
        </div>
      </form>
    </Modal>
  );
}

function IssuesTab({ v }: { v: VendorDetail }) {
  if (!v.issues.length)
    return (
      <EmptyState
        title="No issues for this vendor"
        hint="Issues raised against this vendor will be listed here with stage and SLA."
      />
    );
  return (
    <div className="card divide-y divide-line">
      {v.issues.map((i) => (
        <div key={i.id} className="flex items-center gap-3 px-4 py-3">
          <SeverityDot severity={i.severity} />
          <span className="min-w-0 flex-1">{i.title}</span>
          <span className="pill bg-fill text-muted">
            {BOARD_STAGE_LABELS[i.boardStage]}
          </span>
        </div>
      ))}
    </div>
  );
}

function BuyersTab({ vendorId }: { vendorId: string }) {
  const { data } = useQuery({
    queryKey: ['buyers', vendorId],
    queryFn: () =>
      api.get<{
        themes: {
          id: string;
          weekStarting: string;
          theme: string;
          mentionCount: number;
          sampleQuote: string | null;
        }[];
        questions: {
          id: string;
          questionText: string;
          daysUnanswered: number;
          askedOn: string | null;
        }[];
      }>(`/vendors/${vendorId}/buyers`),
  });

  // group themes by week
  type Theme = NonNullable<typeof data>['themes'][number];
  const byWeek = new Map<string, Theme[]>();
  (data?.themes ?? []).forEach((t) => {
    const list = byWeek.get(t.weekStarting) ?? [];
    list.push(t);
    byWeek.set(t.weekStarting, list);
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold">Complaint themes by week</h2>
        {!data?.themes.length ? (
          <EmptyState title="No themes logged" hint="Grouped buyer feedback appears here weekly." />
        ) : (
          <div className="space-y-3">
            {[...byWeek.entries()].map(([week, themes]) => (
              <div key={week}>
                <p className="text-xs font-medium text-muted">Week of {shortDate(week)}</p>
                <ul className="mt-1 space-y-1">
                  {themes.map((t) => (
                    <li key={t.id} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <span className="font-medium">{t.theme}</span>
                        {t.sampleQuote && (
                          <p className="truncate text-xs italic text-muted">“{t.sampleQuote}”</p>
                        )}
                      </div>
                      <span className="rounded-full bg-fill px-2 py-0.5 text-xs">{t.mentionCount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold">Unanswered questions</h2>
        {!data?.questions.length ? (
          <EmptyState title="Nothing outstanding" hint="Buyer questions awaiting a vendor reply appear here, longest-waiting first." />
        ) : (
          <ul className="space-y-2">
            {data.questions.map((qn) => (
              <li key={qn.id} className="flex items-start justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1">{qn.questionText}</span>
                <span
                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                    qn.daysUnanswered > 60
                      ? 'bg-status-red/15 text-status-red'
                      : 'bg-fill text-muted'
                  }`}
                >
                  {qn.daysUnanswered}d
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function HistoryTab({ vendorId }: { vendorId: string }) {
  const { data } = useQuery({
    queryKey: ['vendor-activity', vendorId],
    queryFn: () =>
      api.get<
        { id: string; action: string; detail: string | null; userName: string | null; createdAt: string }[]
      >(`/vendors/${vendorId}/activity`),
  });
  if (!data?.length)
    return <EmptyState title="No activity yet" hint="Every change to this vendor is recorded here." />;
  return (
    <div className="card divide-y divide-line text-sm">
      {data.map((a) => (
        <div key={a.id} className="flex items-baseline gap-3 px-4 py-2">
          <span className="w-32 shrink-0 text-xs text-muted">{timeAgo(a.createdAt)}</span>
          <span className="flex-1">
            <span className="font-medium">{a.userName || 'System'}</span>{' '}
            <span className="text-muted">{a.action.replace(/_/g, ' ')}</span>
            {a.detail && <span> — {a.detail}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function FlagDialog({
  open,
  onClose,
  vendorId,
  vendorName,
}: {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}) {
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const flag = useMutation({
    mutationFn: () => api.post(`/vendors/${vendorId}/flag`, { note }),
    onSuccess: () => {
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setNote('');
        onClose();
      }, 900);
    },
  });
  return (
    <Modal open={open} onClose={onClose} title={`Flag ${vendorName}`}>
      {done ? (
        <p className="py-4 text-center text-sm text-status-green">Flagged. GMC will review.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            flag.mutate();
          }}
          className="space-y-3"
        >
          <p className="text-sm text-muted">
            Raise this vendor for GMC to review. Add an optional note (max 200 chars).
          </p>
          <textarea
            className="input min-h-[70px]"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you notice?"
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" disabled={flag.isPending}>
              Flag vendor
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
