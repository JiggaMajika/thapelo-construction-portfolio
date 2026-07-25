import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { isGmc } from '@shared/types';
import type { HonoursStatus, SlaState } from '@shared/types';
import { EmptyState, Spinner } from '../components/ui';
import { Modal } from '../components/Modal';
import { SLA_TEXT, shortDate, timeRemaining } from '../lib/format';

interface HonoursList {
  id: string;
  month: string;
  title: string;
  status: HonoursStatus;
}
interface Entry {
  id: string;
  vendorId: string;
  vendorName: string | null;
  vendorSlug: string | null;
  position: number;
  citation: string | null;
  isSwappedOut: boolean;
}
interface HonoursDetail extends HonoursList {
  slaState: SlaState;
  dueAt: string | null;
  entries: Entry[];
}
interface Eligible {
  id: string;
  name: string;
  slug: string;
  healthScore: number;
}

export function Honours() {
  const { user } = useAuth();
  const gmc = user ? isGmc(user.role) : false;
  const isExec = user?.role === 'appsumo_exec';

  const { data: lists, isLoading } = useQuery({
    queryKey: ['honours'],
    queryFn: () => api.get<HonoursList[]>('/honours'),
  });

  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (lists && !selected) {
      const draft = lists.find((l) => l.status === 'draft' || l.status === 'submitted');
      setSelected((draft ?? lists[0])?.id ?? null);
    }
  }, [lists, selected]);

  if (isLoading || !lists) return <Spinner />;
  const current = lists.find((l) => l.id === selected);
  const archive = lists.filter((l) => l.id !== selected);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Monthly honours</h1>
        {lists.length > 0 && (
          <select
            className="input max-w-[200px]"
            value={selected ?? ''}
            onChange={(e) => setSelected(e.target.value)}
          >
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} · {l.status}
              </option>
            ))}
          </select>
        )}
      </div>

      {!current ? (
        <EmptyState title="No honours list" hint="GMC creates the monthly recognition list here." />
      ) : gmc && (current.status === 'draft') ? (
        <BuildingView listId={current.id} />
      ) : (
        <ApprovalView listId={current.id} isExec={isExec} gmc={gmc} />
      )}

      {archive.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted">Past months</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((l) => (
              <button
                key={l.id}
                className="card p-3 text-left hover:bg-fill"
                onClick={() => setSelected(l.id)}
              >
                <p className="text-sm font-medium">{l.title}</p>
                <p className="text-xs text-muted">{l.status}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BuildingView({ listId }: { listId: string }) {
  const qc = useQueryClient();
  const { data: detail } = useQuery({
    queryKey: ['honours', listId],
    queryFn: () => api.get<HonoursDetail>(`/honours/${listId}`),
  });
  const { data: eligible } = useQuery({
    queryKey: ['honours-eligible'],
    queryFn: () => api.get<Eligible[]>('/honours/eligible'),
  });

  // local ordered picks
  const [picks, setPicks] = useState<{ vendorId: string; name: string; citation: string }[]>([]);
  useEffect(() => {
    if (detail && picks.length === 0 && detail.entries.length) {
      setPicks(
        detail.entries
          .sort((a, b) => a.position - b.position)
          .map((e) => ({ vendorId: e.vendorId, name: e.vendorName || '', citation: e.citation || '' })),
      );
    }
  }, [detail]); // eslint-disable-line

  const chosen = new Set(picks.map((p) => p.vendorId));
  const available = (eligible ?? []).filter((e) => !chosen.has(e.id));

  const save = useMutation({
    mutationFn: () =>
      api.put(`/honours/${listId}/entries`, {
        entries: picks.slice(0, 10).map((p, i) => ({
          vendorId: p.vendorId,
          position: i + 1,
          citation: p.citation,
        })),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['honours', listId] }),
  });

  const submit = useMutation({
    mutationFn: async () => {
      await save.mutateAsync();
      await api.post(`/honours/${listId}/submit`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['honours'] });
      qc.invalidateQueries({ queryKey: ['honours', listId] });
    },
  });

  function add(e: Eligible) {
    if (picks.length >= 10) return;
    setPicks((p) => [...p, { vendorId: e.id, name: e.name, citation: '' }]);
  }
  function remove(vendorId: string) {
    setPicks((p) => p.filter((x) => x.vendorId !== vendorId));
  }
  function moveUp(i: number) {
    if (i === 0) return;
    setPicks((p) => {
      const n = [...p];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n;
    });
  }
  function moveDown(i: number) {
    setPicks((p) => {
      if (i === p.length - 1) return p;
      const n = [...p];
      [n[i + 1], n[i]] = [n[i], n[i + 1]];
      return n;
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">The list (1–10)</h2>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => save.mutate()} disabled={save.isPending}>
                Save draft
              </button>
              <button
                className="btn-primary"
                onClick={() => submit.mutate()}
                disabled={!picks.length || submit.isPending}
              >
                Submit for approval
              </button>
            </div>
          </div>
          {!picks.length ? (
            <EmptyState
              title="No vendors picked yet"
              hint="Pick eligible vendors from the right, order them, and write a one-line citation each."
            />
          ) : (
            <ol className="space-y-2">
              {picks.map((p, i) => (
                <li key={p.vendorId} className="flex items-start gap-2 rounded-md border border-line p-2">
                  <span className="mt-1 w-5 text-center text-sm font-semibold">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <input
                      className="input mt-1 text-xs"
                      placeholder="One-line citation…"
                      value={p.citation}
                      onChange={(e) =>
                        setPicks((prev) =>
                          prev.map((x) =>
                            x.vendorId === p.vendorId ? { ...x, citation: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="btn-ghost px-1.5 py-0.5" onClick={() => moveUp(i)}>▲</button>
                    <button className="btn-ghost px-1.5 py-0.5" onClick={() => moveDown(i)}>▼</button>
                    <button className="btn-ghost px-1.5 py-0.5 text-status-red" onClick={() => remove(p.vendorId)}>✕</button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 text-sm font-semibold">Eligible vendors</h2>
        <p className="mb-3 text-xs text-muted">Green all month, no open disputes.</p>
        {!available.length ? (
          <p className="text-sm text-muted">No more eligible vendors.</p>
        ) : (
          <ul className="space-y-1.5">
            {available.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span className="text-sm">{e.name}</span>
                <button className="btn-secondary px-2 py-1 text-xs" onClick={() => add(e)} disabled={picks.length >= 10}>
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ApprovalView({
  listId,
  isExec,
  gmc,
}: {
  listId: string;
  isExec: boolean;
  gmc: boolean;
}) {
  const qc = useQueryClient();
  const [exportOpen, setExportOpen] = useState(false);
  const { data: detail } = useQuery({
    queryKey: ['honours', listId],
    queryFn: () => api.get<HonoursDetail>(`/honours/${listId}`),
  });

  const approve = useMutation({
    mutationFn: () => api.post(`/honours/${listId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['honours'] });
      qc.invalidateQueries({ queryKey: ['honours', listId] });
    },
  });
  const swap = useMutation({
    mutationFn: (entryId: string) => api.post(`/honours/${listId}/entries/${entryId}/swap`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['honours', listId] }),
  });

  if (!detail) return <Spinner />;
  const canApproveNow = isExec && detail.status === 'submitted';

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{detail.title}</h2>
            <p className="text-xs text-muted">
              {shortDate(detail.month)} · {detail.status}
            </p>
          </div>
          {detail.status === 'submitted' && (
            <span className={`text-sm ${SLA_TEXT[detail.slaState]}`}>
              {timeRemaining(detail.dueAt)}
            </span>
          )}
          {(detail.status === 'approved' || detail.status === 'published') && (
            <button className="btn-secondary" onClick={() => setExportOpen(true)}>
              Export
            </button>
          )}
        </div>

        <ol className="space-y-2">
          {detail.entries.map((e) => (
            <li
              key={e.id}
              className={`flex items-start gap-3 rounded-md border p-3 ${
                e.isSwappedOut ? 'border-status-red/40 bg-status-red/5 opacity-70' : 'border-line'
              }`}
            >
              <span className="mt-0.5 text-lg font-semibold">{e.position}</span>
              <div className="flex-1">
                <p className="font-medium">{e.vendorName}</p>
                <p className="text-sm text-muted">{e.citation}</p>
                {e.isSwappedOut && (
                  <p className="mt-1 text-xs text-status-red">Swapped out</p>
                )}
              </div>
              {canApproveNow && !e.isSwappedOut && (
                <div className="flex gap-1">
                  <span className="pill bg-status-green/15 text-status-green">Keep</span>
                  <button className="btn-ghost px-2 py-1 text-xs" onClick={() => swap.mutate(e.id)}>
                    Swap out
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>

        {canApproveNow && (
          <button
            className="btn-primary mt-4 w-full"
            onClick={() => approve.mutate()}
            disabled={approve.isPending}
          >
            Approve list · {timeRemaining(detail.dueAt)}
          </button>
        )}
        {detail.status === 'submitted' && !isExec && (
          <p className="mt-3 text-center text-xs text-muted">
            Awaiting AppSumo exec approval.
          </p>
        )}
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} detail={detail} />
    </div>
  );
}

function ExportDialog({
  open,
  onClose,
  detail,
}: {
  open: boolean;
  onClose: () => void;
  detail: HonoursDetail;
}) {
  const live = detail.entries.filter((e) => !e.isSwappedOut);
  const text = useMemo(
    () =>
      [`${detail.title}`, '']
        .concat(live.map((e) => `${e.position}. ${e.vendorName} — ${e.citation ?? ''}`))
        .join('\n'),
    [detail, live],
  );
  const html = useMemo(
    () =>
      `<h2>${detail.title}</h2>\n<ol>\n` +
      live.map((e) => `  <li><strong>${e.vendorName}</strong> — ${e.citation ?? ''}</li>`).join('\n') +
      `\n</ol>`,
    [detail, live],
  );
  return (
    <Modal open={open} onClose={onClose} title="Export honours list" wide>
      <div className="space-y-4">
        <div>
          <p className="label">Copy-ready text</p>
          <textarea className="input min-h-[140px] font-mono text-xs" readOnly value={text} />
          <button
            className="btn-secondary mt-1"
            onClick={() => navigator.clipboard.writeText(text)}
          >
            Copy text
          </button>
        </div>
        <div>
          <p className="label">HTML block</p>
          <textarea className="input min-h-[120px] font-mono text-xs" readOnly value={html} />
          <button
            className="btn-secondary mt-1"
            onClick={() => navigator.clipboard.writeText(html)}
          >
            Copy HTML
          </button>
        </div>
      </div>
    </Modal>
  );
}
