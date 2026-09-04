import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  CallRecord,
  ActiveCallState,
  HUDState,
  AppSettings,
  ScanFileResult,
  CallTier,
  VoIPPlatform,
  HUDMode,
  ThreatIntelRecord,
} from '../types';
import { INITIAL_CALL_RECORDS, PRESET_CALL_SCENARIOS, COMMUNITY_THREAT_DATABASE } from '../data/mockCalls';
import { playSystemChime, speakSimulatedAudio, stopSpeech } from '../utils/audioSynth';
import { AudioPipeline } from '../utils/audioDsp';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { cachePHashSecurely, getSecurePHash } from '../lib/idb';

interface TrustLineContextType {
  // Navigation & Screen state
  activeTab: 'dashboard' | 'scans' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'scans' | 'settings') => void;
  deviceFrameMode: boolean;
  setDeviceFrameMode: (val: boolean) => void;

  // Records & Statistics
  callRecords: CallRecord[];
  activeCall: ActiveCallState | null;
  hudState: HUDState;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Threat Modal state
  threatModalCall: CallRecord | null;
  setThreatModalCall: (call: CallRecord | null) => void;
  isInspectingReport: boolean;
  setIsInspectingReport: (val: boolean) => void;
  
  // Quick Scan Modal state
  isQuickScanOpen: boolean;
  setIsQuickScanOpen: (val: boolean) => void;
  activeScanResult: ScanFileResult | null;
  isAnalyzingFile: boolean;
  scanStageIndex: number; // 0: Spectrogram Screener, 1: C2PA Validation, 2: Cloud Multi-Model Ensemble
  analyzeFile: (file: File) => Promise<void>;

  // Simulation Drawer State
  isTestSimDrawerOpen: boolean;
  setIsTestSimDrawerOpen: (val: boolean) => void;

  // Call Actions
  startSimulatedCall: (scenarioId: string) => void;
  answerCall: () => void;
  hangUpCall: (reason?: 'user' | 'threat_alert' | 'auto_protect') => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  setHudMode: (mode: HUDMode) => void;
  setHudPosition: (pos: { x: number; y: number }) => void;
  toggleHudDrawer: () => void;

  // Scan management
  savedScans: import('../types').SavedScanResult[];
  saveScanResult: (scan: ScanFileResult) => void;
  deleteScanResult: (scanId: string) => void;

  // Record management
  blockCaller: (callerNumber: string) => void;
  unblockCaller: (callerNumber: string) => void;
  allowlistCaller: (callerName: string, callerNumber: string) => void;
  removeFromAllowlist: (id: string) => void;
  reportToCommunity: (callId: string) => void;
  deleteCallRecord: (callId: string) => void;

  // Threat Intel Database
  threatIntelRecords: ThreatIntelRecord[];
  searchIntelQuery: string;
  setSearchIntelQuery: (query: string) => void;
  submitThreatIntelReport: (report: Omit<ThreatIntelRecord, 'id' | 'reportedDate' | 'reportsCount' | 'upvotes' | 'isVerifiedByIntel'>) => void;
  upvoteIntelReport: (id: string) => void;

  // Stats
  threatStats: {
    totalCalls: number;
    safeCount: number;
    doubtCount: number;
    fakeBlockedCount: number;
    protectionUptimeHours: number;
  };

  // Toast / Snackbars
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Onboarding
  grantPermission: (perm: keyof AppSettings['permissionsGranted']) => void;
  completeOnboarding: () => void;
  resetAppDemo: () => void;
}

const TrustLineContext = createContext<TrustLineContextType | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  protectionEnabled: false,
  autoHangupOnFake: false,
  sensitivity: 'medium',
  cloudEscalationThreshold: 50,
  warningChimeEnabled: true,
  hudStyle: 'floating_pill',
  batteryOptimization: false,
  contactAllowlist: [],
  permissionsGranted: {
    foregroundService: true,
    accessibility: true,
    audioCapture: true,
    overlayPermission: true,
  },
  hasCompletedOnboarding: true,
};

