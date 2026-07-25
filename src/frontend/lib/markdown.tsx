import type { ReactNode } from 'react';

// Minimal, safe markdown -> React (no dangerouslySetInnerHTML).
// Supports #/##/### headings, - lists, **bold**, *italic*, `code`, links, paragraphs.
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5">
          {list.map((li, i) => (
            <li key={i}>{inline(li)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) {
      flushList();
      blocks.push(<h3 key={key++} className="mt-4 text-base font-semibold">{inline(line.replace(/^###\s+/, ''))}</h3>);
    } else if (/^##\s+/.test(line)) {
      flushList();
      blocks.push(<h2 key={key++} className="mt-5 text-lg font-semibold">{inline(line.replace(/^##\s+/, ''))}</h2>);
    } else if (/^#\s+/.test(line)) {
      flushList();
      blocks.push(<h1 key={key++} className="mt-2 text-xl font-semibold">{inline(line.replace(/^#\s+/, ''))}</h1>);
    } else if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''));
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={key++} className="my-2 text-sm leading-relaxed">{inline(line)}</p>);
    }
  }
  flushList();
  return <div className="prose-sm max-w-none">{blocks}</div>;
}

function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="rounded bg-fill px-1 text-xs">{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-ink underline">
          {link[1]}
        </a>
      );
    return <span key={i}>{p}</span>;
  });
}
