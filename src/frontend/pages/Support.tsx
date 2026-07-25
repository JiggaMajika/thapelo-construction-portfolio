import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { EmptyState, PromiseBadge, Spinner, StatusDot } from '../components/ui';
import { timeAgo } from '../lib/format';
import type { PromiseStatus, VendorStatus } from '@shared/types';

interface Hit {
  id: string;
  name: string;
  slug: string;
  status: VendorStatus;
}
interface Card {
  vendor: {
    id: string;
    name: string;
    slug: string;
    status: VendorStatus;
    healthScore: number;
    lastVendorUpdateAt: string | null;
    lastVendorReplyAt: string | null;
  };
  promises: {
    id: string;
    promiseText: string;
    status: PromiseStatus;
  }[];
  complaintThemes: { id: string; theme: string; mentionCount: number }[];
  underNotice: boolean;
  payoutHeldPct: number;
}

export function Support() {
  const [q, setQ] = useState('');
  const [slug, setSlug] = useState<string | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [promiseQ, setPromiseQ] = useState('');

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const r = await api.get<Hit[]>(`/support/search?q=${encodeURIComponent(q)}`);
      setHits(r);
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const { data: card } = useQuery({
    queryKey: ['support-card', slug],
    queryFn: () => api.get<Card>(`/support/vendor/${slug}`),
    enabled: !!slug,
  });

  const { data: headsup } = useQuery({
    queryKey: ['headsup'],
    queryFn: () =>
      api.get<{ id: string; name: string; slug: string; status: VendorStatus; previousStatus: VendorStatus | null }[]>(
        '/support/headsup',
      ),
  });

  const filteredPromises = (card?.promises ?? []).filter((p) =>
    p.promiseText.toLowerCase().includes(promiseQ.toLowerCase()),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="mb-2 text-xl font-semibold">Support desk</h1>
          <div className="relative">
            <input
              className="input text-base"
              placeholder="Type a product name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            {hits.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border border-line bg-white shadow-lg">
                {hits.map((h) => (
                  <button
                    key={h.id}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-fill"
                    onClick={() => {
                      setSlug(h.slug);
                      setQ(h.name);
                      setHits([]);
                    }}
                  >
                    <StatusDot status={h.status} showWord={false} size={8} />
                    {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!card ? (
          <EmptyState
            title="Look up a vendor"
            hint="Search a product to pull its card: status, promises, complaints and payment holds — fast enough to use mid-conversation."
          />
        ) : (
          <div className="card p-5">
            {/* 1. status + score, large */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to={`/vendors/${card.vendor.slug}`} className="text-lg font-semibold hover:underline">
                  {card.vendor.name}
                </Link>
                <StatusDot status={card.vendor.status} />
              </div>
              <span className="text-3xl font-semibold">{card.vendor.healthScore}</span>
            </div>

            {/* 2. last update / reply */}
            <div className="mt-2 flex gap-6 text-xs text-muted">
              <span>Last update {timeAgo(card.vendor.lastVendorUpdateAt)}</span>
              <span>Last reply {timeAgo(card.vendor.lastVendorReplyAt)}</span>
            </div>

            {/* 5. notice / holds */}
            {(card.underNotice || card.payoutHeldPct > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {card.underNotice && (
                  <span className="pill bg-status-red/15 text-status-red">Under formal notice</span>
                )}
                {card.payoutHeldPct > 0 && (
                  <span className="pill bg-status-amber/15 text-[#8a6a04]">
                    {card.payoutHeldPct}% payout held
                  </span>
                )}
              </div>
            )}

            {/* 3. was this promised? */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold">Was this promised?</h3>
              <input
                className="input mt-1"
                placeholder="Search this vendor's promises…"
                value={promiseQ}
                onChange={(e) => setPromiseQ(e.target.value)}
              />
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                {filteredPromises.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1">{p.promiseText}</span>
                    <PromiseBadge status={p.status} />
                  </li>
                ))}
                {!filteredPromises.length && (
                  <li className="text-xs text-muted">No matching promises.</li>
                )}
              </ul>
            </div>

            {/* 4. complaints this month */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold">Complaints this month</h3>
              {!card.complaintThemes.length ? (
                <p className="text-xs text-muted">None logged.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {card.complaintThemes.map((t) => (
                    <li key={t.id} className="flex items-center justify-between text-sm">
                      <span>{t.theme}</span>
                      <span className="rounded-full bg-fill px-2 py-0.5 text-xs">{t.mentionCount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* This week's heads-up */}
      <div>
        <div className="card p-4">
          <h2 className="mb-1 text-sm font-semibold">This week's heads-up</h2>
          <p className="mb-3 text-xs text-muted">Vendors likely to generate tickets.</p>
          {!headsup?.length ? (
            <p className="text-sm text-muted">Nothing flagged this week.</p>
          ) : (
            <ul className="space-y-2">
              {headsup.map((v) => (
                <li key={v.id}>
                  <button
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-fill"
                    onClick={() => {
                      setSlug(v.slug);
                      setQ(v.name);
                    }}
                  >
                    <span className="text-sm font-medium">{v.name}</span>
                    <StatusDot status={v.status} showWord={false} size={8} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
