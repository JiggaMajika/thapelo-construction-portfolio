import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { APPROVAL_TYPE_LABELS, canApprove } from '@shared/types';
import type { ApprovalStatus, ApprovalType, SlaState } from '@shared/types';
import { EmptyState, Spinner } from '../components/ui';
import { CommentThread } from '../components/CommentThread';
import { Modal } from '../components/Modal';
import { SLA_TEXT, timeRemaining } from '../lib/format';

interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  recommendation: string;
  rationale: string | null;
  vendorName: string | null;
  vendorSlug: string | null;
  requesterName: string | null;
  status: ApprovalStatus;
  decisionNote: string | null;
  dueAt: string | null;
  slaState: SlaState;
}

export function Approvals() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [decide, setDecide] = useState<{
    approval: Approval;
    kind: 'approved' | 'declined' | 'question_asked';
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => api.get<Approval[]>('/approvals'),
    refetchInterval: 30_000,
  });

  const act = useMutation({
    mutationFn: (args: { id: string; decision: string; note: string }) =>
      api.post(`/approvals/${args.id}/decide`, {
        decision: args.decision,
        note: args.note,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      setDecide(null);
    },
  });

  if (isLoading || !data) return <Spinner />;
  const canDecide = user ? canApprove(user.role) : false;
  const pending = data.filter((a) => a.status === 'pending' || a.status === 'question_asked');
  const decided = data.filter((a) => a.status === 'approved' || a.status === 'declined');

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Approvals</h1>

      {!pending.length ? (
        <EmptyState
          title="No decisions waiting"
          hint="When GMC recommends an action, it appears here for a decision."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((a) => (
            <ApprovalCard
              key={a.id}
              a={a}
              canDecide={canDecide}
              onAct={(kind) => setDecide({ approval: a, kind })}
            />
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-muted">
            Decided ({decided.length})
          </summary>
          <div className="mt-3 space-y-3">
            {decided.map((a) => (
              <div key={a.id} className="card p-4 opacity-80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="pill bg-fill text-muted">
                      {APPROVAL_TYPE_LABELS[a.type]}
                    </span>
                    <span className="ml-2 text-sm font-medium">{a.title}</span>
                  </div>
                  <span
                    className={`pill ${
                      a.status === 'approved'
                        ? 'bg-status-green/15 text-status-green'
                        : 'bg-status-red/15 text-status-red'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                {a.decisionNote && (
                  <p className="mt-2 text-sm text-muted">Note: {a.decisionNote}</p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      <DecisionDialog
        state={decide}
        onClose={() => setDecide(null)}
        onSubmit={(note) =>
          decide && act.mutate({ id: decide.approval.id, decision: decide.kind, note })
        }
        pending={act.isPending}
      />
    </div>
  );
}

function ApprovalCard({
  a,
  canDecide,
  onAct,
}: {
  a: Approval;
  canDecide: boolean;
  onAct: (kind: 'approved' | 'declined' | 'question_asked') => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="pill bg-ink text-white">{APPROVAL_TYPE_LABELS[a.type]}</span>
          <h2 className="mt-1.5 text-base font-semibold">{a.title}</h2>
          {a.vendorSlug && (
            <Link to={`/vendors/${a.vendorSlug}`} className="text-xs text-muted hover:underline">
              {a.vendorName} ↗
            </Link>
          )}
        </div>
        <span className={`text-sm ${SLA_TEXT[a.slaState]}`}>{timeRemaining(a.dueAt)}</span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Recommendation</p>
          <p className="text-sm">{a.recommendation}</p>
        </div>
        {a.rationale && (
          <div>
            <p className="text-xs font-medium uppercase text-muted">Why</p>
            <p className="text-sm">{a.rationale}</p>
          </div>
        )}
      </div>

      {a.status === 'question_asked' && (
        <p className="mt-2 pill bg-status-amber/15 text-[#8a6a04]">Question asked</p>
      )}

      {canDecide ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => onAct('approved')}>
            Approve
          </button>
          <button className="btn-secondary" onClick={() => onAct('declined')}>
            Decline
          </button>
          <button className="btn-ghost" onClick={() => onAct('question_asked')}>
            Ask a question
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Only AppSumo exec and partnerships can decide approvals.
        </p>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <CommentThread parentType="approval" parentId={a.id} />
      </div>
    </div>
  );
}

function DecisionDialog({
  state,
  onClose,
  onSubmit,
  pending,
}: {
  state: { approval: Approval; kind: string } | null;
  onClose: () => void;
  onSubmit: (note: string) => void;
  pending: boolean;
}) {
  const [note, setNote] = useState('');
  if (!state) return null;
  const needsNote = state.kind === 'approved' || state.kind === 'declined';
  const title =
    state.kind === 'approved'
      ? 'Approve'
      : state.kind === 'declined'
        ? 'Decline'
        : 'Ask a question';
  return (
    <Modal open onClose={onClose} title={`${title}: ${state.approval.title}`}>
      <textarea
        className="input min-h-[80px]"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={needsNote ? 'A short note is required…' : 'Your question…'}
      />
      <div className="mt-3 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-primary"
          disabled={pending || (needsNote && !note.trim()) || (!needsNote && !note.trim())}
          onClick={() => onSubmit(note)}
        >
          {title}
        </button>
      </div>
    </Modal>
  );
}
