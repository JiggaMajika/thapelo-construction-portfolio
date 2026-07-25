import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface SearchResults {
  vendors: { id: string; name: string; slug: string; status: string }[];
  issues: { id: string; title: string; vendorSlug: string }[];
  promises: { id: string; text: string; vendorSlug: string }[];
}

export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // "/" focuses the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(
          (document.activeElement?.tagName || '') as string,
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await api.get<SearchResults>(
          `/search?q=${encodeURIComponent(q)}`,
        );
        setResults(r);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (path: string) => {
    setOpen(false);
    setQ('');
    navigate(path);
  };

  const hasResults =
    results &&
    (results.vendors.length || results.issues.length || results.promises.length);

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        className="input bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/60"
        placeholder="Search vendors, issues, promises…  ( / )"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results && setOpen(true)}
      />
      {open && results && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-line bg-white text-ink shadow-xl">
            {!hasResults ? (
              <p className="p-3 text-sm text-muted">No matches for “{q}”.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto py-1">
                <Section title="Vendors" show={results.vendors.length > 0}>
                  {results.vendors.map((v) => (
                    <Row key={v.id} onClick={() => go(`/vendors/${v.slug}`)}>
                      {v.name}
                    </Row>
                  ))}
                </Section>
                <Section title="Issues" show={results.issues.length > 0}>
                  {results.issues.map((i) => (
                    <Row key={i.id} onClick={() => go(`/vendors/${i.vendorSlug}`)}>
                      {i.title}
                    </Row>
                  ))}
                </Section>
                <Section title="Promises" show={results.promises.length > 0}>
                  {results.promises.map((p) => (
                    <Row key={p.id} onClick={() => go(`/vendors/${p.vendorSlug}`)}>
                      {p.text}
                    </Row>
                  ))}
                </Section>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="py-1">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-fill"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
