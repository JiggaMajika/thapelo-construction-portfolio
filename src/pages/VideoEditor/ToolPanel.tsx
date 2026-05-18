import { useState } from 'react';
import {
  Scissors, Crop, Type, Image, Sliders, Zap, Layers,
  Plus, Trash2, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Eye, EyeOff,
} from 'lucide-react';
import { ToolTab, VideoProject, Layer, TextLayer, ImageLayer, AspectRatio, Filters } from './types';

interface Props {
  project: VideoProject;
  activeTab: ToolTab;
  selectedLayerId: string | null;
  onTabChange: (t: ToolTab) => void;
  onAddText: () => void;
  onAddImage: () => void;
  onUpdateProject: <K extends keyof VideoProject>(k: K, v: VideoProject[K]) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onSelectLayer: (id: string | null) => void;
  onReorderLayer: (from: number, to: number) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
}

const TABS: { id: ToolTab; icon: React.ReactNode; label: string }[] = [
  { id: 'trim',    icon: <Scissors size={18} />,  label: 'Trim'    },
  { id: 'crop',    icon: <Crop size={18} />,      label: 'Crop'    },
  { id: 'text',    icon: <Type size={18} />,      label: 'Text'    },
  { id: 'overlay', icon: <Image size={18} />,     label: 'Overlay' },
  { id: 'filter',  icon: <Sliders size={18} />,   label: 'Filter'  },
  { id: 'speed',   icon: <Zap size={18} />,       label: 'Speed'   },
  { id: 'layers',  icon: <Layers size={18} />,    label: 'Layers'  },
];

const FONTS = [
  'Inter, sans-serif',
  'Georgia, serif',
  'Impact, sans-serif',
  '"Courier New", monospace',
  '"Arial Black", sans-serif',
  'Verdana, sans-serif',
];

const ASPECT_RATIOS: { id: AspectRatio; label: string }[] = [
  { id: '9:16', label: '9:16 Portrait' },
  { id: '16:9', label: '16:9 Landscape' },
  { id: '1:1',  label: '1:1 Square' },
  { id: '4:3',  label: '4:3 Classic' },
  { id: 'free', label: 'Original' },
];

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

function Slider({ label, min, max, value, onChange, unit = '' }: {
  label: string; min: number; max: number; value: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(value)}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none accent-blue-500"
      />
    </div>
  );
}

