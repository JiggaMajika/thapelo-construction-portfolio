import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { isGmc } from '@shared/types';
import type { ReportType } from '@shared/types';
import { EmptyState, Spinner } from '../components/ui';
import { Markdown } from '../lib/markdown';
import { Modal } from '../components/Modal';
import { shortDate } from '../lib/format';

interface Report {
  id: string;
  type: ReportType;
  title: string;
  periodStart: string | null;
  periodEnd: string | null;
  bodyMarkdown: string | null;
  vendorId: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<ReportType, string> = {
  monday: 'Monday',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  evidence_pack: 'Evidence pack',
};

export function Reports() {
  const { user } = useAuth();
  const gmc = user ? isGmc(user.role) : false;
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Report | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get<Report[]>('/reports'),
  });

  if (isLoading || !data) return <Spinner />;
  const current = data.find((r) => r.id === selected) ?? data[0] ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Reports</h1>
          {gmc && (
            <button className="btn-primary px-2 py-1 text-xs" onClick={() => setCreating(true)}>
              New
            </button>
          )}
        </div>
        {!data.length ? (
          <EmptyState title="No reports" hint="GMC publishes Monday, monthly, quarterly and evidence-pack reports here." />
        ) : (
          <ul className="space-y-1">
            {data.map((r) => (
              <li key={r.id}>
                <button
                  className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-fill ${
                    current?.id === r.id ? 'bg-fill font-medium' : ''
                  }`}
                  onClick={() => setSelected(r.id)}
                >
                  <span className="pill mr-1 bg-ink text-[10px] text-white">
                    {TYPE_LABELS[r.type]}
                  </span>
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:col-span-3">
        {!current ? (
          <EmptyState title="Nothing selected" hint="Choose a report to read it." />
        ) : (
          <div className="card p-6">
            <div className="mb-4 flex items-start justify-between no-print">
              <div>
                <span className="pill bg-fill text-muted">{TYPE_LABELS[current.type]}</span>
                <h2 className="mt-1 text-xl font-semibold">{current.title}</h2>
                <p className="text-xs text-muted">
                  {shortDate(current.periodStart)} – {shortDate(current.periodEnd)}
                </p>
              </div>
              <div className="flex gap-2">
                {gmc && (
                  <button className="btn-secondary" onClick={() => setEditing(current)}>
                    Edit
                  </button>
                )}
                <button className="btn-secondary" onClick={() => window.print()}>
                  Print / PDF
                </button>
              </div>
            </div>
            <Markdown source={current.bodyMarkdown || '_No content._'} />
          </div>
        )}
      </div>

      {editing && (
        <EditorDialog report={editing} onClose={() => setEditing(null)} />
      )}
      {creating && <EditorDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function EditorDialog({ report, onClose }: { report?: Report; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(report?.title ?? '');
  const [type, setType] = useState<ReportType>(report?.type ?? 'monday');
  const [body, setBody] = useState(report?.bodyMarkdown ?? '# Heading\n\nWrite here…');

  const save = useMutation({
    mutationFn: () =>
      report
        ? api.patch(`/reports/${report.id}`, { title, type, bodyMarkdown: body })
        : api.post('/reports', { title, type, bodyMarkdown: body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      onClose();
    },
  });

  const preview = useMemo(() => body, [body]);

  return (
    <Modal open onClose={onClose} title={report ? 'Edit report' : 'New report'} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <input
            className="input col-span-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select className="input" value={type} onChange={(e) => setType(e.target.value as ReportType)}>
            {Object.entries(TYPE_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <textarea
            className="input min-h-[300px] font-mono text-xs"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="max-h-[300px] overflow-y-auto rounded-md border border-line p-3">
            <Markdown source={preview} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!title.trim() || save.isPending} onClick={() => save.mutate()}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
