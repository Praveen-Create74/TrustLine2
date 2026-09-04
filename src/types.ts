export type CallTier = 'Trustable' | 'Doubt' | 'Fake';

export type VoIPPlatform = 'WhatsApp' | 'Google Meet' | 'Zoom' | 'Telegram' | 'Phone (VoLTE)';

export interface ForensicPillar {
  pillar: string;
  status: 'Clean' | 'Anomaly' | 'High Threat';
  description: string;
  score: number; // 0 - 100
}

export interface VideoDeepfakeTelemetry {
  isVideoCall: boolean;
  lipSyncDesyncMs: number; // e.g. 185ms
  edgeWarpingScore: number; // 0 to 100%
  facialLandmarkJitter: number; // 0 to 100%
  syntheticLightingAnomaly: boolean;
}

export interface CallRecord {
  id: string;
  callerName: string;
  callerNumber: string;
  avatarUrl: string;
  platform: VoIPPlatform;
  timestamp: string;
  durationSec: number;
  tier: CallTier;
  syntheticScore: number; // 0 to 100%
  chunksAnalyzed: number;
  threatTags: string[];
  audioWaveform: number[];
  transcriptSnippet: string;
  forensicPillars: ForensicPillar[];
  notes?: string;
  isBlocked?: boolean;
  isAllowlisted?: boolean;
  communityReported?: boolean;
  vocoderDiscontinuityIndex?: number;
  c2paManifest?: 'Valid' | 'Absent' | 'Tampered';
  semanticTriggers?: string[];
  videoTelemetry?: VideoDeepfakeTelemetry;
}

export interface ActiveCallState {
  isInCall: boolean;
  isIncoming: boolean;
  callerName: string;
  callerNumber: string;
  avatarUrl: string;
  platform: VoIPPlatform;
  callDuration: number;
  currentTier: CallTier;
  currentChunk: number;
  totalChunks: number;
  chunkProgress: number; // 0 to 100%
  chunkScores?: number[]; // Array of synthetic probabilities from all partitions
  localVadScore: number; // 0 to 1
  cloudEscalated: boolean;
  syntheticProbability: number;
  anomalyDetected: string | null;
  liveWaveform: number[];
  isMuted: boolean;
  isSpeakerOn: boolean;
  scenarioId?: string;
  // Enhanced HUD and Real-time Telemetry
  vocoderDiscontinuityIndex: number; // 0 to 100%
  c2paManifest: 'Valid' | 'Absent' | 'Tampered';
  semanticTriggers: string[];
  cpuLoadPercent: number; // e.g. 1.8% vs 14.5%
  videoTelemetry?: VideoDeepfakeTelemetry;
  verificationPrompt?: string;
}

export type HUDMode = 'compact' | 'active' | 'alert' | 'expanded';

export interface HUDState {
  visible: boolean;
  mode: HUDMode;
  position: { x: number; y: number };
  isDraggable: boolean;
  isDrawerExpanded: boolean;
}

export interface AppSettings {
  protectionEnabled: boolean;
  autoHangupOnFake: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  cloudEscalationThreshold: number; // e.g. 50%
  warningChimeEnabled: boolean;
  hudStyle: 'floating_pill' | 'edge_ribbon' | 'dynamic_capsule';
  batteryOptimization: boolean;
  contactAllowlist: Array<{ id: string; name: string; number: string; addedAt: string }>;
  permissionsGranted: {
    foregroundService: boolean;
    accessibility: boolean;
    audioCapture: boolean;
    overlayPermission: boolean;
  };
  hasCompletedOnboarding: boolean;
}

export interface ModelConsensusBreakdown {
  sightEngineScore: number;
  synthIdScore: number;
  siftlyScore: number;
  agreementRate: number; // 0-100%
}

export interface FrequencyPoint {
  freqKhz: number;
  amplitude: number;
  isAnomaly?: boolean;
}

export interface ScanFileResult {
  fileName: string;
  fileSize: string;
  mimeType: string;
  duration: string;
  tier: CallTier;
  syntheticProbability: number;
  analysisTimeMs: number;
  spectrogramChunks: number;
  spectralFluxAnomaly: number;
  vadScore: number;
  anomaliesDetected: string[];
  verdict: string;
  forensicPillars?: ForensicPillar[];
  c2paManifest: 'Valid' | 'Absent' | 'Tampered';
  nyquistCutoffKhz: number;
  modelConsensus: ModelConsensusBreakdown;
  frequencySpectrum: FrequencyPoint[];
  scanStageProgress?: number;
}

export interface SavedScanResult extends ScanFileResult {
  id: string;
  timestamp: string;
}

export interface ThreatIntelRecord {
  id: string;
  callerNumber: string;
  callerName: string;
  platform: VoIPPlatform;
  category: 'CEO Wire Fraud' | 'Bank Impersonation' | 'Family Bail Scam' | 'Police Warrant' | 'Crypto Phishing';
  threatLevel: 'Critical' | 'Elevated' | 'Suspect';
  reportedDate: string;
  reportsCount: number;
  upvotes: number;
  voiceCloneEngine: string; // e.g. 'ElevenLabs Multilingual v2', 'RVC v2', 'Tortoise TTS'
  audioSnippetText: string;
  locationArea: string;
  isVerifiedByIntel: boolean;
}