function ColorPick({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="relative">
        <div
          className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <input
          type="color" value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function ToolPanel({
  project, activeTab, selectedLayerId,
  onTabChange, onAddText, onAddImage, onUpdateProject,
  onUpdateLayer, onDeleteLayer, onSelectLayer, onReorderLayer,
  imageInputRef,
}: Props) {
  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const selectedText = selectedLayer?.kind === 'text' ? selectedLayer : null;
  const selectedImage = selectedLayer?.kind === 'image' ? selectedLayer : null;

  function updateFilter<K extends keyof Filters>(key: K, val: Filters[K]) {
    onUpdateProject('filters', { ...project.filters, [key]: val });
  }

  function updateText(updates: Partial<TextLayer>) {
    if (selectedLayerId) onUpdateLayer(selectedLayerId, updates as Partial<Layer>);
  }

  function updateImage(updates: Partial<ImageLayer>) {
    if (selectedLayerId) onUpdateLayer(selectedLayerId, updates as Partial<Layer>);
  }

  return (
    <div className="flex flex-col bg-gray-950 border-t border-gray-800">
      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] text-[10px] transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="overflow-y-auto" style={{ maxHeight: '260px', minHeight: '200px' }}>
        <div className="p-3">

          {/* TRIM */}
          {activeTab === 'trim' && (
            <div>
              <p className="text-xs text-gray-400 mb-3">
                Use the timeline handles above to set your trim points.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Trim In</div>
                  <div className="text-white font-mono text-sm">
                    {formatTime(project.trimStart)}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Trim Out</div>
                  <div className="text-white font-mono text-sm">
                    {formatTime(project.trimEnd)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Clip Duration</div>
                <div className="text-white font-mono text-sm">
                  {formatTime(project.trimEnd - project.trimStart)}
                </div>
              </div>
            </div>
          )}

          {/* CROP */}
          {activeTab === 'crop' && (
            <div>
              <p className="text-xs text-gray-400 mb-3">Select output aspect ratio</p>
              <div className="grid grid-cols-1 gap-2">
                {ASPECT_RATIOS.map(ar => (
                  <button
                    key={ar.id}
                    onClick={() => onUpdateProject('aspectRatio', ar.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      project.aspectRatio === ar.id
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <AspectRatioIcon ratio={ar.id} />
                    <span className="text-sm">{ar.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TEXT */}
          {activeTab === 'text' && (
            <div>
              {!selectedText ? (
                <div>
                  <button
                    onClick={onAddText}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mb-3"
                  >
                    <Plus size={16} /> Add Text
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Tap a text layer on the canvas or in Layers tab to edit
                  </p>
                </div>
              ) : (
                <div>
                  {/* Text content */}
                  <textarea
                    value={selectedText.text}
                    onChange={e => updateText({ text: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg p-2 text-sm mb-3 border border-gray-700 focus:border-blue-500 outline-none resize-none"
                    rows={3}
                    placeholder="Type your text..."
                  />

                  {/* Font */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 block mb-1">Font</label>
                    <select
                      value={selectedText.fontFamily}
                      onChange={e => updateText({ fontFamily: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-2 py-1.5 text-sm border border-gray-700"
                    >
                      {FONTS.map(f => (
                        <option key={f} value={f} style={{ fontFamily: f }}>
                          {f.split(',')[0].replace(/"/g, '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Slider label="Font Size" min={2} max={20} value={Math.round(selectedText.fontSize * 100)} unit="%" onChange={v => updateText({ fontSize: v / 100 })} />

                  {/* Style buttons */}
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => updateText({ bold: !selectedText.bold })}
                      className={`p-2 rounded ${selectedText.bold ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <Bold size={14} />
                    </button>
                    <button onClick={() => updateText({ italic: !selectedText.italic })}
                      className={`p-2 rounded ${selectedText.italic ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <Italic size={14} />
                    </button>
                    <button onClick={() => updateText({ align: 'left' })}
                      className={`p-2 rounded ${selectedText.align === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <AlignLeft size={14} />
                    </button>
                    <button onClick={() => updateText({ align: 'center' })}
                      className={`p-2 rounded ${selectedText.align === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <AlignCenter size={14} />
                    </button>
                    <button onClick={() => updateText({ align: 'right' })}
                      className={`p-2 rounded ${selectedText.align === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <AlignRight size={14} />
                    </button>
                  </div>

                  <ColorPick label="Text Color" value={selectedText.color} onChange={v => updateText({ color: v })} />

                  <div className="border-t border-gray-700 pt-3 mb-3">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">Background Box</p>
                    <ColorPick label="Box Color" value={selectedText.bgColor} onChange={v => updateText({ bgColor: v })} />
                    <Slider label="Box Opacity" min={0} max={100} value={Math.round(selectedText.bgOpacity * 100)} unit="%" onChange={v => updateText({ bgOpacity: v / 100 })} />
                    <Slider label="Padding" min={0} max={5} value={Math.round(selectedText.bgPadding * 100)} unit="%" onChange={v => updateText({ bgPadding: v / 100 })} />
                    <Slider label="Corner Radius" min={0} max={5} value={Math.round(selectedText.bgRadius * 100)} unit="%" onChange={v => updateText({ bgRadius: v / 100 })} />
                  </div>

                  <div className="border-t border-gray-700 pt-3 mb-3">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">Stroke & Shadow</p>
                    <ColorPick label="Stroke Color" value={selectedText.strokeColor || '#000000'} onChange={v => updateText({ strokeColor: v })} />
                    <Slider label="Stroke Width" min={0} max={10} value={selectedText.strokeWidth} onChange={v => updateText({ strokeWidth: v })} />
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Drop Shadow</span>
                      <button
                        onClick={() => updateText({ shadow: !selectedText.shadow })}
                        className={`w-12 h-6 rounded-full transition-colors ${selectedText.shadow ? 'bg-blue-600' : 'bg-gray-600'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${selectedText.shadow ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <Slider label="Opacity" min={0} max={100} value={Math.round(selectedText.opacity * 100)} unit="%" onChange={v => updateText({ opacity: v / 100 })} />
                  <Slider label="Rotation" min={-180} max={180} value={selectedText.rotation} unit="°" onChange={v => updateText({ rotation: v })} />
                  <Slider label="Scale" min={10} max={300} value={Math.round(selectedText.scale * 100)} unit="%" onChange={v => updateText({ scale: v / 100 })} />

                  <button
                    onClick={() => { onDeleteLayer(selectedLayerId!); }}
                    className="w-full flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-red-400 py-2 rounded-lg mt-2"
                  >
                    <Trash2 size={14} /> Delete Layer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OVERLAY */}
          {activeTab === 'overlay' && (
            <div>
              {!selectedImage ? (
                <div>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg mb-3"
                  >
                    <Plus size={16} /> Add Image / Logo
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    PNG with transparency works best
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <p className="col-span-2 text-xs text-gray-400 font-semibold">Quick positions</p>
                    {['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'].map(pos => (
                      <button
                        key={pos}
                        className="bg-gray-800 text-gray-300 text-xs py-2 rounded border border-gray-700 hover:border-purple-500"
                        onClick={() => {
                          if (!selectedLayerId) return;
                          const positions: Record<string, { x: number; y: number }> = {
                            'Top-Left': { x: 0.12, y: 0.08 },
                            'Top-Right': { x: 0.88, y: 0.08 },
                            'Bottom-Left': { x: 0.12, y: 0.92 },
                            'Bottom-Right': { x: 0.88, y: 0.92 },
                          };
                          onUpdateLayer(selectedLayerId, positions[pos]);
                        }}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Image size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-300 truncate">{selectedImage.name}</span>
                  </div>
                  <Slider label="Size" min={5} max={80} value={Math.round(selectedImage.displayWidth * 100)} unit="%" onChange={v => updateImage({ displayWidth: v / 100 })} />
                  <Slider label="Opacity" min={0} max={100} value={Math.round(selectedImage.opacity * 100)} unit="%" onChange={v => updateImage({ opacity: v / 100 })} />
                  <Slider label="Rotation" min={-180} max={180} value={selectedImage.rotation} unit="°" onChange={v => updateImage({ rotation: v })} />
                  <Slider label="Scale" min={10} max={300} value={Math.round(selectedImage.scale * 100)} unit="%" onChange={v => updateImage({ scale: v / 100 })} />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <p className="col-span-2 text-xs text-gray-400 font-semibold mb-1">Quick positions</p>
                    {['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'].map(pos => {
                      const positions: Record<string, { x: number; y: number }> = {
                        'Top-Left': { x: 0.12, y: 0.08 },
                        'Top-Right': { x: 0.88, y: 0.08 },
                        'Bottom-Left': { x: 0.12, y: 0.92 },
                        'Bottom-Right': { x: 0.88, y: 0.92 },
                      };
                      return (
                        <button
                          key={pos}
                          className="bg-gray-800 text-gray-300 text-xs py-2 rounded border border-gray-700 hover:border-purple-500"
                          onClick={() => onUpdateLayer(selectedLayerId!, positions[pos])}
                        >
                          {pos}
                        </button>
                      );
                    })}
                    <button
                      className="col-span-2 bg-gray-800 text-gray-300 text-xs py-2 rounded border border-gray-700 hover:border-purple-500"
                      onClick={() => onUpdateLayer(selectedLayerId!, { x: 0.5, y: 0.5 })}
                    >
                      Center
                    </button>
                  </div>

                  <button
                    onClick={() => { onDeleteLayer(selectedLayerId!); }}
                    className="w-full flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-red-400 py-2 rounded-lg mt-3"
                  >
                    <Trash2 size={14} /> Delete Layer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FILTER */}
          {activeTab === 'filter' && (
            <div>
              <Slider label="Brightness" min={0} max={200} value={project.filters.brightness} onChange={v => updateFilter('brightness', v)} />
              <Slider label="Contrast" min={0} max={200} value={project.filters.contrast} onChange={v => updateFilter('contrast', v)} />
              <Slider label="Saturation" min={0} max={200} value={project.filters.saturation} onChange={v => updateFilter('saturation', v)} />
              <Slider label="Hue Shift" min={-180} max={180} value={project.filters.hue} unit="°" onChange={v => updateFilter('hue', v)} />
              <Slider label="Blur" min={0} max={10} value={project.filters.blur} onChange={v => updateFilter('blur', v)} />
              <button
                onClick={() => onUpdateProject('filters', { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0 })}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-lg mt-1"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* SPEED */}
          {activeTab === 'speed' && (
            <div>
              <p className="text-xs text-gray-400 mb-3">Playback speed</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => onUpdateProject('speed', s)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      project.speed === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Mute Audio</span>
                <button
                  onClick={() => onUpdateProject('muted', !project.muted)}
                  className={`w-12 h-6 rounded-full transition-colors ${project.muted ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${project.muted ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* LAYERS */}
          {activeTab === 'layers' && (
            <div>
              {project.layers.length === 0 ? (
                <div className="text-center text-gray-500 py-6 text-sm">
                  No layers yet.<br />
                  <span className="text-xs">Add text or image overlays above.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...project.layers].reverse().map((layer, revIdx) => {
                    const idx = project.layers.length - 1 - revIdx;
                    const isSelected = layer.id === selectedLayerId;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => { onSelectLayer(layer.id); onTabChange(layer.kind === 'text' ? 'text' : 'overlay'); }}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-950/50' : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                        }`}
                      >
                        {layer.kind === 'text' ? <Type size={14} className="text-blue-400 shrink-0" /> : <Image size={14} className="text-purple-400 shrink-0" />}
                        <span className="text-xs text-gray-200 truncate flex-1">
                          {layer.kind === 'text' ? (layer as TextLayer).text.slice(0, 30) : (layer as ImageLayer).name}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={e => { e.stopPropagation(); onReorderLayer(idx, idx + 1); }}
                            disabled={idx === project.layers.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-200 disabled:opacity-30">
                            <ChevronDown size={12} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); onReorderLayer(idx, idx - 1); }}
                            disabled={idx === 0}
                            className="p-1 text-gray-500 hover:text-gray-200 disabled:opacity-30">
                            <ChevronUp size={12} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); onUpdateLayer(layer.id, { opacity: layer.opacity === 0 ? 1 : 0 }); }}
                            className="p-1 text-gray-500 hover:text-gray-200">
                            {layer.opacity === 0 ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button onClick={e => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                            className="p-1 text-red-500 hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function AspectRatioIcon({ ratio }: { ratio: AspectRatio }) {
  const dims: Record<string, { w: number; h: number }> = {
    '9:16': { w: 14, h: 24 },
    '16:9': { w: 24, h: 14 },
    '1:1':  { w: 18, h: 18 },
    '4:3':  { w: 22, h: 16 },
    'free': { w: 20, h: 14 },
  };
  const d = dims[ratio] || { w: 18, h: 18 };
  return (
    <div
      className="border-2 border-current rounded-sm"
      style={{ width: d.w, height: d.h }}
    />
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
