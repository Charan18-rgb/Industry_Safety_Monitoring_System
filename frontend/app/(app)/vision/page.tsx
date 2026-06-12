'use client';

import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, CheckCircle2, History, ShieldAlert } from 'lucide-react';
import { useSimulationDomainStore, type CameraDetectionState } from '@/store/simulationDomain';
import { formatRelativeTime } from '@/lib/utils';

const STATE_LABELS: Record<CameraDetectionState, string> = {
  active: 'ACTIVE',
  compliant: 'COMPLIANT',
  violation_detected: 'VIOLATION DETECTED',
};

export default function CameraMonitoringPage() {
  const webcamRef = useRef<Webcam>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const cameraState = useSimulationDomainStore((state) => state.cameraState);
  const captureHistory = useSimulationDomainStore((state) => state.captureHistory);
  const violationHistory = useSimulationDomainStore((state) => state.violationHistory);
  const setCameraState = useSimulationDomainStore((state) => state.setCameraState);
  const recordCapture = useSimulationDomainStore((state) => state.recordCapture);
  const startScenario = useSimulationDomainStore((state) => state.startScenario);

  const capture = (state: CameraDetectionState) => {
    const imageUrl = webcamRef.current?.getScreenshot() ?? undefined;
    recordCapture({
      state,
      source: 'camera',
      imageUrl,
      notes: state === 'compliant' ? 'PPE compliance confirmed.' : 'Camera frame captured for review.',
    });
  };

  const stateColor = cameraState === 'violation_detected' ? '#ff3355' : cameraState === 'compliant' ? '#00ff88' : '#00d4ff';

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Camera Monitoring</h1>
          <p className="text-[#7fa3c4] text-sm mt-1">Camera preview, PPE simulation, capture history, and violation records</p>
        </div>
        <div className="px-3 py-2 rounded-lg border font-mono text-xs" style={{ color: stateColor, borderColor: `${stateColor}45`, background: `${stateColor}10` }}>
          Detection: {cameraEnabled ? STATE_LABELS[cameraState] : 'CAMERA OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <section className="glass-card overflow-hidden">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {cameraEnabled ? (
              <>
                <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{ facingMode: 'user' }} />
                <div className="absolute inset-4 border border-cyan-400/25 pointer-events-none">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 text-[10px] font-mono" style={{ color: stateColor }}>{STATE_LABELS[cameraState]}</div>
                </div>
              </>
            ) : (
              <div className="text-center text-[#587996]"><CameraOff className="w-10 h-10 mx-auto mb-3" /><p className="text-sm">Camera disabled</p></div>
            )}
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            <button onClick={() => { setCameraEnabled((value) => !value); setCameraState('active'); }} className="action-button text-cyan-400 border-cyan-400/30">
              {cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
            </button>
            <button disabled={!cameraEnabled} onClick={() => capture('active')} className="action-button text-blue-400 border-blue-400/30 disabled:opacity-40">Capture Frame</button>
            <button disabled={!cameraEnabled} onClick={() => capture('compliant')} className="action-button text-green-400 border-green-400/30 disabled:opacity-40">Mark Compliant</button>
            <button disabled={!cameraEnabled} onClick={() => startScenario('ppe_violation')} className="action-button text-red-400 border-red-400/30 disabled:opacity-40">Simulate Violation</button>
          </div>
        </section>

        <section className="glass-card p-4">
          <div className="flex items-center gap-2 text-white text-sm font-semibold mb-4"><History className="w-4 h-4 text-cyan-400" />Capture History</div>
          <div className="space-y-3 max-h-[470px] overflow-y-auto">
            {captureHistory.length === 0 ? (
              <div className="py-14 text-center text-[#587996] text-xs">No captures recorded.</div>
            ) : captureHistory.map((captureItem) => (
              <div key={captureItem.id} className="flex gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                {captureItem.imageUrl ? <img src={captureItem.imageUrl} alt="Camera capture" className="w-20 h-14 object-cover rounded" /> : (
                  <div className="w-20 h-14 rounded bg-black/40 flex items-center justify-center"><Camera className="w-4 h-4 text-[#587996]" /></div>
                )}
                <div className="min-w-0">
                  <div className={`text-[10px] font-mono ${captureItem.state === 'violation_detected' ? 'text-red-400' : captureItem.state === 'compliant' ? 'text-green-400' : 'text-cyan-400'}`}>{STATE_LABELS[captureItem.state]}</div>
                  <div className="text-[#7fa3c4] text-xs mt-1">{captureItem.notes}</div>
                  <div className="text-[#3a5a7a] text-[10px] mt-1">{formatRelativeTime(captureItem.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white text-sm font-semibold"><ShieldAlert className="w-4 h-4 text-red-400" />Violation History</div>
          <span className="text-red-400 text-xs font-mono">{violationHistory.length} records</span>
        </div>
        {violationHistory.length === 0 ? (
          <div className="flex items-center gap-2 text-green-400 text-xs"><CheckCircle2 className="w-4 h-4" />No PPE violations recorded.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {violationHistory.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-red-400/20 bg-red-400/5">
                <div className="text-red-400 text-xs font-mono">PPE VIOLATION</div>
                <div className="text-[#7fa3c4] text-xs mt-1">{item.notes}</div>
                <div className="text-[#3a5a7a] text-[10px] mt-2">{new Date(item.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
