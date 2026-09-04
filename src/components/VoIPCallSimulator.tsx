import React, { useState } from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { PRESET_CALL_SCENARIOS } from '../data/mockCalls';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  Cpu,
  CloudUpload,
  Radio,
  Video,
  Sparkles,
  Fingerprint,
  Activity,
  Zap,
} from 'lucide-react';

export const VoIPCallSimulator: React.FC = () => {
  const {
    activeCall,
    startSimulatedCall,
    answerCall,
    hangUpCall,
    toggleMute,
    toggleSpeaker,
    blockCaller,
    showToast,
  } = useTrustLine();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-c');
  const [isWarningCollapsed, setIsWarningCollapsed] = useState<boolean>(false);
  const [bypassCrimsonOverride, setBypassCrimsonOverride] = useState<boolean>(false);

  // If a call is active (incoming or in-call), render the realistic full-screen VoIP screen
  if (activeCall) {
    const isIncoming = activeCall.isIncoming;
    const tier = activeCall.currentTier;
    const isFake = tier === 'Fake';
    const isDoubt = tier === 'Doubt';
    const isClean = tier === 'Trustable';
    const isVideo = activeCall.videoTelemetry?.isVideoCall;
    const videoTelemetry = activeCall.videoTelemetry;

    return (
      <div className="relative flex-1 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white flex flex-col justify-between p-5 select-none animate-in fade-in duration-200 min-h-[620px] font-sans rounded-3xl overflow-hidden">
        {/* Top VoIP Platform Header & WebSocket Status */}
        <div className="flex items-center justify-between text-xs text-slate-300 z-10">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isFake ? 'bg-rose-500 animate-ping' : isDoubt ? 'bg-amber-400 animate-pulse' : 'bg-sky-400 animate-ping'
              }`}
            ></span>
            <span className="font-bold">{activeCall.platform} {isVideo ? 'Video Call' : 'Audio Call'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono bg-black/40 px-2.5 py-1 rounded-full text-slate-300">
            <span className="text-sky-300 font-bold">WSS Connected</span>
            <span>•</span>
            <span>
              {isIncoming
                ? 'Incoming...'
                : `${Math.floor(activeCall.callDuration / 60)}:${(activeCall.callDuration % 60)
                    .toString()
                    .padStart(2, '0')}`}
            </span>
          </div>
        </div>

        {/* Center Screen: Video Deepfake OR Audio Avatar */}
        <div className="flex flex-col items-center justify-center my-auto text-center w-full z-10 py-2">
          {isVideo && !isIncoming ? (
            /* Video Stream Viewport with Risk States */
            <div
              className={`relative w-full max-w-[320px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 bg-black/90 mb-3 ${
                isFake
                  ? 'border-2 border-rose-500 ring-4 ring-rose-500/60 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
                  : isDoubt
                  ? 'border-2 border-amber-400 ring-4 ring-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                  : 'border-2 border-sky-400/50 ring-2 ring-sky-400/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              }`}
            >
              {/* Caller Video Feed */}
              <img
                src={activeCall.avatarUrl}
                alt={activeCall.callerName}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isFake && !bypassCrimsonOverride ? 'blur-md grayscale opacity-30 scale-95' : 'opacity-90 scale-105'
                }`}
              />

              {/* 1.2 Locked Decision: Fake State -> High-visibility crimson override blocking the video feed */}
              {isFake && !bypassCrimsonOverride && (
                <div
                  id="crimson-video-override"
                  className="absolute inset-0 bg-[#7f1d1d]/95 backdrop-blur-xl z-20 flex flex-col items-center justify-between p-3.5 text-center animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex flex-col items-center gap-1.5 mt-1">
                    <div className="w-10 h-10 rounded-2xl bg-white text-rose-900 flex items-center justify-center shadow-lg animate-bounce">
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      🚨 High-Risk Deepfake Blocked
                    </h4>
                    <p className="text-[10px] text-rose-100 leading-tight max-w-[240px]">
                      Video feed obscured to protect you from AI visual manipulation & face-swapping scam.
                    </p>
                  </div>

                  {/* Immediate Emergency Options */}
                  <div className="w-full space-y-1.5 my-1">
                    <button
                      id="btn-emergency-hangup-override"
                      onClick={() => hangUpCall('threat_alert')}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-100 text-rose-900 font-black text-[11px] shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <PhoneOff className="w-4 h-4 text-rose-600" />
                      <span>Emergency Disconnect Now</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          blockCaller(activeCall.callerNumber);
                          showToast(`Blocked ${activeCall.callerNumber}`);
                        }}
                        className="py-1.5 px-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-400/50 text-[10px] font-bold text-rose-100 transition-colors"
                      >
                        Block & Blacklist
                      </button>
                      <button
                        onClick={() => showToast('Fraud Protocol: Security captures logged')}
                        className="py-1.5 px-2 rounded-xl bg-black/60 hover:bg-black border border-white/20 text-[10px] font-bold text-rose-200 transition-colors"
                      >
                        Lock Session
                      </button>
                    </div>
                  </div>

                  {/* Option to temporarily bypass override */}
                  <button
                    onClick={() => setBypassCrimsonOverride(true)}
                    className="text-[9px] text-rose-300 underline hover:text-white transition-colors"
                  >
                    Inspect feed anyway (Advanced)
                  </button>
                </div>
              )}

              {/* Doubtful State: Soft amber border & Collapsible Warning Banner */}
              {isDoubt && (
                <div className="absolute top-2 inset-x-2 z-10 animate-in slide-in-from-top-2 duration-150">
                  <div className="p-2 rounded-2xl bg-[#451a03]/90 border border-amber-400 text-amber-100 backdrop-blur-md shadow-lg flex flex-col gap-1 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[10px] font-black text-amber-200 uppercase tracking-wide">
                          Acoustic Ambiguity Warning
                        </span>
                      </div>
                      <button
                        onClick={() => setIsWarningCollapsed(!isWarningCollapsed)}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 hover:bg-amber-500/50 transition-colors"
                      >
                        {isWarningCollapsed ? 'Expand' : 'Collapse'}
                      </button>
                    </div>

                    {!isWarningCollapsed && (
                      <p className="text-[9px] text-amber-100 leading-snug">
                        {activeCall.verificationPrompt || 'High phase jitter detected. Request caller answer a personal secret challenge question.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Clean State: Subtle Pulsing Blue Watermark */}
              {isClean && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0a192f]/80 border border-sky-400/40 text-sky-200 text-[9px] font-bold backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                  <span>Active Micro-Batching (Clean)</span>
                </div>
              )}

              {/* Facial Landmark Telemetry Box when inspecting or debugging */}
              {(bypassCrimsonOverride || !isFake) && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 bg-black/70 backdrop-blur-md rounded-xl text-[9px] text-sky-200 font-mono">
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3 text-sky-400" />
                    <span>Jitter: {videoTelemetry?.facialLandmarkJitter || 2}%</span>
                  </span>
                  <span className={isFake ? 'text-rose-400 font-bold' : isDoubt ? 'text-amber-400 font-bold' : 'text-sky-300 font-bold'}>
                    Lip-Sync: +{videoTelemetry?.lipSyncDesyncMs || 8}ms
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Standard VoIP Avatar View */
            <div className="relative mb-3">
              {/* 1.2 Locked Decision: Clean State subtle pulsing blue waveform ring / Doubt amber / Fake crimson */}
              <div
                className={`absolute -inset-3 rounded-full blur-md transition-all duration-300 ${
                  isFake
                    ? 'bg-rose-500/50 animate-pulse ring-4 ring-rose-500/60'
                    : isDoubt
                    ? 'bg-amber-500/40 ring-4 ring-amber-400/50'
                    : 'bg-sky-500/30 animate-pulse ring-4 ring-sky-400/40' // Subtle pulsing blue for Clean
                }`}
              ></div>

              <img
                src={activeCall.avatarUrl}
                alt={activeCall.callerName}
                referrerPolicy="no-referrer"
                className={`relative w-24 h-24 rounded-full object-cover shadow-2xl ring-4 transition-all ${
                  isFake
                    ? 'ring-rose-500 grayscale blur-[1px]'
                    : isDoubt
                    ? 'ring-amber-400'
                    : 'ring-sky-400/60'
                }`}
              />

              {/* Platform floating badge */}
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#6750a4] text-white shadow-lg ring-2 ring-slate-900">
                {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </span>
            </div>
          )}

          <h3 className="text-lg font-black text-white tracking-tight">{activeCall.callerName}</h3>
          <p className="text-xs text-slate-300 font-mono mt-0.5">{activeCall.callerNumber}</p>

          {/* Active Call In-line Detection Pill */}
          {!isIncoming && (
            <div className="mt-3 flex flex-col items-center w-full max-w-xs">
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-md transition-all ${
                  isFake
                    ? 'bg-rose-600 text-white ring-2 ring-rose-300 animate-bounce'
                    : isDoubt
                    ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-sky-500 text-sky-950 ring-2 ring-sky-300'
                }`}
              >
                {isFake ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : isDoubt ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {isFake
                    ? `AI Deepfake Detected (${activeCall.syntheticProbability.toFixed(1)}%)`
                    : isDoubt
                    ? `Doubt: Quality Jitter (${activeCall.syntheticProbability.toFixed(0)}%)`
                    : 'Clean: Active Micro-Batching (0.0% AI)'}
                </span>
              </div>

              {/* Doubt Challenge Prompt */}
              {isDoubt && activeCall.verificationPrompt && (
                <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-200 flex items-start gap-1.5 text-left w-full shadow-md">
                  <Fingerprint className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span className="leading-snug">{activeCall.verificationPrompt}</span>
                </div>
              )}

              {/* Fake Warning Alert Box */}
              {isFake && (
                <div className="mt-2.5 p-2.5 rounded-2xl bg-rose-950/90 border border-rose-500 text-[10px] text-rose-200 text-left w-full flex items-start gap-1.5 shadow-lg">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-100 block">Fraud Protocol Active:</span>
                    <span>{activeCall.anomalyDetected || 'Synthetic voice clone pattern matches ElevenLabs vocoder.'}</span>
                  </div>
                </div>
              )}

              {/* Real-time Spectrum Pipeline breakdown */}
              <div className="mt-2.5 w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-sky-400" />
                    <span>On-Device Engine:</span>
                  </span>
                  <span className="text-sky-300 font-bold font-mono">{activeCall.cpuLoadPercent.toFixed(1)}% CPU</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <CloudUpload className="w-3 h-3 text-sky-400" />
                    <span>C2PA Provenance:</span>
                  </span>
                  <span className={`font-bold font-mono ${activeCall.c2paManifest === 'Valid' ? 'text-sky-300' : 'text-rose-400'}`}>
                    {activeCall.c2paManifest}
                  </span>
                </div>

                {/* 7-second chunk cycle bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      isFake ? 'bg-rose-500' : isDoubt ? 'bg-amber-400' : 'bg-sky-400'
                    }`}
                    style={{ width: `${activeCall.chunkProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="mt-auto z-10">
          {isIncoming ? (
            /* Incoming Call Controls */
            <div className="flex items-center justify-around gap-6 py-2">
              <button
                id="btn-incoming-reject"
                onClick={() => hangUpCall('user')}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-300">Decline</span>
              </button>

              <button
                id="btn-incoming-accept"
                onClick={answerCall}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-[#1d9c5b] hover:bg-[#16804a] text-white flex items-center justify-center shadow-xl animate-pulse">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-300">Answer</span>
              </button>
            </div>
          ) : (
            /* In-Call Controls */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-around">
                <button
                  id="btn-call-toggle-mute"
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-colors ${
                    activeCall.isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Toggle Mute"
                >
                  {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  id="btn-call-hangup"
                  onClick={() => hangUpCall(isFake ? 'threat_alert' : 'user')}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                  title="Hang Up Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                <button
                  id="btn-call-toggle-speaker"
                  onClick={toggleSpeaker}
                  className={`p-3 rounded-full transition-colors ${
                    activeCall.isSpeakerOn ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Toggle Speaker"
                >
                  {activeCall.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {isFake && (
                <button
                  onClick={() => blockCaller(activeCall.callerNumber)}
                  className="w-full py-2 rounded-xl bg-rose-950 text-rose-200 border border-rose-500/40 text-xs font-bold hover:bg-rose-900 transition-colors"
                >
                  Block {activeCall.callerNumber} & Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sandbox Scenario Selector Screen
  return (
    <div className="flex flex-col gap-4 pb-4 font-sans">
      {/* Sandbox Header Card */}
      <div className="bg-[#ffffff] rounded-[28px] p-5 border border-[#e6e1e5] shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#6750a4] text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1d1b20] tracking-tight">VoIP Call Sandbox</h3>
            <p className="text-xs text-[#49454f]">Test real-time deepfake interception & HUD overlay</p>
          </div>
        </div>

        <p className="text-xs text-[#49454f] leading-relaxed">
          Simulate incoming VoIP audio & video streams with realistic speech synthesis. Observe how the 7-second sliding chunk screener escalates suspicious acoustic anomalies to cloud neural models.
        </p>
      </div>

      {/* Scenario Presets List */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs font-bold text-[#1d1b20] uppercase tracking-wider px-1">
          Select Simulation Scenario
        </h4>

        {PRESET_CALL_SCENARIOS.map((scenario, idx) => {
          const isSelected = selectedScenarioId === scenario.id;
          const isFake = scenario.expectedTier === 'Fake';
          const isDoubt = scenario.expectedTier === 'Doubt';

          return (
            <div
              key={scenario.id}
              id={`scenario-card-${scenario.id}`}
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#6750a4] ring-2 ring-[#6750a4]/20 shadow-md'
                  : 'bg-white/80 border-[#e6e1e5] hover:border-[#6750a4]/40 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={scenario.avatarUrl}
                    alt={scenario.callerName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-2xl object-cover ring-1 ring-black/10"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#6750a4] text-white">
                        {(scenario as any).scenarioLetter || `Scenario ${idx + 1}`}
                      </span>
                      <h5 className="text-xs font-bold text-[#1d1b20]">{scenario.callerName}</h5>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#e8def8] text-[#1d192b]">
                        {scenario.platform}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#49454f]">{scenario.subtitle}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFake
                      ? 'bg-rose-100 text-rose-800'
                      : isDoubt
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isFake ? '🔴 Fake' : isDoubt ? '🟡 Doubt' : '🟢 Safe'}
                </span>
              </div>

              {/* Sample Speech Quote */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#f3edf7] text-[11px] text-[#49454f] italic">
                "{scenario.simulatedSpeech}"
              </div>

              {/* Anomalies Preview */}
              {scenario.detectedAnomalies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {scenario.detectedAnomalies.map((anom, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {anom}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Call CTA */}
      <div className="pt-2">
        <button
          id="btn-start-selected-call"
          onClick={() => startSimulatedCall(selectedScenarioId)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#6750a4] hover:bg-[#563f91] text-white font-bold text-sm shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch VoIP Call Simulator</span>
        </button>
      </div>
    </div>
  );
};


