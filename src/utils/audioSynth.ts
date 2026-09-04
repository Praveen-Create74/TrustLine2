/**
 * Web Audio Synthesizer for Android System Chimes and Simulated Call Audio
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSystemChime = (type: 'safe' | 'warning' | 'alert' | 'scan_tick' | 'hangup') => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'safe') {
      // Pleasant dual chime (F#5 -> B5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(739.99, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.25);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);
    } else if (type === 'alert') {
      // High-priority urgent pulse (B5 -> F5 repeating)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'warning') {
      // Caution amber tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'scan_tick') {
      // Subtle 7-second chunk completed tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'hangup') {
      // Android Call End Tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.setValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.debug('Audio chime playback omitted (browser policy or muted)', err);
  }
};

/**
 * Text-to-Speech simulation with optional robotic vocoder pitch modulation
 */
export const speakSimulatedAudio = (
  text: string,
  isDeepfake: boolean,
  onProgress?: (charIndex: number) => void,
  onEnd?: () => void
) => {
  if (!('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 3000);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (isDeepfake) {
    // Monotone, slightly higher pitch, metallic speed characteristic of TTS voice clone
    utterance.pitch = 0.85;
    utterance.rate = 1.08;
  } else {
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
  }

  utterance.onboundary = (e) => {
    if (onProgress) {
      onProgress(e.charIndex);
    }
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
