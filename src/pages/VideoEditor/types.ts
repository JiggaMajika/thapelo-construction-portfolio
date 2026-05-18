export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:3' | 'free';
export type ToolTab = 'trim' | 'crop' | 'text' | 'overlay' | 'filter' | 'speed' | 'layers';

export interface CropRect {
  x: number; // 0-1 of source video width
  y: number; // 0-1 of source video height
  w: number; // 0-1
  h: number; // 0-1
}

export interface Filters {
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturation: number; // 0-200, default 100
  hue: number;        // -180 to 180, default 0
  blur: number;       // 0-10, default 0
}

export interface BaseLayer {
  id: string;
  x: number;        // 0-1 normalized canvas x (center)
  y: number;        // 0-1 normalized canvas y (center)
  scale: number;    // 1 = 100%
  rotation: number; // degrees
  opacity: number;  // 0-1
  startTime: number;
  endTime: number;  // -1 = till end of video
}

export interface TextLayer extends BaseLayer {
  kind: 'text';
  text: string;
  fontSize: number;  // relative to canvas height (0.02–0.2)
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  bgColor: string;
  bgOpacity: number;  // 0-1
  bgPadding: number;  // relative to canvas height
  bgRadius: number;   // relative to canvas height
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
}

export interface ImageLayer extends BaseLayer {
  kind: 'image';
  src: string; // data URL
  name: string;
  displayWidth: number; // 0-1 relative to canvas width
}

export type Layer = TextLayer | ImageLayer;

export interface VideoProject {
  videoUrl: string | null;
  fileName: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  aspectRatio: AspectRatio;
  crop: CropRect;
  filters: Filters;
  speed: number;
  muted: boolean;
  layers: Layer[];
}
