import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldCheck, Wifi, Cpu, ChevronRight, Lock } from 'lucide-react';

export interface LiveHUDProps {
  status: 'CONNECTING' | 'ACTIVE' | 'DOUBTFUL' | 'FAKE' | 'ENDED';
  syntheticRisk: number; // 0 to 100
  latencyMs?: number;
  cpuUsage?: number;
  c2paVerified?: boolean;
  platform?: string;
  isMinimised?: boolean;
  onToggleMinimise?: () => void;
  onExpandDetails?: () => void;
}

export const LiveHUD: React.FC<LiveHUDProps> = ({
  status,
  syntheticRisk,
  latencyMs = 42,
  cpuUsage = 8.4,
  c2paVerified = true,
  platform = 'VoIP Live',
  isMinimised = false,
  onToggleMinimise,
  onExpandDetails,
}) => {
  const isFake = status === 'FAKE';
  const isDoubt = status === 'DOUBTFUL';
  const isConnecting = status === 'CONNECTING';

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let step = 0;

    const renderWaveform = () => {
      step += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isFake ? '#ef4444' : isDoubt ? '#f59e0b' : '#3b82f6';

      const sliceWidth = canvas.width / 40;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        // Subtle waveform if connecting, wider variance if doubtful/fake, standard if active
        const amplitude = isConnecting ? 4 : isFake ? 14 : isDoubt ? 10 : 8;
        const v = Math.sin(step + i * 0.3) * amplitude;
        const y = canvas.height / 2 + v;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      animationFrameId = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();
    return () => cancelAnimationFrame(animationFrameId);
  }, [status, isFake, isDoubt, isConnecting]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`absolute top-4 right-4 z-40 select-none bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex flex-col space-y-3 w-72 text-slate-100`}
    >
      {isMinimised ? (
        /* Minimised Floating Pill Badge */
        <div 
          onClick={onToggleMinimise}
          className="flex items-center space-x-2 cursor-pointer w-full"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isFake ? 'bg-red-400' : isDoubt ? 'bg-amber-400' : 'bg-blue-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isFake ? 'bg-red-500' : isDoubt ? 'bg-amber-500' : 'bg-blue-500'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-medium">TrustLine HUD</span>
        </div>
      ) : (
        /* Expanded Live Stream Overlay HUD */
        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isFake ? 'bg-red-500' : isDoubt ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`} />
              <span className="text-xs font-semibold tracking-wide">Live Biometric Stream</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/70">
                {platform}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {onToggleMinimise && (
                <button
                  onClick={onToggleMinimise}
                  className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                  title="Minimise HUD"
                >
                  _
                </button>
              )}
            </div>
          </div>

          {/* Micro-Batching Pulsing Waveform Visualizer */}
          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex flex-col space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <Activity className="w-3 h-3" style={{ color: isFake ? '#ef4444' : isDoubt ? '#f59e0b' : '#3b82f6' }} />
                <span>100ms FFT Window</span>
              </span>
              <span className={`text-[10px] ${c2paVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                C2PA {c2paVerified ? 'Verified' : 'Tampered'}
              </span>
            </div>

            {/* Active Canvas Audio Waveform Bars */}
            <canvas ref={canvasRef} width="240" height="36" className="w-full h-9 rounded bg-slate-900/50" />
          </div>

          {/* Real-time Telemetry Indicators */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col">
              <span>DSP Load</span>
              <span className="text-slate-200 font-semibold mt-0.5 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-blue-400" /> {cpuUsage}%
              </span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col">
              <span>Latency</span>
              <span className="text-slate-200 font-semibold mt-0.5 flex items-center">
                <Wifi className="w-3 h-3 mr-1 text-emerald-400" /> {latencyMs}ms
              </span>
            </div>
          </div>

          {/* Quick Action Footer */}
          {onExpandDetails && (
            <button
              onClick={onExpandDetails}
              className="w-full py-1.5 text-center text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <span>View Forensic Breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
export default LiveHUD;
