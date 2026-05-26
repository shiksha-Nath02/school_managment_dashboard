import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * CameraCapture
 * Props:
 *   open       boolean
 *   onClose    () => void
 *   onCapture  (dataUrl: string) => void   — called with base64 JPEG when user confirms
 *   title      string
 *   hint       string   — optional subtitle shown below title
 */
export default function CameraCapture({ open, onClose, onCapture, title = 'Take a photo', hint }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [snapshot, setSnapshot] = useState(null); // base64 dataUrl
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setSnapshot(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission and try again.');
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopStream();
      setSnapshot(null);
      setError(null);
    }
    return stopStream;
  }, [open, startCamera, stopStream]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSnapshot(dataUrl);
    stopStream();
  };

  const retake = () => {
    setSnapshot(null);
    startCamera();
  };

  const confirm = () => {
    if (snapshot) {
      onCapture(snapshot);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">{title}</h3>
              {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Preview */}
        <div className="relative bg-black aspect-[4/3] overflow-hidden">
          {/* Live feed — hidden once snapshot taken */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${snapshot ? 'hidden' : 'block'}`}
          />

          {/* Snapshot preview */}
          {snapshot && (
            <img src={snapshot} alt="Captured" className="w-full h-full object-cover" />
          )}

          {/* Camera loading state */}
          {!snapshot && !cameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-sm font-medium opacity-60">Starting camera...</div>
            </div>
          )}

          {/* Capture guide overlay */}
          {!snapshot && cameraReady && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner guides */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-44 border-2 border-white/60 rounded-2xl" />
              <p className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-xs font-medium">
                Position face in frame
              </p>
            </div>
          )}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border-b border-red-100 px-5 py-3 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3">
          {!snapshot ? (
            <>
              <button
                onClick={capture}
                disabled={!cameraReady}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={confirm}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Use this photo
              </button>
              <button
                onClick={retake}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
