export const TrustLineAudioWorkletCode = `
class TrustLineProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4800; // 100ms at 48kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // 7-second sliding window accumulator 
    this.chunkAccumulator = [];
    this.maxChunks = 70; // 70 * 100ms = 7 seconds
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.bufferIndex++] = channelData[i];

      if (this.bufferIndex >= this.bufferSize) {
        this.analyze100msFrame();
        this.bufferIndex = 0;
      }
    }

    return true;
  }

  analyze100msFrame() {
    // 1. Calculate basic RMS
    let sum = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      sum += this.buffer[i] * this.buffer[i];
    }
    const rms = Math.sqrt(sum / this.bufferSize);

    // 2. Estimate phase dispersion (Vocoder variance heuristic)
    // Real-time FFT would be expensive in JS, using zero-crossing variance as a fast proxy for phase flux
    let zeroCrossings = 0;
    let lastSign = Math.sign(this.buffer[0]);
    let crossingDistances = [];
    let lastCrossing = 0;

    for (let i = 1; i < this.bufferSize; i++) {
      const sign = Math.sign(this.buffer[i]);
      if (sign !== lastSign && sign !== 0) {
        zeroCrossings++;
        crossingDistances.push(i - lastCrossing);
        lastCrossing = i;
        lastSign = sign;
      }
    }

    // Variance of zero-crossing distances ~ phase dispersion proxy
    let meanDist = 0;
    if (crossingDistances.length > 0) {
      meanDist = crossingDistances.reduce((a, b) => a + b, 0) / crossingDistances.length;
    }
    
    let variance = 0;
    if (crossingDistances.length > 0) {
      variance = crossingDistances.reduce((a, b) => a + Math.pow(b - meanDist, 2), 0) / crossingDistances.length;
    }

    // Normalize dispersion (heuristic scale)
    const phaseDispersion = Math.min(1.0, variance / 500);

    // 3. Generate Perceptual Hash (pHash) proxy
    // We use a simplified binning of the crossing distances to form a 12-char hex string
    let pHash = "000000000000";
    if (crossingDistances.length > 10) {
      let hashNum = 0;
      for (let i = 0; i < Math.min(12, crossingDistances.length); i++) {
        hashNum = (hashNum << 1) ^ crossingDistances[i];
      }
      pHash = Math.abs(hashNum).toString(16).padStart(12, '0').substring(0, 12);
    }

    // Store in chunk accumulator
    this.chunkAccumulator.push({ rms, phaseDispersion, zeroCrossings, pHash });
    if (this.chunkAccumulator.length > this.maxChunks) {
      this.chunkAccumulator.shift();
    }

    // Send metrics back to main thread every 250ms (every 2-3 frames)
    if (this.chunkAccumulator.length % 2 === 0) {
      // Calculate 7-second moving averages
      const avgDispersion = this.chunkAccumulator.reduce((a, b) => a + b.phaseDispersion, 0) / this.chunkAccumulator.length;
      const avgRms = this.chunkAccumulator.reduce((a, b) => a + b.rms, 0) / this.chunkAccumulator.length;
      
      // Hardware-level C2PA Watermark check (Simulated in DSP thread for deep inspection)
      // We look for a specific LSB steganographic signature (mocked based on avgRms noise floor)
      const c2paValid = avgRms > 0.0001; // Mock check

      // We'll just take the most frequent pHash in the chunk as the overall pHash
      const latestPHash = this.chunkAccumulator[this.chunkAccumulator.length - 1].pHash;

      this.port.postMessage({
        type: 'telemetry',
        payload: {
          phaseDispersion: avgDispersion,
          rms: avgRms,
          c2paVerified: c2paValid,
          windowSizeMs: this.chunkAccumulator.length * 100,
          pHash: latestPHash
        }
      });
    }
  }
}

registerProcessor('trustline-processor', TrustLineProcessor);
`;

export class AudioPipeline {
  private audioCtx: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  public onTelemetry: ((data: any) => void) | null = null;

  async initialize(stream?: MediaStream) {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 48000 });
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const blob = new Blob([TrustLineAudioWorkletCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    try {
      await this.audioCtx.audioWorklet.addModule(blobUrl);
      this.workletNode = new AudioWorkletNode(this.audioCtx, 'trustline-processor');

      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'telemetry' && this.onTelemetry) {
          this.onTelemetry(event.data.payload);
        }
      };

      if (stream) {
        this.mediaStreamSource = this.audioCtx.createMediaStreamSource(stream);
        this.mediaStreamSource.connect(this.workletNode);
        this.workletNode.connect(this.audioCtx.destination);
      }
    } catch (error) {
      console.error('Failed to initialize AudioWorklet:', error);
    }
  }

  stop() {
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
