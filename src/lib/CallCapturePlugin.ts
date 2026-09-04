import { registerPlugin } from '@capacitor/core';

export interface CallCapturePluginOptions {
  enableAudioCapture: boolean;
  captureWhatsApp: boolean;
  captureDialer: boolean;
}

export interface CallCapturePlugin {
  /**
   * Initializes the native service that listens to Telephony and Accessibility events.
   * This handles the native bindings for the AudioPlaybackCapture API on Android.
   */
  initialize(options: CallCapturePluginOptions): Promise<{ success: boolean }>;
  
  /**
   * Stop the capture and release native AudioRecord resources.
   */
  stopCapture(): Promise<{ success: boolean }>;

  /**
   * Add a listener for when raw PCM audio chunks are streamed from the native side.
   */
  addListener(
    eventName: 'onAudioChunkReceived',
    listenerFunc: (data: { chunkBase64: string; durationMs: number }) => void
  ): Promise<any>;

  /**
   * Add a listener for call state changes (Ringing, Answered, Ended) from native dialer/WhatsApp.
   */
  addListener(
    eventName: 'onCallStateChanged',
    listenerFunc: (state: { platform: string; isIncoming: boolean; state: 'RINGING' | 'ACTIVE' | 'DISCONNECTED'; callerNumber: string; callerName?: string }) => void
  ): Promise<any>;
}

export const CallCapture = registerPlugin<CallCapturePlugin>('CallCapture');
