import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { timeAgo } from '../lib/format';
import { Avatar, EmptyState } from './ui';
import type { CommentParentType } from '@shared/types';

interface Comment {
  id: string;
  userId: string;
  userName: string | null;
  userRole: string | null;
  body: string;
  createdAt: string;
  editedAt: string | null;
}

// Very small markdown: **bold**, *italic*, and @mentions highlighted.
function renderBody(body: string) {
  const parts = body.split(/(\*\*[^*]+\*\*|\*[^*]+\*|@[a-zA-Z0-9._-]+)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith('@'))
      return (
        <span key={i} className="font-medium text-gold-700 text-[#8a6a04]">
          {p}
        </span>
      );
    return <span key={i}>{p}</span>;
  });
}

export function CommentThread({
  parentType,
  parentId,
}: {
  parentType: CommentParentType;
  parentId: string;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState('');
  const key = ['comments', parentType, parentId];

  const { data } = useQuery({
    queryKey: key,
    queryFn: () =>
      api.get<Comment[]>(
        `/comments?parentType=${parentType}&parentId=${parentId}`,
      ),
  });

  const post = useMutation({
    mutationFn: () => api.post('/comments', { parentType, parentId, body }),
    onSuccess: () => {
      setBody('');
      qc.invalidateQueries({ queryKey: key });
    },
  });

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Discussion</h3>
      <div className="space-y-3">
        {!data?.length ? (
          <EmptyState
            title="No comments yet"
            hint="Use @name to mention a teammate. Plain text with basic markdown."
          />
        ) : (
          data.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar name={c.userName} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  <span className="font-medium text-ink">{c.userName}</span>{' '}
                  · {timeAgo(c.createdAt)}
                  {c.editedAt && ' · edited'}
                </p>
                <p className="whitespace-pre-wrap text-sm">{renderBody(c.body)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) post.mutate();
        }}
      >
        <input
          className="input"
          placeholder="Write a comment… @mention to notify"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="btn-primary" disabled={!body.trim() || post.isPending}>
          Post
        </button>
      </form>
    </div>
  );
}
