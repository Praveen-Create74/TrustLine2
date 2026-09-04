import React, { useState, useRef, useEffect } from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  PhoneOff,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Fingerprint,
  Activity,
  FileCheck2,
  FileX2,
  Video,
  Sparkles,
} from 'lucide-react';

export const FloatingActionHUD: React.FC = () => {
  const {
    activeCall,
    hudState,
    setHudMode,
    toggleHudDrawer,
    hangUpCall,
    blockCaller,
  } = useTrustLine();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 16, y: 70 });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live Canvas Animated Mel-Spectrogram & Waveform
  useEffect(() => {
    if (!canvasRef.current || !activeCall) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let tick = 0;

    const render = () => {
      tick += 0.08;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const tier = activeCall.currentTier;
      const isFake = tier === 'Fake';
      const isDoubt = tier === 'Doubt';

      // 1.2 Locked Decision: Clean State uses subtle pulsing blue waveform
      const primaryColor = isFake
        ? 'rgba(239, 68, 68, 0.9)'
        : isDoubt
        ? 'rgba(245, 158, 11, 0.9)'
        : 'rgba(56, 189, 248, 0.9)'; // Pulsing blue for Clean

      const accentColor = isFake
        ? 'rgba(254, 202, 202, 0.6)'
        : isDoubt
        ? 'rgba(254, 240, 138, 0.6)'
        : 'rgba(186, 230, 253, 0.6)'; // Soft blue accent for Clean

      // Draw Mel-Spectrogram waterfall columns
      const cols = 28;
      const colWidth = width / cols;

      for (let i = 0; i < cols; i++) {
        const noise = Math.sin(tick * 1.5 + i * 0.45) * 0.5 + 0.5;
        const jitter = isFake ? Math.cos(tick * 3 + i) * 0.35 : 0;
        const colHeight = Math.max(4, (noise + jitter) * height * 0.75);

        const grad = ctx.createLinearGradient(0, height, 0, height - colHeight);
        grad.addColorStop(0, primaryColor);
        grad.addColorStop(1, accentColor);

        ctx.fillStyle = grad;
        ctx.fillRect(i * colWidth + 1, height - colHeight, colWidth - 2, colHeight);
      }

      // Draw continuous pulsing blue acoustic spline curve for Clean state
      ctx.beginPath();
      ctx.strokeStyle = isFake ? '#ffffff' : isDoubt ? '#fef08a' : '#38bdf8';
      ctx.lineWidth = 1.8;

      for (let x = 0; x <= width; x += 4) {
        const amp = isFake ? 14 : isDoubt ? 11 : 8;
        const y = height / 2 + Math.sin(x * 0.08 + tick * 2) * amp * Math.cos(tick * 0.5);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [activeCall?.currentTier, activeCall?.liveWaveform, activeCall]);

  if (!activeCall || !hudState.visible) {
    return null;
  }

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from header or non-interactive areas
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(8, Math.min(window.innerWidth - 340, e.clientX - dragOffset.x));
    const newY = Math.max(40, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const tier = activeCall.currentTier;
  const isFake = tier === 'Fake';
  const isDoubt = tier === 'Doubt';
  const isExpanded = hudState.isDrawerExpanded;
  const videoTelemetry = activeCall.videoTelemetry;

  // Mode 1: Compact Mode (Subtle glowing shield icon pinned to edge)
  if (hudState.mode === 'compact') {
    return (
      <div
        ref={containerRef}
        id="hud-compact-overlay"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => setHudMode('active')}
        className="absolute z-50 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 touch-none"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        title="TrustLine Active Shield - Tap to Expand"
      >
        <div
          className={`relative p-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-center border transition-all ${
            isFake
              ? 'bg-rose-600/90 text-white border-rose-300 ring-4 ring-rose-500/40 animate-pulse'
              : isDoubt
              ? 'bg-amber-500/90 text-white border-amber-300 ring-4 ring-amber-400/30'
              : 'bg-[#6750a4]/95 text-white border-[#d0bcff] ring-4 ring-[#e8def8]/50'
          }`}
        >
          {isFake ? (
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          ) : isDoubt ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <ShieldCheck className="w-6 h-6" />
          )}

          {/* Glowing pulse */}
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#1d9c5b] ring-2 ring-white animate-ping"></span>
        </div>
      </div>
    );
  }

  // Active / Alert Full HUD Overlay with Dynamic Spectrogram & Drawer
  return (
    <div
      ref={containerRef}
      id="hud-active-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute z-50 select-none shadow-2xl backdrop-blur-xl rounded-3xl border p-3.5 w-[350px] max-w-[94vw] transition-all duration-200 touch-none ${
        isFake
          ? 'bg-[#7f1d1d]/95 text-white border-rose-400 ring-4 ring-rose-500/40 shadow-[0_0_35px_rgba(239,68,68,0.4)]'
          : isDoubt
          ? 'bg-[#451a03]/95 text-amber-100 border-amber-400 ring-2 ring-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
          : 'bg-[#0a192f]/90 text-sky-100 border-sky-400/40 shadow-xl'
      }`}
      style={{ left: `${Math.min(position.x, 24)}px`, top: `${position.y}px` }}
    >
      {/* Top Header Row with WebSocket Trigger status */}
      <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2 mb-2">
        <div className="flex items-center gap-2 cursor-grab">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isFake
                ? 'bg-rose-400 animate-ping'
                : isDoubt
                ? 'bg-amber-400 animate-pulse'
                : 'bg-sky-400 animate-ping'
            }`}
          ></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isFake ? '🚨 AI Voice Clone Alert' : `TrustLine Shield (${activeCall.platform})`}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-sky-200 font-mono">
              WSS Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Drawer Toggle */}
          <button
            id="btn-hud-toggle-drawer"
            onClick={toggleHudDrawer}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-0.5 text-[10px] font-bold"
            title="Toggle Live Metrics Drawer"
          >
            <span>{isExpanded ? 'Less' : 'Metrics'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setHudMode('compact')}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Caller Details & Synthetic Probability */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-white truncate">
            {activeCall.callerName}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                isFake
                  ? 'bg-rose-500 text-white'
                  : isDoubt
                  ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
              }`}
            >
              {isFake ? '🔴 Deepfake' : isDoubt ? '🟡 Ambiguous' : '🔵 Active Micro-Batching (Clean)'}
            </span>
            <span className="text-[10px] text-white/70 font-mono">{activeCall.callDuration}s</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-lg font-black font-mono leading-none">
              {activeCall.syntheticProbability.toFixed(1)}%
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
            AI Probability
          </span>
        </div>
      </div>

      {/* Live Animated Mel-Spectrogram Canvas (Subtle Pulsing Blue Waveform in Clean State) */}
      <div className="mt-2.5 rounded-xl bg-black/40 border border-white/10 p-1.5 overflow-hidden">
        <div className="flex items-center justify-between text-[9px] text-white/60 mb-1 px-1">
          <span className="flex items-center gap-1">
            <Activity className={`w-3 h-3 ${isFake ? 'text-rose-400' : isDoubt ? 'text-amber-400' : 'text-sky-400'}`} />
            <span>Spectrogram • {isFake ? 'Anomaly Match' : isDoubt ? 'Phase Jitter' : 'Pulsing Waveform (0-8kHz)'}</span>
          </span>
          <span className="font-mono">{activeCall.cpuLoadPercent.toFixed(1)}% CPU</span>
        </div>
        <canvas
          ref={canvasRef}
          width={310}
          height={38}
          className="w-full h-[38px] rounded-lg block"
        />
      </div>

      {/* Verification Challenge (Scenario B) */}
      {activeCall.verificationPrompt && (
        <div className="mt-2 p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-100 flex items-start gap-1.5 animate-pulse">
          <Fingerprint className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <span className="leading-snug">{activeCall.verificationPrompt}</span>
        </div>
      )}

      {/* Expandable Metrics Drawer */}
      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-white/15 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Row 1: Vocoder Index & C2PA Provenance */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* Vocoder Discontinuity Index */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/10">
              <div className="flex items-center justify-between text-white/70 mb-1">
                <span className="font-medium">Vocoder Index</span>
                <span className="font-mono font-bold">{activeCall.vocoderDiscontinuityIndex.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeCall.vocoderDiscontinuityIndex > 70
                      ? 'bg-rose-400'
                      : activeCall.vocoderDiscontinuityIndex > 30
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${activeCall.vocoderDiscontinuityIndex}%` }}
                ></div>
              </div>
            </div>

            {/* C2PA Manifest Badge */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/10 flex flex-col justify-between">
              <span className="text-white/70 text-[9px] font-medium">C2PA Manifest</span>
              <div className="flex items-center gap-1 mt-0.5">
                {activeCall.c2paManifest === 'Valid' ? (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-300 text-[10px]">Valid Origin</span>
                  </>
                ) : activeCall.c2paManifest === 'Tampered' ? (
                  <>
                    <FileX2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-bold text-rose-300 text-[10px]">Tampered / Strip</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-amber-300 text-[10px]">Absent Signature</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Video Deepfake Metrics (if video call / Scenario D) */}
          {videoTelemetry?.isVideoCall && (
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-400/40 text-[10px]">
              <div className="flex items-center justify-between text-purple-200 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-purple-300" />
                  <span>Video Facial & Lip-Sync Telemetry</span>
                </span>
                <span className="text-rose-300 font-mono">+{videoTelemetry.lipSyncDesyncMs}ms offset</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-purple-100">
                <div className="flex justify-between bg-black/40 px-2 py-1 rounded-md">
                  <span>Edge Warping:</span>
                  <span className="font-bold text-rose-300">{videoTelemetry.edgeWarpingScore}%</span>
                </div>
                <div className="flex justify-between bg-black/40 px-2 py-1 rounded-md">
                  <span>Landmark Jitter:</span>
                  <span className="font-bold text-rose-300">{videoTelemetry.facialLandmarkJitter}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Semantic Risk Scanner (Trigger chips) */}
          {activeCall.semanticTriggers && activeCall.semanticTriggers.length > 0 && (
            <div className="p-2 rounded-xl bg-black/30 border border-white/10">
              <div className="text-[9px] text-white/70 font-semibold mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Semantic Risk Scanner Triggers</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeCall.semanticTriggers.map((trig, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-rose-500/30 border border-rose-400/40 text-[9px] text-rose-200 font-bold"
                  >
                    ⚠️ {trig}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7s Chunk Progress Bar */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] text-white/80">
        <span className="text-[9px] font-semibold">Chunk #{activeCall.currentChunk}</span>
        <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              isFake ? 'bg-rose-400' : isDoubt ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${activeCall.chunkProgress}%` }}
          ></div>
        </div>
        <span className="text-[9px] font-mono">{activeCall.chunkProgress.toFixed(0)}%</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          id="btn-hud-hangup-action"
          onClick={() => hangUpCall(isFake ? 'threat_alert' : 'user')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl font-black text-xs shadow-md transition-transform active:scale-95 ${
            isFake
              ? 'bg-white text-rose-900 hover:bg-rose-100 ring-2 ring-rose-300'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          <PhoneOff className="w-4 h-4" />
          <span>{isFake ? 'Hang Up & Block' : 'End Call'}</span>
        </button>

        {isFake ? (
          <button
            onClick={() => blockCaller(activeCall.callerNumber)}
            className="py-2 px-3 rounded-2xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-bold text-xs border border-rose-400/40 transition-colors"
          >
            <span>Block Number</span>
          </button>
        ) : (
          <button
            onClick={toggleHudDrawer}
            className="py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
          >
            <span>{isExpanded ? 'Hide Forensics' : 'View Forensics'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

