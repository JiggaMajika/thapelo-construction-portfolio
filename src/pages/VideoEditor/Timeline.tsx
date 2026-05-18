import { useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface Props {
  duration: number;
  trimStart: number;
  trimEnd: number;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (t: number) => void;
  onTrimStart: (t: number) => void;
  onTrimEnd: (t: number) => void;
  onPlayPause: () => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Timeline({
  duration,
  trimStart,
  trimEnd,
  currentTime,
  isPlaying,
  onSeek,
  onTrimStart,
  onTrimEnd,
  onPlayPause,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'seek' | 'trimStart' | 'trimEnd' | null>(null);

  const getT = useCallback((clientX: number) => {
    const bar = barRef.current;
    if (!bar || duration === 0) return 0;
    const rect = bar.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return frac * duration;
  }, [duration]);

  const handleMove = useCallback((clientX: number) => {
    const t = getT(clientX);
    if (dragging.current === 'seek') onSeek(Math.max(trimStart, Math.min(trimEnd, t)));
    if (dragging.current === 'trimStart') onTrimStart(Math.max(0, Math.min(t, trimEnd - 0.1)));
    if (dragging.current === 'trimEnd') onTrimEnd(Math.min(duration, Math.max(t, trimStart + 0.1)));
  }, [getT, onSeek, onTrimStart, onTrimEnd, trimStart, trimEnd, duration]);

  const startDrag = (type: typeof dragging.current) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragging.current = type;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    handleMove(clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) handleMove(e.clientX); };
  const onTouchMove = (e: React.TouchEvent) => { e.preventDefault(); if (dragging.current) handleMove(e.touches[0].clientX); };
  const stopDrag = () => { dragging.current = null; };

  const startPct = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPct   = duration > 0 ? (trimEnd   / duration) * 100 : 100;
  const nowPct   = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-900 px-3 py-2 select-none">
      {/* Playback controls */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => onSeek(trimStart)}
          className="text-gray-400 hover:text-white p-1"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={onPlayPause}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={() => onSeek(trimEnd)}
          className="text-gray-400 hover:text-white p-1"
        >
          <SkipForward size={16} />
        </button>
        <span className="text-xs text-gray-400 font-mono ml-1">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
        <span className="text-xs text-gray-500 font-mono ml-auto">
          [{fmt(trimStart)} – {fmt(trimEnd)}]
        </span>
      </div>

      {/* Timeline bar */}
      <div
        ref={barRef}
        className="relative h-8 cursor-pointer"
        onMouseDown={startDrag('seek')}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={startDrag('seek')}
        onTouchMove={onTouchMove}
        onTouchEnd={stopDrag}
      >
        {/* Full track */}
        <div className="absolute inset-y-3 left-0 right-0 bg-gray-700 rounded-full" />

        {/* Active trim region */}
        <div
          className="absolute inset-y-3 bg-blue-600/40 rounded-sm pointer-events-none"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
          style={{ left: `${nowPct}%` }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
        </div>

        {/* Trim start handle */}
        <div
          className="absolute top-1 bottom-1 w-4 -ml-2 flex items-center justify-center cursor-ew-resize z-10"
          style={{ left: `${startPct}%` }}
          onMouseDown={e => { e.stopPropagation(); startDrag('trimStart')(e); }}
          onTouchStart={e => { e.stopPropagation(); startDrag('trimStart')(e); }}
        >
          <div className="w-2 h-6 bg-yellow-400 rounded-sm shadow-lg flex flex-col items-center justify-center gap-0.5">
            <div className="w-0.5 h-1 bg-yellow-800 rounded" />
            <div className="w-0.5 h-1 bg-yellow-800 rounded" />
          </div>
        </div>

        {/* Trim end handle */}
        <div
          className="absolute top-1 bottom-1 w-4 -ml-2 flex items-center justify-center cursor-ew-resize z-10"
          style={{ left: `${endPct}%` }}
          onMouseDown={e => { e.stopPropagation(); startDrag('trimEnd')(e); }}
          onTouchStart={e => { e.stopPropagation(); startDrag('trimEnd')(e); }}
        >
          <div className="w-2 h-6 bg-yellow-400 rounded-sm shadow-lg flex flex-col items-center justify-center gap-0.5">
            <div className="w-0.5 h-1 bg-yellow-800 rounded" />
            <div className="w-0.5 h-1 bg-yellow-800 rounded" />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1 text-center">
        Drag yellow handles to trim • drag bar to seek
      </p>
    </div>
  );
}
