import { useRef, useState, useCallback } from 'react';
import { X, Download, Loader } from 'lucide-react';
import { VideoProject } from './types';
import { renderFrame, getOutputDimensions } from './renderFrame';

interface Props {
  project: VideoProject;
  videoRef: React.RefObject<HTMLVideoElement>;
  onClose: () => void;
}

type Status = 'idle' | 'recording' | 'done' | 'error';

export default function ExportModal({ project, videoRef, onClose }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startExport = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !project.videoUrl) return;

    setStatus('recording');
    setProgress(0);
    chunksRef.current = [];

    const { w, h } = getOutputDimensions(project.aspectRatio, video);
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d')!;
    const imageCache = new Map<string, HTMLImageElement>();

    const clipDur = (project.trimEnd - project.trimStart) / project.speed;

    // Capture canvas stream
    const canvasStream = offscreen.captureStream(30);
    let combinedStream: MediaStream = canvasStream;

    // Try to capture audio
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !project.muted) {
        const audioCtx = new AudioContextClass();
        const src = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(dest);
        src.connect(audioCtx.destination);
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);
      }
    } catch {
      // audio capture unavailable, continue with video-only
    }

    const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
      ? 'video/mp4;codecs=avc1'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=h264')
      ? 'video/webm;codecs=h264'
      : 'video/webm';

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 8_000_000,
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setStatus('done');
    };

    recorder.onerror = () => {
      setErrMsg('Recording failed. Try a different browser or format.');
      setStatus('error');
    };

    // Render loop during recording
    let lastTime = -1;
    const renderLoop = () => {
      if (!video.paused && !video.ended) {
        if (video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          renderFrame(ctx, video, project, imageCache, w, h);
        }
        const elapsed = video.currentTime - project.trimStart;
        setProgress(Math.min(1, elapsed / (project.trimEnd - project.trimStart)));

        if (video.currentTime >= project.trimEnd) {
          video.pause();
          recorder.stop();
          return;
        }
        requestAnimationFrame(renderLoop);
      } else if (video.ended || video.currentTime >= project.trimEnd) {
        recorder.stop();
      } else {
        requestAnimationFrame(renderLoop);
      }
    };

    // Seek and play
    video.playbackRate = project.speed;
    video.muted = project.muted;
    video.currentTime = project.trimStart;

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      recorder.start(100);
      video.play().then(() => {
        requestAnimationFrame(renderLoop);
      }).catch(() => {
        setErrMsg('Could not play video for export.');
        setStatus('error');
        recorder.stop();
      });
    };

    video.addEventListener('seeked', onSeeked);
  }, [project, videoRef]);

  const stopExport = () => {
    recorderRef.current?.stop();
    videoRef.current?.pause();
    setStatus('idle');
  };

  const ext = blobUrl
    ? (blobUrl.includes('mp4') ? '.mp4' : '.webm')
    : '.mp4';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
      <div className="bg-gray-900 rounded-t-2xl w-full max-w-lg p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Export Video</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {status === 'idle' && (
          <div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4 space-y-2">
              <InfoRow label="Aspect Ratio" value={project.aspectRatio} />
              <InfoRow label="Duration" value={formatTime(project.trimEnd - project.trimStart)} />
              <InfoRow label="Speed" value={`${project.speed}×`} />
              <InfoRow label="Layers" value={String(project.layers.length)} />
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">
              Export records the canvas in real-time. The process takes as long as the clip duration.
            </p>
            <button
              onClick={startExport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Download size={18} /> Start Export
            </button>
          </div>
        )}

        {status === 'recording' && (
          <div className="text-center py-4">
            <Loader size={36} className="text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-white font-medium mb-2">Recording…</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm">{Math.round(progress * 100)}% complete</p>
            <button
              onClick={stopExport}
              className="mt-4 text-red-400 hover:text-red-300 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {status === 'done' && blobUrl && (
          <div className="text-center">
            <div className="text-green-400 text-4xl mb-2">✓</div>
            <p className="text-white font-medium mb-4">Export complete!</p>
            <a
              href={blobUrl}
              download={`edited-video${ext}`}
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-center mb-3"
            >
              Download Video
            </a>
            <p className="text-xs text-gray-500">
              On iPhone: tap Download then tap the video in Files / Photos to save it.
            </p>
            <button
              onClick={onClose}
              className="mt-3 text-gray-400 hover:text-gray-200 text-sm"
            >
              Close
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-4">
            <div className="text-red-400 text-4xl mb-2">⚠</div>
            <p className="text-white font-medium mb-2">Export failed</p>
            <p className="text-gray-400 text-sm mb-4">{errMsg}</p>
            <button
              onClick={() => setStatus('idle')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
