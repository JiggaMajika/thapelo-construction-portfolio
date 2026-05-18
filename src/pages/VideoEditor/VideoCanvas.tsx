import { useEffect, useRef, useCallback } from 'react';
import { VideoProject, Layer, ImageLayer, TextLayer } from './types';
import { renderFrame, getOutputDimensions } from './renderFrame';

interface Props {
  project: VideoProject;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onMoveLayer: (id: string, x: number, y: number) => void;
}

export default function VideoCanvas({
  project,
  videoRef,
  isPlaying,
  selectedLayerId,
  onSelectLayer,
  onMoveLayer,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef(new Map<string, HTMLImageElement>());
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 607, h: 1080 });
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = dimRef.current;
    renderFrame(ctx, video, project, imageCache.current, w, h);

    // draw selection outline
    if (selectedLayerId) {
      const layer = project.layers.find(l => l.id === selectedLayerId);
      if (layer) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        const boxW = layer.kind === 'image'
          ? layer.displayWidth * w
          : (layer as any).fontSize * h * 6;
        const boxH = layer.kind === 'image'
          ? (layer.displayWidth * w) * 0.6
          : (layer as any).fontSize * h * 1.6;
        ctx.translate(layer.x * w, layer.y * h);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);
        ctx.strokeRect(-boxW / 2 - 8, -boxH / 2 - 8, boxW + 16, boxH + 16);
        ctx.restore();
      }
    }
  }, [project, selectedLayerId, videoRef]);

  // Update canvas dimensions when aspect ratio or video changes
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = getOutputDimensions(project.aspectRatio, video);
    dimRef.current = { w, h };
    canvas.width = w;
    canvas.height = h;
    draw();
  }, [project.aspectRatio, draw, videoRef]);

  // Render loop
  useEffect(() => {
    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // Redraw when not playing on time change
  useEffect(() => {
    if (!isPlaying) draw();
  }, [isPlaying, draw]);

  function getCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }

  function hitTestLayer(nx: number, ny: number): Layer | null {
    const { w, h } = dimRef.current;
    for (let i = project.layers.length - 1; i >= 0; i--) {
      const layer = project.layers[i];
      const lx = layer.x;
      const ly = layer.y;
      const halfW = layer.kind === 'image'
        ? (layer.displayWidth / 2) * layer.scale + 0.04
        : 0.15 * layer.scale;
      const halfH = layer.kind === 'image'
        ? (layer as ImageLayer).displayWidth * layer.scale * 0.5 + 0.04
        : (layer as TextLayer).fontSize * 1.2 * layer.scale;
      if (
        nx >= lx - halfW && nx <= lx + halfW &&
        ny >= ly - halfH && ny <= ly + halfH
      ) {
        return layer;
      }
    }
    return null;
  }

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    const pt = getCanvasPoint(clientX, clientY);
    const hit = hitTestLayer(pt.x, pt.y);
    if (hit) {
      onSelectLayer(hit.id);
      dragRef.current = {
        id: hit.id,
        startX: pt.x,
        startY: pt.y,
        origX: hit.x,
        origY: hit.y,
      };
    } else {
      onSelectLayer(null);
      dragRef.current = null;
    }
  }, [project.layers, onSelectLayer]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return;
    const pt = getCanvasPoint(clientX, clientY);
    const dx = pt.x - dragRef.current.startX;
    const dy = pt.y - dragRef.current.startY;
    const newX = Math.max(0, Math.min(1, dragRef.current.origX + dx));
    const newY = Math.max(0, Math.min(1, dragRef.current.origY + dy));
    onMoveLayer(dragRef.current.id, newX, newY);
  }, [onMoveLayer]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain touch-none select-none"
        style={{ cursor: dragRef.current ? 'grabbing' : 'default' }}
        onMouseDown={e => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={e => { e.preventDefault(); handlePointerDown(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={e => { e.preventDefault(); handlePointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
}

