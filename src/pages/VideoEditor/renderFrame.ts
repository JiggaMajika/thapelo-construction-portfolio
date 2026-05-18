import { VideoProject, Layer, TextLayer, ImageLayer, AspectRatio } from './types';

export function getOutputDimensions(aspectRatio: AspectRatio, videoEl: HTMLVideoElement | null): { w: number; h: number } {
  const h = 1080;
  const sourceAspect = videoEl ? videoEl.videoWidth / videoEl.videoHeight : 9 / 16;
  const ratio =
    aspectRatio === '9:16' ? 9 / 16 :
    aspectRatio === '16:9' ? 16 / 9 :
    aspectRatio === '1:1'  ? 1 :
    aspectRatio === '4:3'  ? 4 / 3 :
    sourceAspect;
  return { w: Math.round(h * ratio), h };
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  project: VideoProject,
  imageCache: Map<string, HTMLImageElement>,
  cw: number,
  ch: number,
): void {
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);

  if (video.readyState < 2) return;

  const { brightness, contrast, saturation, hue, blur } = project.filters;
  const filterStr = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
    `hue-rotate(${hue}deg)`,
    blur > 0 ? `blur(${blur}px)` : '',
  ].filter(Boolean).join(' ');

  ctx.save();
  ctx.filter = filterStr;

  const { x: cx, y: cy, w: cw2, h: ch2 } = project.crop;
  const sw = video.videoWidth * cw2;
  const sh = video.videoHeight * ch2;
  const sx = video.videoWidth * cx;
  const sy = video.videoHeight * cy;
  const srcAspect = sw / sh;
  const dstAspect = cw / ch;

  let dx = 0, dy = 0, dw = cw, dh = ch;
  if (srcAspect > dstAspect) {
    dh = ch;
    dw = ch * srcAspect;
    dx = (cw - dw) / 2;
  } else {
    dw = cw;
    dh = cw / srcAspect;
    dy = (ch - dh) / 2;
  }

  ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();

  const t = video.currentTime;
  for (const layer of project.layers) {
    const end = layer.endTime === -1 ? project.duration : layer.endTime;
    if (t < layer.startTime || t > end) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.x * cw, layer.y * ch);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);

    if (layer.kind === 'text') {
      drawText(ctx, layer, cw, ch);
    } else {
      drawImage(ctx, layer, cw, ch, imageCache);
    }

    ctx.restore();
  }
}

function drawText(ctx: CanvasRenderingContext2D, layer: TextLayer, cw: number, ch: number) {
  const fs = layer.fontSize * ch;
  ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${fs}px ${layer.fontFamily}`;
  ctx.textAlign = layer.align;
  ctx.textBaseline = 'middle';

  const lines = layer.text.split('\n');
  const lineH = fs * 1.3;
  const totalH = lines.length * lineH;
  const pad = layer.bgPadding * ch;

  const measuredWidths = lines.map(l => ctx.measureText(l).width);
  const maxW = Math.max(...measuredWidths);

  const bgX = layer.align === 'center' ? -maxW / 2 - pad :
               layer.align === 'left'   ? -pad :
               -(maxW + pad);
  const bgY = -totalH / 2 - pad;
  const bgW = maxW + pad * 2;
  const bgH = totalH + pad * 2;

  if (layer.bgOpacity > 0) {
    ctx.save();
    ctx.globalAlpha *= layer.bgOpacity;
    ctx.fillStyle = layer.bgColor;
    const r = layer.bgRadius * ch;
    if ((ctx as any).roundRect) {
      ctx.beginPath();
      (ctx as any).roundRect(bgX, bgY, bgW, bgH, r);
      ctx.fill();
    } else {
      ctx.fillRect(bgX, bgY, bgW, bgH);
    }
    ctx.restore();
  }

  if (layer.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = fs * 0.12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  if (layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth;
    ctx.lineJoin = 'round';
    lines.forEach((line, i) => {
      ctx.strokeText(line, 0, (i - (lines.length - 1) / 2) * lineH);
    });
  }

  ctx.fillStyle = layer.color;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineH);
  });

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  cw: number,
  ch: number,
  cache: Map<string, HTMLImageElement>,
) {
  let img = cache.get(layer.src);
  if (!img) {
    img = new Image();
    img.src = layer.src;
    cache.set(layer.src, img);
  }
  if (!img.complete || img.naturalWidth === 0) return;

  const w = layer.displayWidth * cw;
  const h = w * (img.naturalHeight / img.naturalWidth);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
}
