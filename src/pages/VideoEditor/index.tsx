import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VideoProject, Layer, TextLayer, ImageLayer, AspectRatio, ToolTab, Filters } from './types';
import VideoCanvas from './VideoCanvas';
import Timeline from './Timeline';
import ToolPanel from './ToolPanel';
import ExportModal from './ExportModal';

const DEFAULT_PROJECT: VideoProject = {
  videoUrl: null,
  fileName: '',
  duration: 0,
  trimStart: 0,
  trimEnd: 0,
  aspectRatio: '9:16',
  crop: { x: 0, y: 0, w: 1, h: 1 },
  filters: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0 },
  speed: 1,
  muted: false,
  layers: [],
};

export default function VideoEditor() {
  const navigate = useNavigate();
  const [project, setProject] = useState<VideoProject>(DEFAULT_PROJECT);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ToolTab>('trim');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync video element with project settings
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = project.speed;
    v.muted = project.muted;
  }, [project.speed, project.muted]);

  // Stop at trimEnd during playback
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const check = () => {
      setCurrentTime(v.currentTime);
      if (v.currentTime >= project.trimEnd) {
        v.pause();
        setIsPlaying(false);
      }
    };
    v.addEventListener('timeupdate', check);
    return () => v.removeEventListener('timeupdate', check);
  }, [project.trimEnd]);

  const loadVideo = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.src = url;
    probe.onloadedmetadata = () => {
      const dur = probe.duration;
      setProject(prev => ({
        ...prev,
        videoUrl: url,
        fileName: file.name,
        duration: dur,
        trimStart: 0,
        trimEnd: dur,
        layers: [],
      }));
      setCurrentTime(0);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadVideo(file);
    e.target.value = '';
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const displayWidth = 0.25;
        const layer: ImageLayer = {
          id: crypto.randomUUID(),
          kind: 'image',
          src,
          name: file.name,
          x: 0.85,
          y: 0.85,
          scale: 1,
          rotation: 0,
          opacity: 1,
          startTime: project.trimStart,
          endTime: -1,
          displayWidth,
        };
        setProject(prev => ({ ...prev, layers: [...prev.layers, layer] }));
        setSelectedLayerId(layer.id);
        setActiveTab('overlay');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const addTextLayer = useCallback(() => {
    const layer: TextLayer = {
      id: crypto.randomUUID(),
      kind: 'text',
      text: 'Your Text Here',
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      opacity: 1,
      startTime: project.trimStart,
      endTime: -1,
      fontSize: 0.06,
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      bold: true,
      italic: false,
      align: 'center',
      bgColor: '#000000',
      bgOpacity: 0.6,
      bgPadding: 0.015,
      bgRadius: 0.01,
      strokeColor: '#000000',
      strokeWidth: 0,
      shadow: false,
    };
    setProject(prev => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelectedLayerId(layer.id);
    setActiveTab('text');
  }, [project.trimStart]);

  const updateProject = useCallback(<K extends keyof VideoProject>(k: K, v: VideoProject[K]) => {
    setProject(prev => ({ ...prev, [k]: v }));
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } as Layer : l),
    }));
  }, []);

  const deleteLayer = useCallback((id: string) => {
    setProject(prev => ({ ...prev, layers: prev.layers.filter(l => l.id !== id) }));
    setSelectedLayerId(null);
  }, []);

  const reorderLayer = useCallback((from: number, to: number) => {
    if (to < 0 || to >= project.layers.length) return;
    setProject(prev => {
      const layers = [...prev.layers];
      const [item] = layers.splice(from, 1);
      layers.splice(to, 0, item);
      return { ...prev, layers };
    });
  }, [project.layers.length]);

  const handlePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v || !project.videoUrl) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      if (v.currentTime >= project.trimEnd) v.currentTime = project.trimStart;
      v.play();
      setIsPlaying(true);
    }
  }, [isPlaying, project.videoUrl, project.trimEnd, project.trimStart]);

  const handleSeek = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
    setCurrentTime(t);
  }, []);

  const handleTrimStart = useCallback((t: number) => {
    setProject(prev => ({ ...prev, trimStart: t }));
  }, []);

  const handleTrimEnd = useCallback((t: number) => {
    setProject(prev => ({ ...prev, trimEnd: t }));
  }, []);

  const handleMoveLayer = useCallback((id: string, x: number, y: number) => {
    updateLayer(id, { x, y });
  }, [updateLayer]);

  // Drop zone for drag-and-drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('video/')) loadVideo(file);
  }, [loadVideo]);

  if (!project.videoUrl) {
    return (
      <div
        className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center text-white"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Hidden video for PWA / back nav */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center px-8 max-w-sm">
          <div className="w-20 h-20 bg-blue-600/20 border-2 border-blue-600/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Video size={36} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Video Editor</h1>
          <p className="text-gray-400 text-sm mb-8">
            Crop, trim, add text & image overlays, adjust filters and export — all in your browser. Install as a PWA for offline use.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg mb-4"
          >
            Import Video
          </button>
          <p className="text-gray-500 text-xs">
            MP4, MOV, WebM supported · Videos stay on your device
          </p>
          <p className="text-gray-600 text-xs mt-2">
            iPhone tip: tap <strong className="text-gray-500">Share → Add to Home Screen</strong> to install as an app
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col text-white overflow-hidden">
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        preload="auto"
        src={project.videoUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileInput} />
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageInput} />

      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <button
          onClick={() => { videoRef.current?.pause(); setProject(DEFAULT_PROJECT); }}
          className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-gray-200 truncate flex-1">
          {project.fileName || 'Video Editor'}
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-gray-800"
        >
          Change
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium"
        >
          <Download size={14} /> Export
        </button>
      </div>

      {/* Canvas preview */}
      <VideoCanvas
        project={project}
        videoRef={videoRef as React.RefObject<HTMLVideoElement>}
        isPlaying={isPlaying}
        selectedLayerId={selectedLayerId}
        onSelectLayer={setSelectedLayerId}
        onMoveLayer={handleMoveLayer}
      />

      {/* Timeline */}
      <Timeline
        duration={project.duration}
        trimStart={project.trimStart}
        trimEnd={project.trimEnd}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        onTrimStart={handleTrimStart}
        onTrimEnd={handleTrimEnd}
        onPlayPause={handlePlayPause}
      />

      {/* Tool panel */}
      <ToolPanel
        project={project}
        activeTab={activeTab}
        selectedLayerId={selectedLayerId}
        onTabChange={setActiveTab}
        onAddText={addTextLayer}
        onAddImage={() => imageInputRef.current?.click()}
        onUpdateProject={updateProject}
        onUpdateLayer={updateLayer}
        onDeleteLayer={deleteLayer}
        onSelectLayer={setSelectedLayerId}
        onReorderLayer={reorderLayer}
        imageInputRef={imageInputRef as React.RefObject<HTMLInputElement>}
      />

      {/* Export modal */}
      {showExport && (
        <ExportModal
          project={project}
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
