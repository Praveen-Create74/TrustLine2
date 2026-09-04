const fs = require('fs');
let code = fs.readFileSync('src/context/TrustLineContext.tsx', 'utf8');

const targetFunc = `  // Start a simulated incoming call
  const startSimulatedCall = useCallback(async (scenarioId: string) => {
    const scenario = PRESET_CALL_SCENARIOS.find((s) => s.id === scenarioId) || PRESET_CALL_SCENARIOS[0];

    // Sub-millisecond Intel Lookup
    let intelRisk: CallTier | null = null;
    let intelScore = 0;
    try {
      const res = await fetch('/api/intel/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId: scenario.callerNumber })
      });
      const data = await res.json();
      if (data.success && data.threatFound) {
        if (data.data.riskLevel === 'High') {
          intelRisk = 'Fake';
          intelScore = 98;
        } else if (data.data.riskLevel === 'Medium') {
          intelRisk = 'Doubt';
          intelScore = 65;
        }
      }
    } catch (e) {
      console.warn("Intel lookup failed", e);
    }

    const initialTier: CallTier = intelRisk || (scenario.expectedTier === 'Fake' ? 'Fake' : scenario.expectedTier === 'Doubt' ? 'Doubt' : 'Trustable');
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
      chunkProgress: 10,
      localVadScore: 0.94,
      cloudEscalated: initialTier !== 'Trustable',
      syntheticProbability: intelScore || scenario.syntheticProbability,
      anomalyDetected: intelRisk ? "Community Flagged: High Risk" : (scenario.detectedAnomalies[0] || null),
      liveWaveform: [25, 40, 30, 60, 45, 50, 35, 40, 60, 35, 45, 30, 25, 20, 35, 50],
      isMuted: false,
      isSpeakerOn: true,
      scenarioId: scenario.id,
      vocoderDiscontinuityIndex: scenario.vocoderDiscontinuityIndex || (initialTier === 'Fake' ? 94.2 : initialTier === 'Doubt' ? 48.6 : 2.1),
      c2paManifest: scenario.c2paManifest || (initialTier === 'Trustable' ? 'Valid' : initialTier === 'Doubt' ? 'Absent' : 'Tampered'),
      semanticTriggers: scenario.semanticTriggers || [],
      cpuLoadPercent: scenario.cpuLoadPercent || (initialTier === 'Fake' ? 14.2 : initialTier === 'Doubt' ? 4.8 : 1.6),
      videoTelemetry: (scenario as any).videoTelemetry,
      verificationPrompt: (scenario as any).verificationPrompt,
    };

    setActiveCall(newCallState);
    setHudState({
      visible: true,
      mode: initialTier === 'Fake' ? 'alert' : 'compact',
      position: { x: 16, y: 90 },
      isDraggable: true,
      isDrawerExpanded: false,
    });
        
    if (initialTier === 'Fake') {
      playSystemChime('warning');
    } else {
      playSystemChime('safe');
    }
    
    showToast(\`Incoming \${scenario.platform} call from \${scenario.callerName}\`);

    setIsTestSimDrawerOpen(false);
  }, [showToast]);`;

const replacement = `  // Start a simulated incoming call
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
    showToast(\`Incoming \${scenario.platform} call from \${scenario.callerName}\`);
    setIsTestSimDrawerOpen(false);
    
    // Simulate answering the call shortly after
    setTimeout(() => {
      setActiveCall((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isInCall: true,
          isIncoming: false,
        };
      });
      if (typeof (window as any).speakSimulatedAudio === 'function') {
         (window as any).speakSimulatedAudio(scenario.simulatedSpeech, scenario.expectedTier === 'Fake');
      }
    }, 1500);

  }, [showToast]);`;

if (code.includes('const startSimulatedCall = useCallback(async (scenarioId: string) => {')) {
  // It's safer to just replace from "const startSimulatedCall =" to "}, [showToast]);"
  const startIdx = code.indexOf('const startSimulatedCall = useCallback');
  const endStr = '  }, [showToast]);';
  const endIdx = code.indexOf(endStr, startIdx) + endStr.length;
  
  if (startIdx !== -1 && endIdx !== -1) {
     const before = code.substring(0, startIdx);
     const after = code.substring(endIdx);
     
     // Remove "  // Start a simulated incoming call" if it's there
     fs.writeFileSync('src/context/TrustLineContext.tsx', before + replacement.replace('  // Start a simulated incoming call\n', '') + after);
     console.log("Successfully replaced!");
  } else {
     console.log("Could not find start or end index.");
  }
} else {
  console.log("Could not find target function.");
}
