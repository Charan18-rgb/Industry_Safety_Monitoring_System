'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Video, VideoOff, Download, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function VisionPage() {
  const webcamRef = useRef<Webcam>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<{src: string, num: number, date: string, time: string}[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleStartCamera = () => {
    setCameraError(null);
    setCameraActive(true);
  };

  const handleStopCamera = () => {
    setCameraActive(false);
    setCameraError(null);
  };

  const handleUserMediaError = useCallback(() => {
    setCameraActive(false);
    setCameraError('Camera access unavailable. Please grant browser permission and try again.');
  }, []);

  const captureScreenshot = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot({ width: 640, height: 480 });
    if (imageSrc) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 640, 480);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, 430, 640, 50);
          ctx.fillStyle = '#00d4ff';
          ctx.font = 'bold 16px monospace';
          // Find the capture number based on previous state inside setter
          setScreenshots((prev) => {
            const num = prev.length + 1;
            ctx.fillText(`CAPTURE #${num}`, 15, 452);
            ctx.fillStyle = 'white';
            ctx.fillText(`${dateStr} | ${timeStr}`, 15, 472);
            return [{ src: canvas.toDataURL('image/jpeg'), num, date: dateStr, time: timeStr }, ...prev];
          });
        }
      };
      img.src = imageSrc;
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Live Vision Camera</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Reliable camera monitoring and manual capture</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card relative overflow-hidden group flex flex-col h-[500px]">
            {/* Camera feed */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {cameraError ? (
                <div className="flex flex-col items-center gap-3 text-center px-6">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <p className="text-red-400 text-sm font-medium">{cameraError}</p>
                  <p className="text-[#3a5a7a] text-xs">Check your browser settings and allow camera access.</p>
                </div>
              ) : cameraActive ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                  screenshotQuality={0.8}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="text-[#3a5a7a] flex flex-col items-center gap-3">
                  <VideoOff className="w-12 h-12" />
                  <p className="text-sm">Camera is stopped. Click Start Camera to begin.</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-[rgba(0,212,255,0.08)] bg-[#040c14] flex justify-between items-center">
              <div className="flex gap-3">
                {!cameraActive ? (
                  <button
                    onClick={handleStartCamera}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={handleStopCamera}
                    className="px-6 py-2 bg-red-500/20 text-red-400 font-bold rounded-lg border border-red-500/50 hover:bg-red-500/30 transition-all flex items-center gap-2"
                  >
                    <VideoOff className="w-4 h-4" /> Stop Camera
                  </button>
                )}
              </div>
              <button
                onClick={captureScreenshot}
                disabled={!cameraActive}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Capture Screenshot
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              Captured Screenshots ({screenshots.length})
            </h3>

            <div className="h-64 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {screenshots.length > 0 ? (
                screenshots.map((item) => (
                  <div key={item.num} className="relative rounded-lg overflow-hidden border border-[rgba(0,212,255,0.2)] bg-black/50 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={`Capture ${item.num}`} className="w-full h-auto cursor-pointer" onClick={() => setSelectedImage(item.src)} />
                    <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-cyan-400 text-xs font-mono font-bold">#{item.num}</span>
                       <a href={item.src} download={`aegis-capture-${item.num}.jpg`} className="text-white hover:text-cyan-400 transition-colors">
                         <Download className="w-4 h-4" />
                       </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#3a5a7a] space-y-3">
                  <Camera className="w-8 h-8 opacity-50" />
                  <p className="text-sm">No screenshots yet.</p>
                  <p className="text-xs">Start the camera and capture a frame.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-5 border border-dashed border-[rgba(0,212,255,0.2)]">
            <div className="text-center">
              <h3 className="text-[#7fa3c4] font-bold mb-2 uppercase tracking-widest text-sm">AI Detection</h3>
              <p className="text-[#3a5a7a] text-xs">Future Enhancement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} className="w-full h-auto rounded-xl border border-[rgba(0,212,255,0.3)] shadow-[0_0_50px_rgba(0,212,255,0.15)]" alt="Full screen capture" />
            <div className="absolute top-4 right-4 flex gap-3">
              <a href={selectedImage} download="aegis-capture.jpg" className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30 hover:bg-cyan-500/40 transition-colors backdrop-blur-md">
                <Download className="w-5 h-5" />
              </a>
              <button onClick={() => setSelectedImage(null)} className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 hover:bg-red-500/40 transition-colors backdrop-blur-md">
                <AlertCircle className="w-5 h-5 rotate-45" /> {/* Use as close icon fallback */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
