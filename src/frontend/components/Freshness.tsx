import { useEffect, useState } from 'react';

// Small "updated just now" stamp so users can see the data is fresh.
export function Freshness({ updatedAt }: { updatedAt: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((v) => v + 1), 15_000);
    return () => clearInterval(t);
  }, []);
  const secs = Math.round((Date.now() - updatedAt) / 1000);
  const label =
    secs < 20 ? 'just now' : secs < 90 ? 'a minute ago' : `${Math.round(secs / 60)}m ago`;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
      Updated {label}
    </span>
  );
}
