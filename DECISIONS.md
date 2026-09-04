# TrustLine — Architecture & UI Decisions (DECISIONS.md)

## 1. System Overview & Tech Stack
- **Backend Infrastructure:** Real-time micro-batching service with streaming stateful session forensics, local signal heuristics, and multi-model AI cascade (`gemini-3.7-flash` / `gemini-1.5` structured output schemas).
- **AI Processing Pipeline:** Hybrid 2-Layer Model:
  - Layer 1: Zero-latency on-device acoustic & visual feature extraction (24 FPS visual anomaly mesh, 100ms WebAudio Mel-spectrogram FFT, glottal pulse jitter, and vocoder phase continuity).
  - Layer 2: Cloud AI inference (Gemini structured conversational context, prompt injection detection, and scam intent classification).
- **Frontend Architecture:** React 18, Tailwind CSS, Framer Motion, and HTML5 WebAudio/Canvas visualization.

## 2. Locked UI/UX States & Components
- **`LiveHUD.tsx` (Option A):** Sleek, floating minimalist badge in the top-right corner of the stream rendering active micro-batching animated frequency waveforms, roundtrip latency, on-device CPU load, and C2PA provenance status. Collapsible into a compact pill badge.
- **`RiskAlertCard.tsx` (Option B):** Persistent amber notification card sliding out from the top/side during ambiguous "Doubtful" states, displaying real-time dual telemetry meters (audio synthetic risk % and video visual sync offset +ms) with dynamic verification challenge prompts.
- **`ThreatOverrideModal.tsx` (Option A):** High-visibility crimson modal activated during verified "Fake" states, freezing the video interface, muting audio, and rendering emergency isolation options (*Emergency Disconnect Now*, *Block & Report to Intel Ledger*, *Fraud Protocol Lock*).
- **`PostCallDashboard.tsx` (Option B):** Interactive analytics grid with expandable tabs reviewing past session telemetry, 4 forensic biometric pillars, 7-second time-series chunk analysis, and multi-model consensus records.

## 3. Core Data Flow & Edge Case Rules
- **Micro-Batching Window:** Incoming live data is buffered in 5-to-7 second sliding chunks at 24 FPS video and 100ms audio VAD windows.
- **Conflict Resolution & Majority Voting:** If visual and acoustic layers conflict, the system defaults to a cautious "Doubtful" posture. Final call verdicts are decided by a weighted majority vote across time-series chunks.
- **Network Resilience:** Sub-second packet drops and VoIP jitter are flagged and separated from synthetic vocoder artifacts; major disconnects trigger media buffer stitching and re-evaluation.
- **Privacy & Data Security:** Server-side logging scrubs all personal identifiable information (PII), and raw audio/video streams are never stored on disk—only structured risk metadata, acoustic feature vectors, and forensic scores are written to the persistence store.
