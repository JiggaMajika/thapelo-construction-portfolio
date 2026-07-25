import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  BOARD_STAGES,
  BOARD_STAGE_LABELS,
  FAILURE_MODE_LABELS,
  isGmc,
} from '@shared/types';
import type {
  AssignedTeam,
  BoardStage,
  FailureMode,
  Severity,
  SlaState,
} from '@shared/types';
import { Avatar, SeverityDot, Spinner } from '../components/ui';
import { Freshness } from '../components/Freshness';
import { Modal } from '../components/Modal';
import { SLA_TEXT, timeRemaining } from '../lib/format';

interface Issue {
  id: string;
  vendorId: string;
  vendorName: string | null;
  vendorSlug: string | null;
  title: string;
  severity: Severity;
  failureMode: FailureMode;
  boardStage: BoardStage;
  assignedTeam: AssignedTeam;
  assignedUserId: string | null;
  assigneeName: string | null;
  isBlocked: boolean;
  blockedReason: string | null;
  dueAt: string | null;
  slaState: SlaState;
}

const SLA_RANK: Record<SlaState, number> = { overdue: 0, due_soon: 1, on_track: 2 };

export function Board() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [team, setTeam] = useState<AssignedTeam | 'all'>('all');
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [failure, setFailure] = useState<FailureMode | 'all'>('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [resolveFor, setResolveFor] = useState<Issue | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['issues'],
    queryFn: () => api.get<Issue[]>('/issues'),
    refetchInterval: 30_000,
  });

  const move = useMutation({
    mutationFn: (args: { id: string; stage: BoardStage; note?: string }) =>
      api.post(`/issues/${args.id}/move`, {
        boardStage: args.stage,
        resolutionNote: args.note,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });

  const filtered = useMemo(() => {
    let r = data ?? [];
    if (team !== 'all') r = r.filter((i) => i.assignedTeam === team);
    if (severity !== 'all') r = r.filter((i) => i.severity === severity);
    if (failure !== 'all') r = r.filter((i) => i.failureMode === failure);
    if (mineOnly && user) r = r.filter((i) => i.assignedUserId === user.id);
    return r;
  }, [data, team, severity, failure, mineOnly, user]);

  function onDropTo(stage: BoardStage, issue: Issue) {
    if (issue.boardStage === stage) return;
    if (stage === 'resolved') {
      setResolveFor(issue);
      return;
    }
    move.mutate({ id: issue.id, stage });
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Board</h1>
          <Freshness updatedAt={dataUpdatedAt} />
        </div>
        <div className="flex items-center gap-2">
          {user && isGmc(user.role) && (
            <button className="btn-primary" onClick={() => setNewOpen(true)}>
              New issue
            </button>
          )}
          <div className="flex rounded-md border border-line">
            <button
              className={`px-3 py-1.5 text-sm ${view === 'board' ? 'bg-ink text-white' : 'text-muted'}`}
              onClick={() => setView('board')}
            >
              Board
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-ink text-white' : 'text-muted'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Select value={team} onChange={(v) => setTeam(v as any)} label="Team"
          options={['all', 'gmc', 'partnerships', 'support', 'finance', 'leadership']} />
        <Select value={severity} onChange={(v) => setSeverity(v as any)} label="Severity"
          options={['all', 'minor', 'notable', 'serious']} />
        <Select value={failure} onChange={(v) => setFailure(v as any)} label="Failure mode"
          options={['all', ...Object.keys(FAILURE_MODE_LABELS)]}
          render={(o) => (o === 'all' ? 'All' : FAILURE_MODE_LABELS[o as FailureMode])} />
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
          Mine only
        </label>
      </div>

      {view === 'board' ? (
        <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-3 overflow-x-auto pb-2">
          {BOARD_STAGES.map((stage) => {
            const cards = filtered
              .filter((i) => i.boardStage === stage)
              .sort((a, b) => SLA_RANK[a.slaState] - SLA_RANK[b.slaState]);
            return (
              <Column
                key={stage}
                stage={stage}
                cards={cards}
                onDrop={onDropTo}
              />
            );
          })}
        </div>
      ) : (
        <ListView issues={filtered} />
      )}

      <ResolveDialog
        issue={resolveFor}
        onClose={() => setResolveFor(null)}
        onConfirm={(note) => {
          if (resolveFor) move.mutate({ id: resolveFor.id, stage: 'resolved', note });
          setResolveFor(null);
        }}
      />
      <NewIssueDialog open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

function Column({
  stage,
  cards,
  onDrop,
}: {
  stage: BoardStage;
  cards: Issue[];
  onDrop: (stage: BoardStage, issue: Issue) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`flex flex-col rounded-lg border ${over ? 'border-gold bg-gold/5' : 'border-line bg-fill/50'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        const raw = e.dataTransfer.getData('application/json');
        if (raw) onDrop(stage, JSON.parse(raw));
      }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {BOARD_STAGE_LABELS[stage]}
        </h3>
        <span className="text-xs text-muted">{cards.length}</span>
      </div>
      <div className="flex-1 space-y-2 px-2 pb-2">
        {cards.map((c) => (
          <Card key={c.id} issue={c} />
        ))}
        {!cards.length && (
          <p className="px-1 py-6 text-center text-xs text-muted">Nothing here.</p>
        )}
      </div>
    </div>
  );
}

function Card({ issue }: { issue: Issue }) {
  return (
    <div
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData('application/json', JSON.stringify(issue))
      }
      className="card cursor-grab p-2.5 active:cursor-grabbing"
    >
      {issue.vendorSlug ? (
        <Link
          to={`/vendors/${issue.vendorSlug}`}
          className="text-sm font-semibold hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {issue.vendorName}
        </Link>
      ) : (
        <span className="text-sm font-semibold">{issue.vendorName}</span>
      )}
      <p className="mt-0.5 line-clamp-2 text-sm text-ink/90">{issue.title}</p>
      {issue.isBlocked && (
        <p className="mt-1 rounded bg-status-red/10 px-1.5 py-0.5 text-[10px] font-medium text-status-red">
          ⛔ Blocked{issue.blockedReason ? `: ${issue.blockedReason}` : ''}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <SeverityDot severity={issue.severity} />
        <span className={`text-[11px] ${SLA_TEXT[issue.slaState]}`}>
          {timeRemaining(issue.dueAt)}
        </span>
        {issue.assigneeName && <Avatar name={issue.assigneeName} />}
      </div>
    </div>
  );
}

function ListView({ issues }: { issues: Issue[] }) {
  const sorted = [...issues].sort(
    (a, b) => SLA_RANK[a.slaState] - SLA_RANK[b.slaState],
  );
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-muted">
            <th className="px-4 py-2 font-medium">Vendor</th>
            <th className="px-4 py-2 font-medium">Issue</th>
            <th className="px-4 py-2 font-medium">Stage</th>
            <th className="px-4 py-2 font-medium">Severity</th>
            <th className="px-4 py-2 font-medium">SLA</th>
            <th className="px-4 py-2 font-medium">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((i) => (
            <tr key={i.id} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-medium">
                {i.vendorSlug ? (
                  <Link to={`/vendors/${i.vendorSlug}`} className="hover:underline">
                    {i.vendorName}
                  </Link>
                ) : (
                  i.vendorName
                )}
              </td>
              <td className="px-4 py-2.5">{i.title}</td>
              <td className="px-4 py-2.5 text-muted">{BOARD_STAGE_LABELS[i.boardStage]}</td>
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-1.5">
                  <SeverityDot severity={i.severity} /> {i.severity}
                </span>
              </td>
              <td className={`px-4 py-2.5 ${SLA_TEXT[i.slaState]}`}>
                {timeRemaining(i.dueAt)}
              </td>
              <td className="px-4 py-2.5 text-muted">{i.assigneeName || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  options,
  render,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  render?: (o: string) => string;
}) {
  return (
    <label className="flex items-center gap-1.5 text-muted">
      <span className="text-xs">{label}</span>
      <select
        className="rounded-md border border-line px-2 py-1 text-sm text-ink"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o === 'all' ? 'All' : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResolveDialog({
  issue,
  onClose,
  onConfirm,
}: {
  issue: Issue | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  return (
    <Modal open={!!issue} onClose={onClose} title="Resolve issue">
      <p className="mb-2 text-sm text-muted">
        A resolution note is required to close this issue.
      </p>
      <textarea
        className="input min-h-[80px]"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What was the outcome?"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" disabled={!note.trim()} onClick={() => onConfirm(note)}>
          Resolve
        </button>
      </div>
    </Modal>
  );
}

function NewIssueDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [vendorId, setVendorId] = useState('');
  const [title, setTitle] = useState('');
  const [failureMode, setFailureMode] = useState<FailureMode>('other');
  const [severity, setSeverity] = useState<Severity>('notable');
  const [team, setTeam] = useState<AssignedTeam>('gmc');

  const { data: vendors } = useQuery({
    queryKey: ['vendors-min'],
    queryFn: () => api.get<{ id: string; name: string }[]>('/vendors'),
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () =>
      api.post('/issues', {
        vendorId,
        title,
        failureMode,
        severity,
        assignedTeam: team,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      setTitle('');
      setVendorId('');
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="New issue" wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (vendorId && title.trim()) create.mutate();
        }}
      >
        <div>
          <label className="label">Vendor</label>
          <select className="input" value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
            <option value="">Select…</option>
            {(vendors ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Failure mode</label>
            <select className="input" value={failureMode} onChange={(e) => setFailureMode(e.target.value as FailureMode)}>
              {Object.entries(FAILURE_MODE_LABELS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Severity</label>
            <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
              {['minor', 'notable', 'serious'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Team</label>
            <select className="input" value={team} onChange={(e) => setTeam(e.target.value as AssignedTeam)}>
              {['gmc', 'partnerships', 'support', 'finance', 'leadership'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-muted">
          New issues start in <strong>Spotted</strong>. An SLA due date is set automatically from severity.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={create.isPending}>Create issue</button>
        </div>
      </form>
    </Modal>
  );
}