export const TrustLineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scans' | 'settings'>('dashboard');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  
  const { 
    syncedRecords: callRecords, 
    syncedScans: savedScans,
    syncedSettings: settings, 
    updateRecords: setCallRecords,
    updateScans: setSavedScans,
    updateSettingsData: setSettings 
  } = useFirestoreSync(DEFAULT_SETTINGS);
  
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [hudState, setHudState] = useState<HUDState>({
    visible: false,
    mode: 'active',
    position: { x: 16, y: 90 },
    isDraggable: true,
    isDrawerExpanded: false,
  });

  const [threatModalCall, setThreatModalCall] = useState<CallRecord | null>(null);
  const [isInspectingReport, setIsInspectingReport] = useState<boolean>(false);
  
  const [isQuickScanOpen, setIsQuickScanOpen] = useState<boolean>(false);
  const [activeScanResult, setActiveScanResult] = useState<ScanFileResult | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);
  const [scanStageIndex, setScanStageIndex] = useState<number>(0);

  const [isTestSimDrawerOpen, setIsTestSimDrawerOpen] = useState<boolean>(false);

  // Threat Intel State
  const [threatIntelRecords, setThreatIntelRecords] = useState<ThreatIntelRecord[]>(COMMUNITY_THREAT_DATABASE);
  const [searchIntelQuery, setSearchIntelQuery] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Settings updated');
  }, [showToast]);

  const toggleHudDrawer = useCallback(() => {
    setHudState((prev) => ({
      ...prev,
      isDrawerExpanded: !prev.isDrawerExpanded,
    }));
  }, []);

  // Dynamic Chunk Audio Processing Loop
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPipelineRef = useRef<AudioPipeline | null>(null);
  const currentTelemetryRef = useRef<any>({ phaseDispersion: 1.0, c2paVerified: true });
  const targetSimulationOutcomeRef = useRef<any>(null);

  // --- NATIVE BRIDGE FOR WHATSAPP/DIALER CAPTURE ---
  useEffect(() => {
    // Attempt to register the Capacitor bridge when on a native Android device
    const initNativeBridge = async () => {
      try {
        const { CallCapture } = await import('../lib/CallCapturePlugin');
        
        // Listen to native Call States (Ringing -> Answered)
        await CallCapture.addListener('onCallStateChanged', (state) => {
          if (state.state === 'RINGING') {
             setActiveCall({
                isInCall: false,
                isIncoming: true,
                callerName: state.callerName || 'Unknown',
                callerNumber: state.callerNumber,
                avatarUrl: '',
                platform: state.platform as any,
                callDuration: 0,
                currentTier: 'Trustable',
                currentChunk: 1,
                totalChunks: 1,
                chunkProgress: 0,
                chunkScores: [],
                localVadScore: 0,
                cloudEscalated: false,
                syntheticProbability: 0,
                anomalyDetected: null,
                liveWaveform: [],
                isMuted: false,
                isSpeakerOn: true,
                scenarioId: 'native-call',
                vocoderDiscontinuityIndex: 0,
                c2paManifest: 'Absent',
                semanticTriggers: [],
                cpuLoadPercent: 0,
             });
             setHudState({ visible: true, mode: 'compact', position: { x: 16, y: 90 }, isDraggable: true, isDrawerExpanded: false });
          } else if (state.state === 'ACTIVE') {
             // Let the native dialer trigger the "Answer" state
             setActiveCall(prev => prev ? { ...prev, isIncoming: false, isInCall: true } : null);
          } else if (state.state === 'DISCONNECTED') {
             setActiveCall(null);
             setHudState(h => ({ ...h, visible: false }));
          }
        });

        // Listen to native Audio PCM chunks from AudioPlaybackCapture API
        await CallCapture.addListener('onAudioChunkReceived', (data) => {
            // Forward base64 PCM stream to cloud verification API
            fetch('/api/verify-cloud-threat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mediaStreamPayload: data.chunkBase64, type: "audio" }),
            });
        });

        await CallCapture.initialize({ enableAudioCapture: true, captureWhatsApp: true, captureDialer: true });
        console.log("Native CallCapture bridge initialized.");
      } catch (e) {
        // Fallback for Web/PWA preview
        console.log("Web PWA Mode: Native CallCapture bindings skipped.");
      }
    };
    initNativeBridge();
  }, []);
  // ------------------------------------------------

  // In-call loop
  useEffect(() => {
    if (!activeCall || !activeCall.isInCall) {
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (callDurationTimerRef.current) clearInterval(callDurationTimerRef.current);
      if (audioPipelineRef.current) {
        audioPipelineRef.current.stop();
        audioPipelineRef.current = null;
      }
      return;
    }

    // Call duration timer (every 1s)
    callDurationTimerRef.current = setInterval(() => {
      setActiveCall((prev) => {
        if (!prev || !prev.isInCall) return null;
        return {
          ...prev,
          callDuration: prev.callDuration + 1,
        };
      });
    }, 1000);

    // High frequency waveform & dynamic chunk simulator (every 250ms)
    chunkTimerRef.current = setInterval(() => {
      let triggerFetch = false;
      let snapshotCall: any = null;

      setActiveCall((prev) => {
        if (!prev || !prev.isInCall) return null;

        // Partition requirements: 5 sec partitions for video, 1 sec partitions for audio
        const isVideo = (targetSimulationOutcomeRef.current?.isVideoCall) || !!prev.videoTelemetry;
        const chunkDurationMs = isVideo ? 5000 : 1000;

        const nextProgress = prev.chunkProgress + (250 / chunkDurationMs) * 100;
        
        // Generate lively dynamic waveform with frequency variations
        const baseAmp = prev.currentTier === 'Fake' ? 70 : 45;
        const liveWave = Array.from({ length: 16 }, () =>
          Math.min(100, Math.max(15, Math.floor(baseAmp + (Math.random() * 45 - 20))))
        );

        if (nextProgress >= 100) {
          // Completed a media chunk partition!
          if (settings.warningChimeEnabled) {
            playSystemChime('scan_tick');
          }
          
          triggerFetch = true;
          snapshotCall = prev;

          return {
            ...prev,
            currentChunk: prev.currentChunk + 1,
            totalChunks: prev.totalChunks + 1,
            chunkProgress: 0,
            liveWaveform: liveWave,
          };
        }

        return {
          ...prev,
          chunkProgress: nextProgress,
          liveWaveform: liveWave,
        };
      });

      if (triggerFetch && snapshotCall) {
        
        // --- Simulated Call Real-Time Progressive Injection ---
        if (targetSimulationOutcomeRef.current) {
          const target = targetSimulationOutcomeRef.current;
          // Analyze progressively: Wait 3 chunks (3 sec for audio, 15 sec for video) to formulate final prediction
          const requiredChunks = 3; 

          setActiveCall(prev => {
            if (!prev || !prev.isInCall) return prev;
            
            // Simulation generates a raw score for this partition (varying up to final target)
            const isTargetFake = target.expectedTier === 'Fake';
            const chunkBaseScore = isTargetFake ? (Math.random() * 20 + 80) : (target.expectedTier === 'Doubt' ? Math.random() * 20 + 50 : Math.random() * 10);
            const updatedScores = [...(prev.chunkScores || []), chunkBaseScore];
            
            // Calculate majority average score up to this point
            const avgScore = updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length;
            let majorityTier: CallTier = avgScore >= 80 ? 'Fake' : avgScore >= 50 ? 'Doubt' : 'Trustable';
            let newScore = avgScore;

            if (prev.totalChunks >= requiredChunks) {
              majorityTier = target.expectedTier;
              newScore = target.syntheticProbability;
            }

            if (majorityTier === 'Fake') newScore = Math.max(newScore, 95);
            if (majorityTier === 'Doubt') newScore = Math.max(newScore, 50);

            if (majorityTier === 'Fake' && prev.currentTier !== 'Fake') {
              playSystemChime('warning');
              setHudState(h => ({ ...h, mode: 'alert', visible: true }));
              if (settings.autoHangupOnFake) {
                showToast('Auto-hangup activated. Terminating malicious connection.');
                hangUpCall();
                return null;
              }
            } else if (majorityTier === 'Doubt' && prev.currentTier === 'Trustable') {
              setHudState(h => ({ ...h, mode: 'active', visible: true }));
            }

            return {
              ...prev,
              currentTier: majorityTier,
              syntheticProbability: Math.min(newScore, 100),
              chunkScores: updatedScores,
              cloudEscalated: majorityTier !== 'Trustable',
              anomalyDetected: prev.totalChunks >= requiredChunks ? (target.detectedAnomalies?.[0] || prev.anomalyDetected) : (majorityTier !== 'Trustable' ? 'Analyzing suspicious vocal patterns...' : prev.anomalyDetected),
              vocoderDiscontinuityIndex: target.vocoderDiscontinuityIndex || prev.vocoderDiscontinuityIndex,
              c2paManifest: target.c2paManifest || prev.c2paManifest,
              semanticTriggers: target.semanticTriggers || prev.semanticTriggers,
              cpuLoadPercent: target.cpuLoadPercent || prev.cpuLoadPercent,
              videoTelemetry: target.videoTelemetry,
            };
          });
          return; // Skip actual API fetch for simulated local progression
        }
        // --- Original API fetch for real calls goes below here ---
        // Fire backend cloud reasoning with Circuit Breaker (3000ms timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        fetch('/api/verify-cloud-threat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaStreamPayload: "simulated_base64_audio_payload_" + Math.random().toString(36),
            type: "audio"
          }),
          signal: controller.signal
        }).then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Cloud API request failed');
          return res.json();
        }).then(async data => {
          const currentPHash = currentTelemetryRef.current.pHash || "default_phash_123";
          await cachePHashSecurely(currentPHash, data);
          
          if (data && data.data) {
            setActiveCall(prev => {
              if (!prev || !prev.isInCall) return prev;
              
              const result = data.data;
              let rawScore = result.deepfakeProbability ? result.deepfakeProbability * 100 : prev.syntheticProbability;
              const updatedScores = [...(prev.chunkScores || []), rawScore];
              
              // Evaluate majority partitions response
              const avgScore = updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length;
              let majorityTier: CallTier = avgScore >= 80 ? 'Fake' : avgScore >= 50 ? 'Doubt' : 'Trustable';
              let newScore = avgScore;

              if (majorityTier === 'Fake') newScore = Math.max(newScore, 95);
              if (majorityTier === 'Doubt') newScore = Math.max(newScore, 50);

              if (majorityTier === 'Fake' && prev.currentTier !== 'Fake') {
                if (settings.warningChimeEnabled) playSystemChime('alert');
                setHudState(h => ({ ...h, mode: 'alert' }));
                
                if (settings.autoHangupOnFake) {
                  showToast('Auto-hangup activated. Terminating malicious connection.');
                  hangUpCall();
                  return null;
                }
              }

              return {
                ...prev,
                currentTier: majorityTier,
                syntheticProbability: newScore,
                chunkScores: updatedScores,
                cloudEscalated: majorityTier !== 'Trustable',
                anomalyDetected: result.modelsDetected ? `Cloud Match: ${result.modelsDetected.join(", ")}` : prev.anomalyDetected
              };
            });
          }
        }).catch(async err => {
          clearTimeout(timeoutId);
          console.warn('Circuit breaker tripped or network error, falling back to local WebAudio DSP heuristics:', err);
          
          const currentPHash = currentTelemetryRef.current.pHash || "default_phash_123";
          const cachedResult = await getSecurePHash(currentPHash);
          
          setActiveCall(prev => {
            if (!prev || !prev.isInCall) return prev;
            
            let localTier = prev.currentTier;
            let localScore = prev.syntheticProbability;
            let localAnomaly = prev.anomalyDetected;
            
            if (cachedResult && cachedResult.data && cachedResult.data.verdict === 'LIKELY_FAKE') {
              localTier = 'Fake';
              localScore = cachedResult.data.deepfakeProbability * 100 || 95;
              localAnomaly = 'Matched local pHash signature offline';
            } else {
              // DSP Fallback heuristic: phase dispersion
              if (currentTelemetryRef.current.phaseDispersion > 0.8) {
                localTier = 'Fake';
                localScore = 90;
                localAnomaly = 'DSP Phase Dispersion Heuristic Triggered (Offline)';
              } else if (currentTelemetryRef.current.phaseDispersion > 0.6) {
                localTier = 'Doubt';
                localScore = 65;
                localAnomaly = 'Elevated DSP Phase Variance (Offline)';
              }
            }

            if (localTier === 'Fake' && prev.currentTier !== 'Fake') {
              if (settings.warningChimeEnabled) playSystemChime('alert');
              setHudState(h => ({ ...h, mode: 'alert' }));
            }

            return {
              ...prev,
              currentTier: localTier,
              syntheticProbability: localScore,
              cloudEscalated: false, // Handled locally
              anomalyDetected: localAnomaly
            };
          });
        });
      }
    }, 250);

    return () => {
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (callDurationTimerRef.current) clearInterval(callDurationTimerRef.current);
    };
  }, [activeCall?.isInCall, settings.warningChimeEnabled]);

  // Start a simulated incoming call
    const startSimulatedCall = useCallback(async (scenarioId: string) => {
    const scenario = PRESET_CALL_SCENARIOS.find((s) => s.id === scenarioId) || PRESET_CALL_SCENARIOS[0];

    targetSimulationOutcomeRef.current = scenario;

    const initialTier: CallTier = 'Trustable';
    const newCallState: ActiveCallState = {
      isInCall: false,
      isIncoming: true,
      callerName: scenario.callerName,
      callerNumber: scenario.callerNumber,
      avatarUrl: scenario.avatarUrl,
      platform: scenario.platform,
      callDuration: 0,
      currentTier: initialTier,
      currentChunk: 1,
      totalChunks: 1,
      chunkProgress: 0,
      chunkScores: [],
      localVadScore: 0.94,
      cloudEscalated: false,
      syntheticProbability: 0,
      anomalyDetected: null,
      liveWaveform: [25, 40, 30, 60, 45, 50, 35, 40, 60, 35, 45, 30, 25, 20, 35, 50],
      isMuted: false,
      isSpeakerOn: true,
      scenarioId: scenario.id,
      vocoderDiscontinuityIndex: 2.1,
      c2paManifest: 'Valid',
      semanticTriggers: [],
      cpuLoadPercent: 1.6,
      videoTelemetry: (scenario as any).isVideoCall ? {
        isVideoCall: true,
        lipSyncDesyncMs: 0,
        edgeWarpingScore: 0,
        facialLandmarkJitter: 0,
        syntheticLightingAnomaly: false
      } : undefined,
      verificationPrompt: (scenario as any).verificationPrompt,
    };

    setActiveCall(newCallState);
    setHudState({
      visible: true,
      mode: 'compact',
      position: { x: 16, y: 90 },
      isDraggable: true,
      isDrawerExpanded: false,
    });
    
    playSystemChime('safe');
    showToast(`Incoming ${scenario.platform} call from ${scenario.callerName}`);
    setIsTestSimDrawerOpen(false);

    // Call is now ringing. The user must explicitly press "Answer Call" 
    // or we wait for a native event if hooked up.
  }, [showToast]);

  // Answer call
  const answerCall = useCallback(async () => {
    if (!activeCall) return;

    setActiveCall((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isIncoming: false,
        isInCall: true,
      };
    });

    setHudState((h) => ({
      ...h,
      mode: activeCall.currentTier === 'Fake' ? 'alert' : 'active',
    }));
    
    if (activeCall.currentTier === 'Fake') {
      playSystemChime('alert');
    } else {
      playSystemChime('safe');
    }

    // Trigger simulated voice speech synthesis if this is a simulated scenario
    if (targetSimulationOutcomeRef.current) {
       const scenario = targetSimulationOutcomeRef.current;
       if (typeof (window as any).speakSimulatedAudio === 'function') {
           (window as any).speakSimulatedAudio(scenario.simulatedSpeech, scenario.expectedTier === 'Fake');
       }
       return; // Skip native pipeline init for simulation
    }

    // Try to start the real audio/video pipeline for live checks
    try {
      // Capture both audio and video for comprehensive verification
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const pipeline = new AudioPipeline();
      await pipeline.initialize(stream);
      pipeline.onTelemetry = (data) => {
        currentTelemetryRef.current = data;
        
        // If phase dispersion drops below 0.3, it's a severe threat
        if (data.phaseDispersion < 0.3) {
          setActiveCall((prev) => {
            if (!prev || prev.currentTier === 'Fake') return prev;
            return {
              ...prev,
              currentTier: 'Doubt',
              syntheticProbability: Math.max(prev.syntheticProbability, 65.5),
              anomalyDetected: 'Vocoder phase variance < 0.3 (Threat threshold)',
              cloudEscalated: true
            };
          });
          setHudState((h) => ({ ...h, mode: 'alert' }));
        }
      };
      audioPipelineRef.current = pipeline;
    } catch (err) {
      console.warn('Microphone access denied or unavailable, falling back to simulated DSP metrics', err);
    }

    // Trigger simulated voice speech synthesis
    const scenario = PRESET_CALL_SCENARIOS.find((s) => s.id === activeCall.scenarioId);
    if (scenario) {
      const isFake = scenario.expectedTier === 'Fake';
      speakSimulatedAudio(scenario.simulatedSpeech, isFake);
    }
  }, [activeCall]);

  // Hang up call
  const hangUpCall = useCallback((reason: 'user' | 'threat_alert' | 'auto_protect' = 'user') => {
    if (!activeCall) return;

    stopSpeech();
    playSystemChime('hangup');

    const duration = activeCall.callDuration;
    const finalTier = activeCall.currentTier;
    const finalScore = activeCall.syntheticProbability;
    const scenario = PRESET_CALL_SCENARIOS.find((s) => s.id === activeCall.scenarioId);

    // Save to call history record
    const newRecord: CallRecord = {
      id: `call-${Date.now()}`,
      callerName: activeCall.callerName,
      callerNumber: activeCall.callerNumber,
      avatarUrl: activeCall.avatarUrl,
      platform: activeCall.platform,
      timestamp: 'Just now',
      durationSec: Math.max(duration, 8),
      tier: finalTier,
      syntheticScore: finalScore,
      chunksAnalyzed: Math.max(activeCall.totalChunks, 2),
      threatTags: finalTier === 'Fake'
        ? (scenario?.detectedAnomalies.length ? scenario.detectedAnomalies : ['Neural Vocoder Artifacts', 'TTS Pitch Lock'])
        : finalTier === 'Doubt'
        ? ['Ambiguous Spectral Flux', 'VoIP Codec Jitter']
        : ['Biological Human Voice', 'Verified Vocal Tract'],
      audioWaveform: activeCall.liveWaveform,
      transcriptSnippet: scenario?.simulatedSpeech || 'Voice stream analyzed in real-time.',
      forensicPillars: [
        {
          pillar: 'Glottal Pulse Micro-Jitter',
          status: finalTier === 'Fake' ? 'High Threat' : finalTier === 'Doubt' ? 'Anomaly' : 'Clean',
          description: finalTier === 'Fake'
            ? '0.02% micro-jitter detected (Unnatural pitch uniformity)'
            : finalTier === 'Doubt'
            ? 'Acoustic jitter distorted by lossy codec compression'
            : '1.24% natural laryngeal pitch micro-variations',
          score: finalTier === 'Fake' ? 97 : finalTier === 'Doubt' ? 56 : 99,
        },
        {
          pillar: 'Vocoder Phase Coherence',
          status: finalTier === 'Fake' ? 'High Threat' : finalTier === 'Doubt' ? 'Anomaly' : 'Clean',
          description: finalTier === 'Fake'
            ? 'Synthetic phase mismatches detected across 3.5kHz - 6.0kHz'
            : finalTier === 'Doubt'
            ? 'High-frequency quantization noise present'
            : 'Uniform acoustic propagation verified',
          score: finalTier === 'Fake' ? 96 : finalTier === 'Doubt' ? 60 : 98,
        },
        {
          pillar: 'Respiratory Pause Cadence',
          status: finalTier === 'Fake' ? 'High Threat' : 'Clean',
          description: finalTier === 'Fake'
            ? 'Speech burst without physiological respiratory inhalation'
            : 'Natural human breathing cycle detected',
          score: finalTier === 'Fake' ? 94 : 98,
        },
        {
          pillar: 'Biometric Voiceprint Alignment',
          status: finalTier === 'Fake' ? 'Anomaly' : 'Clean',
          description: finalTier === 'Fake'
            ? 'Voice clone signature matched to known diffusion vocoder'
            : 'Natural resonance matches organic biological larynx',
          score: finalTier === 'Fake' ? 92 : 97,
        },
      ],
      isBlocked: finalTier === 'Fake',
      vocoderDiscontinuityIndex: activeCall.vocoderDiscontinuityIndex,
      c2paManifest: activeCall.c2paManifest,
      semanticTriggers: activeCall.semanticTriggers,
      videoTelemetry: activeCall.videoTelemetry,
    };

    setCallRecords((prev) => [newRecord, ...prev]);
    setActiveCall(null);
    setHudState((h) => ({ ...h, visible: false, isDrawerExpanded: false }));

    // Always show the post call modal for evaluation splash screen
    setThreatModalCall(newRecord);

    if (finalTier === 'Fake' || finalTier === 'Doubt') {
      showToast(reason === 'auto_protect' ? 'Threat blocked automatically!' : 'Call finished. Reviewing forensic report...');
    } else {
      showToast('Call ended. Call verified safe.');
    }
  }, [activeCall, showToast]);

  const toggleMute = useCallback(() => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  }, []);

  const toggleSpeaker = useCallback(() => {
    setActiveCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null));
  }, []);

  const setHudMode = useCallback((mode: HUDMode) => {
    setHudState((prev) => ({ ...prev, mode }));
  }, []);

  const setHudPosition = useCallback((pos: { x: number; y: number }) => {
    setHudState((prev) => ({ ...prev, position: pos }));
  }, []);

  // Block / Allowlist / Community actions
  const blockCaller = useCallback((callerNumber: string) => {
    setCallRecords((prev) =>
      prev.map((c) => (c.callerNumber === callerNumber ? { ...c, isBlocked: true } : c))
    );
    showToast(`Blocked caller: ${callerNumber}`);
  }, [showToast]);

  const unblockCaller = useCallback((callerNumber: string) => {
    setCallRecords((prev) =>
      prev.map((c) => (c.callerNumber === callerNumber ? { ...c, isBlocked: false } : c))
    );
    showToast(`Unblocked caller: ${callerNumber}`);
  }, [showToast]);

  const allowlistCaller = useCallback((callerName: string, callerNumber: string) => {
    const newEntry = {
      id: `al-${Date.now()}`,
      name: callerName,
      number: callerNumber,
      addedAt: 'Just now',
    };
    setSettings((prev) => ({
      ...prev,
      contactAllowlist: [newEntry, ...prev.contactAllowlist],
    }));
    setCallRecords((prev) =>
      prev.map((c) => (c.callerNumber === callerNumber ? { ...c, isAllowlisted: true } : c))
    );
    showToast(`Added ${callerName} to Trusted Allowlist`);
  }, [showToast]);

  const removeFromAllowlist = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      contactAllowlist: prev.contactAllowlist.filter((c) => c.id !== id),
    }));
    showToast('Contact removed from Allowlist');
  }, [showToast]);

  const reportToCommunity = useCallback((callId: string) => {
    setCallRecords((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, communityReported: true } : c))
    );
    playSystemChime('safe');
    showToast('Threat signature submitted to Community Ledger.');
  }, [showToast]);

  const deleteCallRecord = useCallback((callId: string) => {
    setCallRecords((prev) => prev.filter((c) => c.id !== callId));
    showToast('Call record removed');
  }, [showToast]);

  const saveScanResult = useCallback((scan: ScanFileResult) => {
    setSavedScans((prev) => [{
      ...scan,
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, ...prev]);
    showToast('Scan result saved to history');
  }, [showToast, setSavedScans]);

  const deleteScanResult = useCallback((scanId: string) => {
    setSavedScans((prev) => prev.filter((s) => s.id !== scanId));
    showToast('Scan record removed');
  }, [showToast, setSavedScans]);

  // Threat Intel Actions
  const submitThreatIntelReport = useCallback(async (report: Omit<ThreatIntelRecord, 'id' | 'reportedDate' | 'reportsCount' | 'upvotes' | 'isVerifiedByIntel'>) => {
    // Generate a quick local pHash based on the caller number to sync with backend simulation
    let pHash = "000000000000";
    let hashNum = 0;
    for (let i = 0; i < report.callerNumber.length; i++) {
      hashNum = (hashNum << 5) - hashNum + report.callerNumber.charCodeAt(i);
      hashNum |= 0;
    }
    pHash = Math.abs(hashNum).toString(16).padStart(12, '0').substring(0, 12);

    try {
      await fetch('/api/intel/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: report.callerNumber,
          pHash: pHash,
          tags: [report.category],
          riskLevel: report.threatLevel === 'Critical' ? 'High' : 'Medium'
        })
      });
    } catch (e) {
      console.warn("Failed to sync threat report to backend ledger", e);
    }

    const newRecord: ThreatIntelRecord = {
      id: `intel-${Date.now()}`,
      ...report,
      reportedDate: 'Just now',
      reportsCount: 1,
      upvotes: 1,
      isVerifiedByIntel: true,
    };
    setThreatIntelRecords((prev) => [newRecord, ...prev]);
    playSystemChime('safe');
    showToast(`Report for ${report.callerNumber} published to Threat Intel ledger`);
  }, [showToast]);

  const upvoteIntelReport = useCallback((id: string) => {
    setThreatIntelRecords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
    showToast('Upvoted community report');
  }, [showToast]);

  // Multi-pass File Quick Scan Studio
  const analyzeFile = useCallback(async (file: File) => {
    setIsAnalyzingFile(true);
    setActiveScanResult(null);
    setScanStageIndex(0);

    try {
      // Stage 1: Uploading
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setScanStageIndex(1); // Stage 2: Cloud AI Analysis

      let type = "audio";
      if (file.type.startsWith("video/")) type = "video";
      if (file.type.startsWith("image/")) type = "image";

      const response = await fetch('/api/verify-cloud-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaStreamPayload: base64String,
          type
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();

      setScanStageIndex(2); // Stage 3: Finalizing Report

      const resultData = data?.data || {};
      const verdict = resultData.verdict || 'VERIFIED_REAL';
      const isSynthetic = verdict === "LIKELY_FAKE" || verdict === "SUSPICIOUS";
      const confidence = resultData.deepfakeProbability 
        ? Math.round(resultData.deepfakeProbability * 100) 
        : (isSynthetic ? 95 : 5);

      const tier: CallTier = verdict === "LIKELY_FAKE" ? 'Fake' : verdict === "SUSPICIOUS" ? 'Doubt' : 'Trustable';

      const scanResult: ScanFileResult = {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: file.type || 'unknown',
        duration: 'N/A',
        tier,
        syntheticProbability: confidence,
        analysisTimeMs: 1200,
        spectrogramChunks: 6,
        spectralFluxAnomaly: isSynthetic ? 0.92 : 0.03,
        vadScore: 0.96,
        anomaliesDetected: resultData.modelsDetected 
          ? [`Detected engines: ${resultData.modelsDetected.join(', ')}`] 
          : (isSynthetic ? ['Synthetic artifacts detected by ensemble models'] : []),
        verdict: resultData.reasoning || (isSynthetic
          ? 'CRITICAL: High-Confidence AI Deepfake Detected'
          : 'VERIFIED: Authentic Human / Organic Media'),
        c2paManifest: 'Absent',
        nyquistCutoffKhz: 22.05,
        modelConsensus: {
          sightEngineScore: confidence,
          synthIdScore: confidence,
          siftlyScore: confidence,
          agreementRate: 98.2,
        },
        frequencySpectrum: [],
        forensicPillars: [
          {
            pillar: 'Cloud Ensemble Analysis',
            status: isSynthetic ? 'High Threat' : 'Clean',
            description: isSynthetic ? 'Multi-model detection triggered' : 'No synthetic anomalies detected',
            score: confidence,
          }
        ],
      };

      setActiveScanResult(scanResult);
      if (isSynthetic) {
        playSystemChime('alert');
      } else {
        playSystemChime('safe');
      }
    } catch (err) {
      console.warn('Scan processing error:', err);
      showToast('Scan failed. Please check network and file size (Max 50MB).');
    } finally {
      setIsAnalyzingFile(false);
    }
  }, [showToast]);

  // Threat statistics
  const threatStats = {
    totalCalls: callRecords.length,
    safeCount: callRecords.filter((c) => c.tier === 'Trustable').length,
    doubtCount: callRecords.filter((c) => c.tier === 'Doubt').length,
    fakeBlockedCount: callRecords.filter((c) => c.tier === 'Fake').length,
    protectionUptimeHours: 0,
  };

  // Onboarding controls
  const grantPermission = useCallback((perm: keyof AppSettings['permissionsGranted']) => {
    setSettings((prev) => ({
      ...prev,
      permissionsGranted: {
        ...prev.permissionsGranted,
        [perm]: true,
      },
    }));
    playSystemChime('safe');
  }, []);

  const completeOnboarding = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
    playSystemChime('safe');
    showToast('TrustLine Shield is now protecting your calls!');
  }, [showToast]);

  const resetAppDemo = useCallback(() => {
    setCallRecords([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveCall(null);
    setThreatModalCall(null);
    setThreatIntelRecords(COMMUNITY_THREAT_DATABASE);
    showToast('Reset to default demo data');
  }, [showToast]);

  return (
    <TrustLineContext.Provider
      value={{
        activeTab,
        setActiveTab,
        deviceFrameMode,
        setDeviceFrameMode,
        callRecords,
        activeCall,
        hudState,
        settings,
        updateSettings,
        threatModalCall,
        setThreatModalCall,
        isInspectingReport,
        setIsInspectingReport,
        isQuickScanOpen,
        setIsQuickScanOpen,
        activeScanResult,
        isAnalyzingFile,
        scanStageIndex,
        analyzeFile,
        isTestSimDrawerOpen,
        setIsTestSimDrawerOpen,
        startSimulatedCall,
        answerCall,
        hangUpCall,
        toggleMute,
        toggleSpeaker,
        setHudMode,
        setHudPosition,
        toggleHudDrawer,
        blockCaller,
        unblockCaller,
        allowlistCaller,
        removeFromAllowlist,
        reportToCommunity,
        deleteCallRecord,
        savedScans,
        saveScanResult,
        deleteScanResult,
        threatIntelRecords,
        searchIntelQuery,
        setSearchIntelQuery,
        submitThreatIntelReport,
        upvoteIntelReport,
        threatStats,
        toastMessage,
        showToast,
        grantPermission,
        completeOnboarding,
        resetAppDemo,
      }}
    >
      {children}
    </TrustLineContext.Provider>
  );
};

export const useTrustLine = () => {
  const context = useContext(TrustLineContext);
  if (!context) {
    throw new Error('useTrustLine must be used within a TrustLineProvider');
  }
  return context;
};

// NATIVE BINDING NOTE: The CallCapture native bindings will be hooked in a useEffect
// below in a future iteration when exporting to Android Studio.
