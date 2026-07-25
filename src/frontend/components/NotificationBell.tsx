import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { timeAgo } from '../lib/format';
import { EmptyState } from './ui';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  parentType: string | null;
  parentId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      api.get<{ items: Notification[]; unread: number }>('/notifications'),
    refetchInterval: 30_000,
  });
  const unread = data?.unread ?? 0;

  async function markAll() {
    await api.post('/notifications/read');
    qc.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div className="relative">
      <button
        className="btn-ghost relative px-2 py-1"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-red px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-line bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <span className="text-sm font-semibold">Notifications</span>
              {unread > 0 && (
                <button className="text-xs text-muted hover:text-ink" onClick={markAll}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {!data?.items.length ? (
                <div className="p-3">
                  <EmptyState
                    title="Nothing yet"
                    hint="Assignments, mentions, approvals and status changes will show here."
                  />
                </div>
              ) : (
                data.items.map((n) => (
                  <button
                    key={n.id}
                    className={`block w-full border-b border-line px-3 py-2 text-left hover:bg-fill ${
                      n.isRead ? '' : 'bg-gold/5'
                    }`}
                    onClick={() => {
                      setOpen(false);
                      if (n.parentType === 'approval') navigate('/approvals');
                      else if (n.parentType === 'issue') navigate('/board');
                    }}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-muted">{n.body}</p>}
                    <p className="mt-0.5 text-[10px] text-muted">
                      {timeAgo(n.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
